import express from "express";
import Post from "../models/Post.js";
import auth from "../middleware/auth.js";
import { containsBadWords } from "../utils/badWords.js";
import { detectCrisis } from "../utils/crisisDetection.js";
import Reaction from "../models/Reaction.js";

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
router.get("/", auth, async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(50);

    const postIds = posts.map((post) => post._id);

    // Aggregate reaction counts
    const reactions = await Reaction.aggregate([
      { $match: { postId: { $in: postIds } } },
      {
        $group: {
          _id: { postId: "$postId", type: "$type" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get current user's reactions
    const userReactions = await Reaction.find({
      postId: { $in: postIds },
      userId: req.user._id,
    });

    const formattedPosts = posts.map((post) => {
      const reactionCounts = {
        relate: 0,
        alone: 0,
        helpful: 0,
        support: 0,
      };

      reactions.forEach((r) => {
        if (r._id.postId.toString() === post._id.toString()) {
          reactionCounts[r._id.type] = r.count;
        }
      });

      const userReactionObj = userReactions.find(
        (r) => r.postId.toString() === post._id.toString()
      );

      return {
        ...post._doc,
        reactionCounts,
        userReaction: userReactionObj ? userReactionObj.type : null,
      };
    });

    res.json({
      success: true,
      posts: formattedPosts,
    });

  } catch (err) {
    next(err);
  }
});


export default router;