import express from "express";
import Report from "../models/Report.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, async (req, res, next) => {
  try {
    const { type, targetId, reason } = req.body;

    if (!type || !targetId || !reason) {
      const error = new Error("Missing fields");
      error.status = 400;
      throw error;
    }

    if (!["post", "comment"].includes(type)) {
      const error = new Error("Invalid type");
      error.status = 400;
      throw error;
    }

    // Prevent duplicate reports
    const existingReport = await Report.findOne({
      type,
      targetId,
      reportedBy: req.user._id
    });

    if (existingReport) {
      const error = new Error("You already reported this.");
      error.status = 400;
      throw error;
    }

    await Report.create({
      type,
      targetId,
      reportedBy: req.user._id,
      reason
    });

    if (type === "post") {
      const updatedPost = await Post.findByIdAndUpdate(
        targetId,
        { $inc: { reportCount: 1 } },
        { new: true }
      );

      if (!updatedPost) {
        const error = new Error("Post not found");
        error.status = 404;
        throw error;
      }

      // AUTO-HIDE AFTER 5 REPORTS
      if (updatedPost.reportCount >= 5 && !updatedPost.isHidden) {
        updatedPost.isHidden = true;
        await updatedPost.save();

        await handleStrike(updatedPost.authorId, "post");
      }

    } else {
      const updatedComment = await Comment.findByIdAndUpdate(
        targetId,
        { $inc: { reportCount: 1 } },
        { new: true }
      );

      if (!updatedComment) {
        const error = new Error("Comment not found");
        error.status = 404;
        throw error;
      }

      if (updatedComment.reportCount >= 5 && !updatedComment.isHidden) {
        updatedComment.isHidden = true;
        await updatedComment.save();

        await handleStrike(updatedComment.authorId, "comment");
      }
    }

    res.json({
      success: true,
      message: "Reported successfully."
    });

  } catch (err) {
    next(err);
  }
});

// ---------------- STRIKE SYSTEM HELPER ----------------

async function handleStrike(userId, type) {
  const author = await User.findById(userId);

  if (!author) return;

  author.strikeCount += 1;

  // 3 strikes → 7-day ban
  if (author.strikeCount >= 3) {
    author.banExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );
    author.strikeCount = 0;
  }

  await author.save();

  await Notification.create({
    userId: author._id,
    message:
      type === "post"
        ? "One of your posts violated guidelines and received a strike."
        : "One of your comments violated guidelines and received a strike."
  });
}

export default router;