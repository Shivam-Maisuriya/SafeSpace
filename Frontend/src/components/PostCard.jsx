import { useState } from "react";
import api from "../services/api";

export default function PostCard({ post }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);

      const res = await api.get(`/comments/${post._id}`);

      // ✅ Correct extraction from backend response
      if (res.data && res.data.success) {
        setComments(res.data.comments || []);
      } else {
        setComments([]);
      }

    } catch (err) {
      console.error("Error fetching comments:", err);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      const res = await api.post("/comments", {
        postId: post._id,
        content: commentText,
      });

      // Only refresh if comment creation succeeded
      if (res.data && res.data.success) {
        setCommentText("");
        fetchComments();
      }

    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const toggleComments = () => {
    if (!showComments) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm 
      p-5 border border-gray-100 dark:border-gray-800">

      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Anonymous
        </span>

        <span
          className={`text-xs px-3 py-1 rounded-full font-medium
            ${
              post.mode === "vent"
                ? "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
                : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300"
            }`}
        >
          {post.mode === "vent" ? "Venting" : "Advice"}
        </span>
      </div>

      {/* Content */}
      <p className="text-gray-800 dark:text-gray-200 mb-3">
        {post.content}
      </p>

      {/* Mood */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {post.moodTag}
      </p>

      {/* Toggle Comments */}
      <button
        onClick={toggleComments}
        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
      >
        {showComments ? "Hide comments" : "View comments"}
      </button>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">

          {loadingComments && (
            <p className="text-sm text-gray-500">
              Loading comments...
            </p>
          )}

          {!loadingComments && comments.length === 0 && (
            <p className="text-sm text-gray-500">
              No comments yet.
            </p>
          )}

          {comments.map((comment) => (
            <div
              key={comment._id}
              className="mb-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800"
            >
              <p className="text-sm text-gray-800 dark:text-gray-200">
                {comment.content}
              </p>
            </div>
          ))}

          {/* Add Comment */}
          <div className="mt-3 flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 
              text-gray-800 dark:text-white outline-none"
            />

            <button
              onClick={handleAddComment}
              className="px-4 py-2 rounded-lg bg-indigo-500 text-white hover:opacity-90"
            >
              Send
            </button>
          </div>

        </div>
      )}
    </div>
  );
}