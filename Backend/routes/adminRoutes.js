import express from "express";
import bcrypt from "bcryptjs";

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
router.get("/dashboard", adminAuth, async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalComments = await Comment.countDocuments();
    const totalReports = await Report.countDocuments();

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPosts,
        totalComments,
        totalReports,
      },
    });
  } catch (err) {
    next(err);
  }
});

/*
========================================================
REPORTS
========================================================
*/
router.get("/reports", adminAuth, async (req, res, next) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 });

    res.json({ success: true, reports });
  } catch (err) {
    next(err);
  }
});

/*
========================================================
POST MODERATION
========================================================
*/
router.delete("/posts/:id", adminAuth, async (req, res, next) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    await Report.deleteMany({ targetId: req.params.id });

    res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    next(err);
  }
});

/*
========================================================
COMMENT MODERATION
========================================================
*/
router.delete("/comments/:id", adminAuth, async (req, res, next) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    await Report.deleteMany({ targetId: req.params.id });

    res.json({ success: true, message: "Comment deleted" });
  } catch (err) {
    next(err);
  }
});

/*
========================================================
USER BAN
========================================================
*/
router.put("/users/:id/ban", adminAuth, async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true },
      { new: true }
    );

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

/*
========================================================
ADMIN MANAGEMENT (🔥 IMPORTANT)
========================================================
*/

// ➕ Create Admin
router.post("/admins", adminAuth, async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      email,
      password: hashedPassword,
      name,
    });

    res.json({ success: true, admin });
  } catch (err) {
    next(err);
  }
});

// 📋 Get All Admins
router.get("/admins", adminAuth, async (req, res, next) => {
  try {
    const admins = await Admin.find().select("-password");

    res.json({ success: true, admins });
  } catch (err) {
    next(err);
  }
});

// ❌ Delete Admin
router.delete("/admins/:id", adminAuth, async (req, res, next) => {
  try {
    await Admin.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Admin removed" });
  } catch (err) {
    next(err);
  }
});

export default router;