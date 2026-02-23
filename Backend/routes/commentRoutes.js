import express from "express";
import Comment from "../models/Comment.js";
import auth from "../middleware/auth.js";

import { containsBadWords } from "../utils/badWords.js";
import { detectCrisis } from "../utils/crisisDetection.js";

const router = express.Router();

// CREATE COMMENT
router.post("/", auth, async (req, res, next) => {
  try {
    const { postId, content } = req.body;

    if (!postId || !content) {
      const error = new Error("Missing fields");
      error.status = 400;
      throw error;
    }

    if (req.user.isReadOnly) {
      const error = new Error("Your account is in read-only mode.");
      error.status = 403;
      throw error;
    }

    if (containsBadWords(content)) {
      const error = new Error("Comment contains inappropriate language.");
      error.status = 400;
      throw error;
    }

    if (detectCrisis(content)) {
      return res.status(200).json({
        success: false,
        crisis: true,
        message:
          "If you're in crisis, please seek professional support immediately."
      });
    }

    const comment = await Comment.create({
      postId,
      authorId: req.user._id,
      content
    });

    res.status(201).json({
      success: true,
      comment
    });

  } catch (err) {
    next(err);
  }
});

// GET COMMENTS FOR A POST
router.get("/:postId", async (req, res, next) => {
  try {
    const comments = await Comment.find({
      postId: req.params.postId
    }).sort({ createdAt: 1 });

    const formattedComments = comments.map((comment) => {
      if (comment.isHidden) {
        return {
          ...comment._doc,
          content: "⚠️ This comment is under review."
        };
      }
      return comment;
    });

    res.json({
      success: true,
      comments: formattedComments
    });

  } catch (err) {
    next(err);
  }
});

export default router;