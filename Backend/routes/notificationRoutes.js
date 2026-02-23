import express from "express";
import auth from "../middleware/auth.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// GET USER NOTIFICATIONS
router.get("/", auth, async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      notifications
    });

  } catch (err) {
    next(err);
  }
});

export default router;