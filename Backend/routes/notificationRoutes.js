import express from "express";
import auth from "../middleware/auth.js";
import Notification from "../models/Notification.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const notifications = await Notification.find({
    userId: req.user._id
  }).sort({ createdAt: -1 });

  res.json(notifications);
});

export default router;
