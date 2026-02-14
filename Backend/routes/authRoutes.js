import express from "express";
import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import generateUsername from "../utils/generateUsername.js";

const router = express.Router();

router.post("/anonymous", async (req, res) => {
  try {
    const user = await User.create({
      anonId: uuid(),
      username: generateUsername()
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d"
    });

    res.json({ token, username: user.username });

  } catch (err) {
    res.status(500).json({ message: "Error creating user" });
  }
});

export default router;
