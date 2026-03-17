import express from "express";
import Report from "../models/Report.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import auth from "../middleware/auth.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();

/*
========================================================
CREATE REPORT
========================================================
*/
router.post(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    const { type, targetId, reason } = req.body;

    if (!type || !targetId || !reason) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    if (!["post", "comment"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type",
      });
    }

    // 🔍 Validate target FIRST
    let target;
    if (type === "post") {
      target = await Post.findById(targetId);
    } else {
      target = await Comment.findById(targetId);
    }

    if (!target) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`,
      });
    }

    // 🚫 Prevent duplicate report
    const existingReport = await Report.findOne({
      type,
      targetId,
      reportedBy: req.user._id,
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: "You already reported this.",
      });
    }

    await Report.create({
      type,
      targetId,
      reportedBy: req.user._id,
      reason,
    });

    // 📊 Increment report count
    target.reportCount += 1;

    // 🚨 Auto-hide after 5 reports
    if (target.reportCount >= 5 && !target.isHidden) {
      target.isHidden = true;
      await handleStrike(target.authorId, type);
    }

    await target.save();

    res.json({
      success: true,
      message: "Reported successfully.",
    });
  })
);

/*
========================================================
STRIKE SYSTEM
========================================================
*/
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
        : "One of your comments violated guidelines and received a strike.",
  });
}

export default router;