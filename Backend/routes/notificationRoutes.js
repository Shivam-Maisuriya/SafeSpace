import express from "express";
import Notification from "../models/Notification.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// =========================
// GET USER NOTIFICATIONS
// =========================
router.get("/", auth, async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({
      success: true,
      notifications,
    });
  } catch (err) {
    next(err);
  }
});

// =========================
// MARK AS READ
// =========================
router.patch("/:id/read", auth, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
      },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      notification,
    });
  } catch (err) {
    next(err);
  }
});

// =========================
// DELETE NOTIFICATION
// =========================
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (err) {
    next(err);
  }
});

export default router;
