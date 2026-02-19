import express from "express";
import auth from "../middleware/auth.js";
import adminOnly from "../middleware/admin.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import Report from "../models/Report.js";
import User from "../models/User.js";

const router = express.Router();

// -----------------------------------------------------------------------------------------------------------------------------

// Get Hidden Posts
router.get("/posts/hidden", auth, adminOnly, async (req, res) => {
  const posts = await Post.find({ isHidden: true }).sort({ updatedAt: -1 });
  res.json(posts);
});

// Restore Post
router.put("/posts/:id/restore", auth, adminOnly, async (req, res) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { isHidden: false, reportCount: 0 },
    { new: true }
  );

  await Report.deleteMany({ targetId: req.params.id });

  res.json({ message: "Post restored", post });
});

// Delete Post Permanently
router.delete("/posts/:id", auth, adminOnly, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  await Report.deleteMany({ targetId: req.params.id });

  res.json({ message: "Post deleted permanently." });
});

// -----------------------------------------------------------------------------------------------------------------------------

// Get Hidden Comments
router.get("/comments/hidden", auth, adminOnly, async (req, res) => {
  const comments = await Comment.find({ isHidden: true });
  res.json(comments);
});

// Restore Comment
router.put("/comments/:id/restore", auth, adminOnly, async (req, res) => {
  const comment = await Comment.findByIdAndUpdate(
    req.params.id,
    { isHidden: false, reportCount: 0 },
    { new: true }
  );

  await Report.deleteMany({ targetId: req.params.id });

  res.json({ message: "Comment restored.", comment });
});


// Delete Comment Permanently
router.delete("/comments/:id", auth, adminOnly, async (req, res) => {
  await Comment.findByIdAndDelete(req.params.id);
  await Report.deleteMany({ targetId: req.params.id });

  res.json({ message: "Comment deleted permanently." });
});

// -----------------------------------------------------------------------------------------------------------------------------

// Ban User
router.put("/users/:id/ban", auth, adminOnly, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBanned: true },
    { new: true }
  );

  res.json({ message: "User banned successfully.", user });
});


// Unban User
router.put("/users/:id/unban", auth, adminOnly, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBanned: false },
    { new: true }
  );

  res.json({ message: "User unbanned successfully.", user });
});

// temporary ban user
router.put("/users/:id/tempban", auth, adminOnly, async (req, res) => {
  const { days } = req.body;

  const banUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { banExpiresAt: banUntil },
    { new: true }
  );

  res.json({ message: "User temporarily banned.", user });
});

// read only user
router.put("/users/:id/readonly", auth, adminOnly, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isReadOnly: true },
    { new: true }
  );

  res.json({ message: "User set to read-only.", user });
});

// remove read only user
router.put("/users/:id/remove-readonly", auth, adminOnly, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isReadOnly: false },
    { new: true }
  );

  res.json({ message: "Read-only removed.", user });
});



export default router;
