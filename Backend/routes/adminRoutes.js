import express from "express";
import auth from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import Report from "../models/Report.js";
import User from "../models/User.js";

const router = express.Router();

/*
========================================================
ADMIN DASHBOARD STATS
========================================================
*/
router.get(
  "/dashboard",
  auth,
  requireRole(["admin", "superadmin"]),
  async (req, res, next) => {
    try {
      const totalUsers = await User.countDocuments();
      const totalPosts = await Post.countDocuments();
      const totalComments = await Comment.countDocuments();
      const totalReports = await Report.countDocuments();

      const hiddenPosts = await Post.countDocuments({ isHidden: true });
      const hiddenComments = await Comment.countDocuments({ isHidden: true });

      const activeBans = await User.countDocuments({
        banExpiresAt: { $gt: new Date() },
      });

      res.json({
        success: true,
        stats: {
          totalUsers,
          totalPosts,
          totalComments,
          totalReports,
          hiddenPosts,
          hiddenComments,
          activeBans,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/*
========================================================
GET ALL REPORTS
========================================================
*/
router.get(
  "/reports",
  auth,
  requireRole(["moderator", "admin", "superadmin"]),
  async (req, res, next) => {
    try {
      const reports = await Report.find()
        .sort({ createdAt: -1 })
        .populate("reportedBy", "username email");

      res.json({ success: true, reports });
    } catch (err) {
      next(err);
    }
  }
);

/*
========================================================
HIDDEN POSTS
========================================================
*/
router.get(
  "/posts/hidden",
  auth,
  requireRole(["moderator", "admin", "superadmin"]),
  async (req, res, next) => {
    try {
      const posts = await Post.find({ isHidden: true }).sort({
        updatedAt: -1,
      });
      res.json({ success: true, posts });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/posts/:id/restore",
  auth,
  requireRole(["moderator", "admin", "superadmin"]),
  async (req, res, next) => {
    try {
      const post = await Post.findByIdAndUpdate(
        req.params.id,
        { isHidden: false, reportCount: 0 },
        { new: true }
      );

      if (!post)
        return res.status(404).json({ success: false, message: "Post not found" });

      await Report.deleteMany({ targetId: req.params.id });

      res.json({ success: true, message: "Post restored", post });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/posts/:id",
  auth,
  requireRole(["admin", "superadmin"]),
  async (req, res, next) => {
    try {
      const post = await Post.findByIdAndDelete(req.params.id);

      if (!post)
        return res.status(404).json({ success: false, message: "Post not found" });

      await Report.deleteMany({ targetId: req.params.id });

      res.json({ success: true, message: "Post deleted permanently." });
    } catch (err) {
      next(err);
    }
  }
);

/*
========================================================
HIDDEN COMMENTS
========================================================
*/
router.get(
  "/comments/hidden",
  auth,
  requireRole(["moderator", "admin", "superadmin"]),
  async (req, res, next) => {
    try {
      const comments = await Comment.find({ isHidden: true });
      res.json({ success: true, comments });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/comments/:id/restore",
  auth,
  requireRole(["moderator", "admin", "superadmin"]),
  async (req, res, next) => {
    try {
      const comment = await Comment.findByIdAndUpdate(
        req.params.id,
        { isHidden: false, reportCount: 0 },
        { new: true }
      );

      if (!comment)
        return res.status(404).json({ success: false, message: "Comment not found" });

      await Report.deleteMany({ targetId: req.params.id });

      res.json({ success: true, message: "Comment restored", comment });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/comments/:id",
  auth,
  requireRole(["admin", "superadmin"]),
  async (req, res, next) => {
    try {
      const comment = await Comment.findByIdAndDelete(req.params.id);

      if (!comment)
        return res.status(404).json({ success: false, message: "Comment not found" });

      await Report.deleteMany({ targetId: req.params.id });

      res.json({ success: true, message: "Comment deleted permanently." });
    } catch (err) {
      next(err);
    }
  }
);

/*
========================================================
USER MODERATION
========================================================
*/

// Permanent Ban
router.put(
  "/users/:id/ban",
  auth,
  requireRole(["admin", "superadmin"]),
  async (req, res, next) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isBanned: true },
        { new: true }
      );

      if (!user)
        return res.status(404).json({ success: false, message: "User not found" });

      res.json({ success: true, message: "User banned.", user });
    } catch (err) {
      next(err);
    }
  }
);

// Unban
router.put(
  "/users/:id/unban",
  auth,
  requireRole(["admin", "superadmin"]),
  async (req, res, next) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isBanned: false, banExpiresAt: null },
        { new: true }
      );

      if (!user)
        return res.status(404).json({ success: false, message: "User not found" });

      res.json({ success: true, message: "User unbanned.", user });
    } catch (err) {
      next(err);
    }
  }
);

// Temporary Ban
router.put(
  "/users/:id/tempban",
  auth,
  requireRole(["admin", "superadmin"]),
  async (req, res, next) => {
    try {
      const { days } = req.body;

      if (!days || days <= 0)
        return res.status(400).json({
          success: false,
          message: "Invalid number of days",
        });

      const banUntil = new Date(
        Date.now() + days * 24 * 60 * 60 * 1000
      );

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { banExpiresAt: banUntil },
        { new: true }
      );

      if (!user)
        return res.status(404).json({ success: false, message: "User not found" });

      res.json({ success: true, message: "User temporarily banned.", user });
    } catch (err) {
      next(err);
    }
  }
);

// Read Only Mode
router.put(
  "/users/:id/readonly",
  auth,
  requireRole(["admin", "superadmin"]),
  async (req, res, next) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isReadOnly: true },
        { new: true }
      );

      if (!user)
        return res.status(404).json({ success: false, message: "User not found" });

      res.json({ success: true, message: "User set to read-only.", user });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/users/:id/remove-readonly",
  auth,
  requireRole(["admin", "superadmin"]),
  async (req, res, next) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isReadOnly: false },
        { new: true }
      );

      if (!user)
        return res.status(404).json({ success: false, message: "User not found" });

      res.json({ success: true, message: "Read-only removed.", user });
    } catch (err) {
      next(err);
    }
  }
);

export default router;