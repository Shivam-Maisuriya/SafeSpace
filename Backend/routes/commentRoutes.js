import express from "express";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import auth from "../middleware/auth.js";
import asyncHandler from "../middleware/asyncHandler.js";

import { containsBadWords } from "../utils/badWords.js";
import { detectCrisis } from "../utils/crisisDetection.js";

const router = express.Router();

/*
========================================================
CREATE COMMENT
========================================================
*/
router.post(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    const { postId, content } = req.body;

    if (!postId || !content) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    if (req.user.isReadOnly) {
      return res.status(403).json({
        success: false,
        message: "Your account is in read-only mode.",
      });
    }

    // Validate post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Bad words filter
    if (containsBadWords(content)) {
      return res.status(400).json({
        success: false,
        message: "Comment contains inappropriate language.",
      });
    }

    // Crisis detection
    if (detectCrisis(content)) {
      return res.status(200).json({
        success: false,
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

    res.status(201).json({
      success: true,
      comment,
    });
  })
);

/*
========================================================
GET COMMENTS FOR A POST
========================================================
*/
router.get(
  "/:postId",
  asyncHandler(async (req, res) => {
    const comments = await Comment.find({
      postId: req.params.postId,
    })
      .sort({ createdAt: 1 })
      .lean();

    const formattedComments = comments.map((comment) => {
      if (comment.isHidden) {
        return {
          _id: comment._id,
          postId: comment.postId,
          createdAt: comment.createdAt,
          content: "⚠️ This comment is under review.",
        };
      }

      return comment;
    });

    res.json({
      success: true,
      comments: formattedComments,
    });
  })
);

export default router;