import express from "express";
import Post from "../models/Post.js";
import auth from "../middleware/auth.js";
import { containsBadWords } from "../utils/badWords.js";
import { detectCrisis } from "../utils/crisisDetection.js";
import Reaction from "../models/Reaction.js";
import Report from "../models/Report.js";
import Comment from "../models/Comment.js";

const router = express.Router();

// =========================
// CREATE POST
// =========================
router.post("/", auth, async (req, res, next) => {
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

    if (containsBadWords(content)) {
      return res.status(400).json({
        message: "Your message contains inappropriate language.",
      });
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
// GET FEED POSTS (Cursor Pagination)
// =========================
router.get("/", auth, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const lastId = req.query.lastId;

    const query = { isHidden: false };

    // Cursor logic
    if (lastId) {
      query._id = { $lt: lastId };
    }

    // Fetch posts
    const posts = await Post.find(query)
      .sort({ _id: -1 }) // newest first
      .limit(limit)
      .lean();

    const postIds = posts.map((p) => p._id);

    if (postIds.length === 0) {
      return res.json({
        success: true,
        posts: [],
        hasMore: false,
      });
    }

    // =========================
    // Reaction Aggregation
    // =========================
    const reactions = await Reaction.aggregate([
      { $match: { postId: { $in: postIds } } },
      {
        $group: {
          _id: { postId: "$postId", type: "$type" },
          count: { $sum: 1 },
        },
      },
    ]);

    // =========================
    // Comment Count Aggregation
    // =========================
    const commentCounts = await Comment.aggregate([
      { $match: { postId: { $in: postIds }, isHidden: false } },
      {
        $group: {
          _id: "$postId",
          count: { $sum: 1 },
        },
      },
    ]);

    // =========================
    // Current User Reactions
    // =========================
    const userReactions = await Reaction.find({
      postId: { $in: postIds },
      userId: req.user._id,
    }).lean();

    // =========================
    // Current User Reports
    // =========================
    const userReports = await Report.find({
      type: "post",
      targetId: { $in: postIds },
      reportedBy: req.user._id,
    }).lean();

    const reportedPostIds = new Set(
      userReports.map((r) => r.targetId.toString())
    );

    // =========================
    // Format Final Feed
    // =========================
    const formattedPosts = posts.map((post) => {
      const reactionCounts = {
        relate: 0,
        alone: 0,
        helpful: 0,
        support: 0,
      };

      // Attach reaction counts
      reactions.forEach((r) => {
        if (r._id.postId.toString() === post._id.toString()) {
          reactionCounts[r._id.type] = r.count;
        }
      });

      // Attach comment count
      const commentObj = commentCounts.find(
        (c) => c._id.toString() === post._id.toString()
      );

      // Attach user reaction
      const userReactionObj = userReactions.find(
        (r) => r.postId.toString() === post._id.toString()
      );

      return {
        ...post,
        reactionCounts,
        userReaction: userReactionObj ? userReactionObj.type : null,
        hasReported: reportedPostIds.has(post._id.toString()),
        commentCount: commentObj ? commentObj.count : 0,
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

// =========================
// GET MY POSTS (PROFILE)
// =========================
router.get("/me", auth, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const lastId = req.query.lastId;

    const query = {
      authorId: req.user._id,
    };

    if (lastId) {
      query._id = { $lt: lastId };
    }

    const posts = await Post.find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      posts,
      hasMore: posts.length === limit,
    });
  } catch (err) {
    next(err);
  }
});

// =========================
// DELETE MY POST
// =========================
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      authorId: req.user._id,
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or unauthorized",
      });
    }

    await post.deleteOne();

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (err) {
    next(err);
  }
});

// =========================
// UPDATE MY POST
// =========================
router.patch("/:id", auth, async (req, res, next) => {
  try {
    const { content, moodTag, mode } = req.body;

    const post = await Post.findOne({
      _id: req.params.id,
      authorId: req.user._id,
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or unauthorized",
      });
    }

    if (content) post.content = content;
    if (moodTag) post.moodTag = moodTag;
    if (mode) post.mode = mode;

    await post.save();

    res.json({
      success: true,
      post,
    });
  } catch (err) {
    next(err);
  }
});

export default router;