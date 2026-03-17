import express from "express";
import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import generateUsername from "../utils/generateUsername.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();

// Anonymous Login
router.post(
  "/anonymous",
  asyncHandler(async (req, res) => {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT secret not configured",
      });
    }

    // 🔥 Ensure UNIQUE username
    let username;
    let exists = true;

    while (exists) {
      username = generateUsername();
      exists = await User.findOne({ username });
    }

    const user = await User.create({
      anonId: uuid(),
      username,
    });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
      },
    });
  })
);

export default router;