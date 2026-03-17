import express from "express";
import bcrypt from "bcryptjs";
import asyncHandler from "../middleware/asyncHandler.js";
import adminAuth from "../middleware/adminAuth.js";

import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import Report from "../models/Report.js";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

const router = express.Router();

/*
========================================================
ADMIN DASHBOARD
========================================================
*/
router.get(
  "/dashboard",
  adminAuth,
  asyncHandler(async (req, res) => {
    const [totalUsers, totalPosts, totalComments, totalReports] =
      await Promise.all([
        User.countDocuments(),
        Post.countDocuments(),
        Comment.countDocuments(),
        Report.countDocuments(),
      ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPosts,
        totalComments,
        totalReports,
      },
    });
  })
);

/*
========================================================
REPORTS
========================================================
*/
router.get(
  "/reports",
  adminAuth,
  asyncHandler(async (req, res) => {
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .populate("targetId")
      .populate("reportedBy", "username");

    res.json({ success: true, reports });
  })
);

/*
========================================================
POST MODERATION
========================================================
*/
router.delete(
  "/posts/:id",
  adminAuth,
  asyncHandler(async (req, res) => {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    await Report.deleteMany({ targetId: req.params.id });

    res.json({ success: true, message: "Post deleted" });
  })
);

/*
========================================================
COMMENT MODERATION
========================================================
*/
router.delete(
  "/comments/:id",
  adminAuth,
  asyncHandler(async (req, res) => {
    const comment = await Comment.findByIdAndDelete(req.params.id);

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    await Report.deleteMany({ targetId: req.params.id });

    res.json({ success: true, message: "Comment deleted" });
  })
);

/*
========================================================
USER BAN
========================================================
*/
router.put(
  "/users/:id/ban",
  adminAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  })
);

/*
========================================================
ADMIN MANAGEMENT
========================================================
*/

// ➕ Create Admin
router.post(
  "/admins",
  adminAuth,
  asyncHandler(async (req, res) => {
    let { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    email = email.toLowerCase();

    const existing = await Admin.findOne({ email });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      email,
      password: hashedPassword,
      name,
    });

    res.json({ success: true, admin });
  })
);

// 📋 Get All Admins
router.get(
  "/admins",
  adminAuth,
  asyncHandler(async (req, res) => {
    const admins = await Admin.find().select("-password");

    res.json({ success: true, admins });
  })
);

// ❌ Delete Admin
router.delete(
  "/admins/:id",
  adminAuth,
  asyncHandler(async (req, res) => {
    // Prevent self-delete
    if (req.admin._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete yourself",
      });
    }

    const admin = await Admin.findByIdAndDelete(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({ success: true, message: "Admin removed" });
  })
);

export default router;