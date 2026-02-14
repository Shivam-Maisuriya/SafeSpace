import express from "express";
import Comment from "../models/Comment.js";
import auth from "../middleware/auth.js";

import { containsBadWords } from "../utils/badWords.js";
import { detectCrisis } from "../utils/crisisDetection.js";

const router = express.Router();

// Create Comment
router.post("/", auth, async (req, res) => {
  try {
    const { postId, content } = req.body;

    if (!postId || !content) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (req.user.isReadOnly) {
      return res.status(403).json({
        message: "Your account is in read-only mode.",
      });
    }

    if (containsBadWords(content)) {
      return res.status(400).json({
        message: "Comment contains inappropriate language.",
      });
    }

    if (detectCrisis(content)) {
      return res.status(200).json({
        crisis: true,
        message:
          "If you're in crisis, please seek professional support immediately.",
      });
    }

    const comment = await Comment.create({
      postId,
      authorId: req.user._id,
      content,
    });

    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: "Error creating comment" });
    console.log(err)
  }
});

// Get Comments for a Post
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({
      postId: req.params.postId,
    }).sort({ createdAt: 1 });

    const formattedComments = comments.map((comment) => {
      if (comment.isHidden) {
        return {
          ...comment._doc,
          content: "⚠️ This comment is under review.",
        };
      }
      return comment;
    });

    res.json(formattedComments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching comments" });
  }
});

export default router;
