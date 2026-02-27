import express from "express";
import Post from "../models/Post.js";
import auth from "../middleware/auth.js";
import { containsBadWords } from "../utils/badWords.js";
import { detectCrisis } from "../utils/crisisDetection.js";
import Reaction from "../models/Reaction.js";
import Report from "../models/Report.js";

const router = express.Router();

// =========================
// CREATE POST
// =========================
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

    if (containsBadWords(content)) {
      const error = new Error("Your message contains inappropriate language.");
      error.status = 400;
      throw error;
    }

    if (detectCrisis(content)) {
      return res.status(200).json({
        success: false,
        crisis: true,
        message:
          "If you're feeling overwhelmed or unsafe, please seek immediate professional help.",
      });
    }

    const post = await Post.create({
      authorId: req.user._id,
      content,
      moodTag,
      mode,
    });

    res.status(201).json({
      success: true,
      post,
    });
  } catch (err) {
    next(err);
  }
});

// =========================
// GET FEED POSTS
// =========================
router.get("/", auth, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const lastId = req.query.lastId;

    const query = { isHidden: false };

    if (lastId) {
      query._id = { $lt: lastId };
    }

    const posts = await Post.find(query)
      .sort({ _id: -1 }) // important for cursor
      .limit(limit)
      .lean();

    const postIds = posts.map((p) => p._id);

    const reactions = await Reaction.aggregate([
      { $match: { postId: { $in: postIds } } },
      {
        $group: {
          _id: { postId: "$postId", type: "$type" },
          count: { $sum: 1 },
        },
      },
    ]);

    const userReactions = await Reaction.find({
      postId: { $in: postIds },
      userId: req.user._id,
    }).lean();

    const userReports = await Report.find({
      type: "post",
      targetId: { $in: postIds },
      reportedBy: req.user._id,
    }).lean();

    const reportedPostIds = new Set(
      userReports.map((r) => r.targetId.toString()),
    );

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
        (r) => r.postId.toString() === post._id.toString(),
      );

      return {
        ...post,
        reactionCounts,
        userReaction: userReactionObj ? userReactionObj.type : null,
        hasReported: reportedPostIds.has(post._id.toString()),
      };
    });

    res.json({
      success: true,
      posts: formattedPosts,
      hasMore: posts.length === limit,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
