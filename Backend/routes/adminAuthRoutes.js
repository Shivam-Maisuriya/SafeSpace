import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();

// ADMIN LOGIN
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    let { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    email = email.toLowerCase();

    const admin = await Admin.findOne({ email });

    // Always compare to prevent timing attacks
    const isMatch = admin
      ? await bcrypt.compare(password, admin.password)
      : false;

    if (!admin || !isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        adminId: admin._id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
      },
    });
  })
);

export default router;