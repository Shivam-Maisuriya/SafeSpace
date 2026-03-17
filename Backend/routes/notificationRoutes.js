import express from "express";
import Notification from "../models/Notification.js";
import auth from "../middleware/auth.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();

/*
========================================================
GET USER NOTIFICATIONS
========================================================
*/
router.get(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 30;

    const notifications = await Notification.find({
      userId: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    res.json({
      success: true,
      notifications,
      unreadCount,
    });
  })
);

/*
========================================================
MARK ONE AS READ
========================================================
*/
router.patch(
  "/:id/read",
  auth,
  asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
      },
      { isRead: true },
      { new: true }
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
  })
);

/*
========================================================
MARK ALL AS READ (🔥 NEW)
========================================================
*/
router.patch(
  "/read-all",
  auth,
  asyncHandler(async (req, res) => {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  })
);

/*
========================================================
DELETE NOTIFICATION
========================================================
*/
router.delete(
  "/:id",
  auth,
  asyncHandler(async (req, res) => {
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
  })
);

export default router;