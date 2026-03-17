import express from "express";
import Post from "../models/Post.js";
import auth from "../middleware/auth.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { containsBadWords } from "../utils/badWords.js";
import { detectCrisis } from "../utils/crisisDetection.js";
import Reaction from "../models/Reaction.js";
import Report from "../models/Report.js";
import Comment from "../models/Comment.js";

const router = express.Router();

/*
========================================================
CREATE POST
========================================================
*/
router.post(
  "/",
  auth,
  asyncHandler(async (req, res) => {
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
          "If you're feeling overwhelmed or unsafe, please seek immediate help.",
      });
    }

    const post = await Post.create({
      authorId: req.user._id,
      content,
      moodTag,
      mode,
    });

    res.status(201).json({ success: true, post });
  })
);

/*
========================================================
GET FEED POSTS
========================================================
*/
router.get(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const lastId = req.query.lastId;

    const query = { isHidden: false };

    if (lastId) query._id = { $lt: lastId };

    const posts = await Post.find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .lean();

    const postIds = posts.map((p) => p._id);

    if (!postIds.length) {
      return res.json({ success: true, posts: [], hasMore: false });
    }

    // Convert to maps (⚡ performance boost)
    const reactionsRaw = await Reaction.aggregate([
      { $match: { postId: { $in: postIds } } },
      {
        $group: {
          _id: { postId: "$postId", type: "$type" },
          count: { $sum: 1 },
        },
      },
    ]);

    const reactionMap = {};
    reactionsRaw.forEach((r) => {
      const postId = r._id.postId.toString();
      if (!reactionMap[postId]) {
        reactionMap[postId] = {
          relate: 0,
          alone: 0,
          helpful: 0,
          support: 0,
        };
      }
      reactionMap[postId][r._id.type] = r.count;
    });

    const commentCountsRaw = await Comment.aggregate([
      { $match: { postId: { $in: postIds }, isHidden: false } },
      { $group: { _id: "$postId", count: { $sum: 1 } } },
    ]);

    const commentMap = {};
    commentCountsRaw.forEach((c) => {
      commentMap[c._id.toString()] = c.count;
    });

    const userReactions = await Reaction.find({
      postId: { $in: postIds },
      userId: req.user._id,
    }).lean();

    const userReactionMap = {};
    userReactions.forEach((r) => {
      userReactionMap[r.postId.toString()] = r.type;
    });

    const userReports = await Report.find({
      type: "post",
      targetId: { $in: postIds },
      reportedBy: req.user._id,
    }).lean();

    const reportedSet = new Set(
      userReports.map((r) => r.targetId.toString())
    );

    const formattedPosts = posts.map((post) => {
      const id = post._id.toString();

      return {
        ...post,
        reactionCounts: reactionMap[id] || {
          relate: 0,
          alone: 0,
          helpful: 0,
          support: 0,
        },
        userReaction: userReactionMap[id] || null,
        hasReported: reportedSet.has(id),
        commentCount: commentMap[id] || 0,
      };
    });

    res.json({
      success: true,
      posts: formattedPosts,
      hasMore: posts.length === limit,
    });
  })
);

/*
========================================================
GET MY POSTS
========================================================
*/
router.get(
  "/me",
  auth,
  asyncHandler(async (req, res) => {
    const posts = await Post.find({ authorId: req.user._id })
      .sort({ _id: -1 })
      .lean();

    res.json({ success: true, posts });
  })
);

/*
========================================================
DELETE POST
========================================================
*/
router.delete(
  "/:id",
  auth,
  asyncHandler(async (req, res) => {
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

    await Post.deleteOne({ _id: post._id });
    await Comment.deleteMany({ postId: post._id });
    await Reaction.deleteMany({ postId: post._id });
    await Report.deleteMany({ targetId: post._id });

    res.json({ success: true, message: "Post deleted" });
  })
);

/*
========================================================
UPDATE POST
========================================================
*/
router.patch(
  "/:id",
  auth,
  asyncHandler(async (req, res) => {
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

    if (content) {
      if (containsBadWords(content)) {
        return res.status(400).json({
          message: "Inappropriate language detected",
        });
      }

      if (detectCrisis(content)) {
        return res.status(200).json({
          success: false,
          crisis: true,
        });
      }

      post.content = content;
    }

    if (moodTag) post.moodTag = moodTag;
    if (mode) post.mode = mode;

    await post.save();

    res.json({ success: true, post });
  })
);

export default router;