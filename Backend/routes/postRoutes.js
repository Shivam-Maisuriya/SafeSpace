import express from "express";
import Post from "../models/Post.js";
import auth from "../middleware/auth.js";
import { containsBadWords } from "../utils/badWords.js";
import { detectCrisis } from "../utils/crisisDetection.js";

const router = express.Router();

// CREATE POST
router.post("/", auth, async (req, res, next) => {
  try {
    const { content, moodTag, mode } = req.body;

    if (!content || !moodTag || !mode) {
      const error = new Error("Missing fields");
      error.status = 400;
      throw error;
    }

    if (req.user.isReadOnly) {
      const error = new Error("Your account is in read-only mode.");
      error.status = 403;
      throw error;
    }

    // Block bad words
    if (containsBadWords(content)) {
      const error = new Error("Your message contains inappropriate language.");
      error.status = 400;
      throw error;
    }

    // Crisis detection
    if (detectCrisis(content)) {
      return res.status(200).json({
        success: false,
        crisis: true,
        message:
          "If you're feeling overwhelmed or unsafe, please seek immediate professional help."
      });
    }

    const post = await Post.create({
      authorId: req.user._id, // ✅ FIXED
      content,
      moodTag,
      mode
    });

    res.status(201).json({
      success: true,
      post
    });

  } catch (err) {
    next(err);
  }
});

// GET ALL POSTS (FEED)
router.get("/", async (req, res, next) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(50);

    const formattedPosts = posts.map((post) => {
      if (post.isHidden) {
        return {
          ...post._doc,
          content: "⚠️ This content is under review by moderators."
        };
      }
      return post;
    });

    res.json({
      success: true,
      posts: formattedPosts
    });

  } catch (err) {
    next(err);
  }
});

export default router;