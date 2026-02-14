import express from "express";
import Post from "../models/Post.js";
import auth from "../middleware/auth.js";
import { containsBadWords } from "../utils/badWords.js";
import { detectCrisis } from "../utils/crisisDetection.js";

const router = express.Router();

// CREATE POST
router.post("/", auth, async (req, res) => {
  try {
    const { content, moodTag, mode } = req.body;

    if (!content || !moodTag || !mode) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (req.user.isReadOnly) {
      return res.status(403).json({
        message: "Your account is in read-only mode.",
      });
    }

    // Block bad words
    if (containsBadWords(content)) {
      return res.status(400).json({
        message: "Your message contains inappropriate language.",
      });
    }

    // Crisis detection
    if (detectCrisis(content)) {
      return res.status(200).json({
        crisis: true,
        message:
          "If you're feeling overwhelmed or unsafe, please seek immediate professional help.",
      });
    }

    const post = await Post.create({
      authorId: req.userId,
      content,
      moodTag,
      mode,
    });

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Error creating post" });
  }
});

// GET ALL POSTS (FEED)
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(50);

    const formattedPosts = posts.map((post) => {
      if (post.isHidden) {
        return {
          ...post._doc,
          content: "⚠️ This content is under review by moderators.",
        };
      }
      return post;
    });

    res.json(formattedPosts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

export default router;
