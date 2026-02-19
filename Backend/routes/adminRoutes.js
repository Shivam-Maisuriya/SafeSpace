import express from "express";
import auth from "../middleware/auth.js";
import adminOnly from "../middleware/admin.js";
import asyncHandler from "../middleware/asyncHandler.js";

import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import Report from "../models/Report.js";
import User from "../models/User.js";

const router = express.Router();

// ------------------------------------------------------------------------------------------------

// Get Hidden Posts
router.get(
  "/posts/hidden",
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const posts = await Post.find({ isHidden: true }).sort({ updatedAt: -1 });
    res.json(posts);
  })
);

// Restore Post
router.put(
  "/posts/:id/restore",
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { isHidden: false, reportCount: 0 },
      { new: true }
    );

    if (!post) {
      const error = new Error("Post not found");
      error.status = 404;
      throw error;
    }

    await Report.deleteMany({ targetId: req.params.id });

    res.json({ message: "Post restored", post });
  })
);

// Delete Post Permanently
router.delete(
  "/posts/:id",
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      const error = new Error("Post not found");
      error.status = 404;
      throw error;
    }

    await Report.deleteMany({ targetId: req.params.id });

    res.json({ message: "Post deleted permanently." });
  })
);

// ------------------------------------------------------------------------------------------------

// Get Hidden Comments
router.get(
  "/comments/hidden",
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const comments = await Comment.find({ isHidden: true });
    res.json(comments);
  })
);

// Restore Comment
router.put(
  "/comments/:id/restore",
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { isHidden: false, reportCount: 0 },
      { new: true }
    );

    if (!comment) {
      const error = new Error("Comment not found");
      error.status = 404;
      throw error;
    }

    await Report.deleteMany({ targetId: req.params.id });

    res.json({ message: "Comment restored.", comment });
  })
);

// Delete Comment Permanently
router.delete(
  "/comments/:id",
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const comment = await Comment.findByIdAndDelete(req.params.id);

    if (!comment) {
      const error = new Error("Comment not found");
      error.status = 404;
      throw error;
    }

    await Report.deleteMany({ targetId: req.params.id });

    res.json({ message: "Comment deleted permanently." });
  })
);

// ------------------------------------------------------------------------------------------------

// Ban User
router.put(
  "/users/:id/ban",
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true },
      { new: true }
    );

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    res.json({ message: "User banned successfully.", user });
  })
);

// Unban User
router.put(
  "/users/:id/unban",
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: false },
      { new: true }
    );

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    res.json({ message: "User unbanned successfully.", user });
  })
);

// Temporary Ban
router.put(
  "/users/:id/tempban",
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { days } = req.body;

    if (!days || days <= 0) {
      const error = new Error("Invalid number of days");
      error.status = 400;
      throw error;
    }

    const banUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { banExpiresAt: banUntil },
      { new: true }
    );

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    res.json({ message: "User temporarily banned.", user });
  })
);

// Set Read-Only
router.put(
  "/users/:id/readonly",
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isReadOnly: true },
      { new: true }
    );

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    res.json({ message: "User set to read-only.", user });
  })
);

// Remove Read-Only
router.put(
  "/users/:id/remove-readonly",
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isReadOnly: false },
      { new: true }
    );

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    res.json({ message: "Read-only removed.", user });
  })
);

export default router;
