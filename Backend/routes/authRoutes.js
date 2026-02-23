import express from "express";
import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import generateUsername from "../utils/generateUsername.js";

const router = express.Router();

// Anonymous Login
router.post("/anonymous", async (req, res, next) => {
  try {
    const user = await User.create({
      anonId: uuid(),
      username: generateUsername()
    });

    if (!process.env.JWT_SECRET) {
      const error = new Error("JWT secret not configured");
      error.status = 500;
      throw error;
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({
      success: true,
      token,
      username: user.username
    });

  } catch (err) {
    next(err);
  }
});

export default router;