import express from "express";
import Report from "../models/Report.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { type, targetId, reason } = req.body;

    if (!type || !targetId || !reason) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (!["post", "comment"].includes(type)) {
      return res.status(400).json({ message: "Invalid type" });
    }

    // Prevent duplicate reports by same user
    const existingReport = await Report.findOne({
      type,
      targetId,
      reportedBy: req.user._id,
    });

    if (existingReport) {
      return res.status(400).json({ message: "You already reported this." });
    }

    await Report.create({
      type,
      targetId,
      reportedBy: req.user._id,
      reason,
    });

    // Increase report count
    if (type === "post") {
      const updatedPost = await Post.findByIdAndUpdate(
        targetId,
        { $inc: { reportCount: 1 } },
        { new: true },
      );

      // AUTO-HIDE POSTS AFTER 5 REPORTS
      if (updatedPost.reportCount >= 5 && !updatedPost.isHidden) {
        updatedPost.isHidden = true;
        await updatedPost.save();

        // STRIKE SYSTEM
        const author = await User.findById(updatedPost.authorId);

        if (author) {
          author.strikeCount += 1;

          // If 3 strikes → 7 day temporary ban
          if (author.strikeCount >= 3) {
            author.banExpiresAt = new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000,
            );
            author.strikeCount = 0; // reset strikes
          }

          await author.save();

          // Optional notification
          await Notification.create({
            userId: author._id,
            message:
              "One of your posts violated guidelines and received a strike.",
          });
        }
      }
    } else {
      const updatedComment = await Comment.findByIdAndUpdate(
        targetId,
        { $inc: { reportCount: 1 } },
        { new: true },
      );

      // AUTO-HIDE COMMENT AFTER 5 REPORTS
      if (updatedComment.reportCount >= 5 && !updatedComment.isHidden) {
        updatedComment.isHidden = true;
        await updatedComment.save();

        //  STRIKE SYSTEM
        const author = await User.findById(updatedComment.authorId);

        if (author) {
          author.strikeCount += 1;

          if (author.strikeCount >= 3) {
            author.banExpiresAt = new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000,
            );
            author.strikeCount = 0;
          }

          await author.save();

          await Notification.create({
            userId: author._id,
            message:
              "One of your comments violated guidelines and received a strike.",
          });
        }
      }
    }

    res.json({ message: "Reported successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error reporting content." });
  }
});

export default router;
