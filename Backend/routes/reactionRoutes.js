import express from "express";
import Reaction from "../models/Reaction.js";
import Post from "../models/Post.js";
import auth from "../middleware/auth.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();

const VALID_REACTIONS = ["relate", "alone", "helpful", "support"];

/*
========================================================
TOGGLE REACTION
========================================================
*/
router.post(
  "/:postId",
  auth,
  asyncHandler(async (req, res) => {
    const { type } = req.body;
    const { postId } = req.params;

    // Validate reaction type
    if (!VALID_REACTIONS.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reaction type",
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

    const existingReaction = await Reaction.findOne({
      postId,
      userId: req.user._id,
    });

    // ➕ CREATE
    if (!existingReaction) {
      await Reaction.create({
        postId,
        userId: req.user._id,
        type,
      });

      return res.json({
        success: true,
        action: "created",
        type,
      });
    }

    // ❌ REMOVE
    if (existingReaction.type === type) {
      await existingReaction.deleteOne();

      return res.json({
        success: true,
        action: "removed",
      });
    }

    // 🔄 UPDATE
    existingReaction.type = type;
    await existingReaction.save();

    res.json({
      success: true,
      action: "updated",
      type,
    });
  })
);

export default router;