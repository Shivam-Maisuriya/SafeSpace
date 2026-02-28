import { useState, useEffect } from "react";
import api from "../services/api";
import timeAgo from "../utils/timeAgo";
import { Flag, MessageCircle } from "lucide-react";
import ReportModal from "./ReportModal";

const reactionsList = [
  { type: "relate", emoji: "🤍", label: "I relate" },
  { type: "alone", emoji: "🤝", label: "You're not alone" },
  { type: "helpful", emoji: "🌟", label: "Helpful advice" },
  { type: "support", emoji: "🫶", label: "Sending support" },
];

export default function PostCard({
  post,
  isOpen,
  onToggle,
  isOwner = false,
  onDelete,
  onUpdate, }) {

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const [reactionCounts, setReactionCounts] = useState(
    post.reactionCounts || {},
  );
  const [userReaction, setUserReaction] = useState(post.userReaction);
  const [animatingReaction, setAnimatingReaction] = useState(null);

  const [hasReported, setHasReported] = useState(post.hasReported);
  const [showReportModal, setShowReportModal] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  // ✅ Local comment count state (for realtime updates)
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);

  useEffect(() => {
    setCommentCount(post.commentCount || 0);
  }, [post.commentCount]);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const res = await api.get(`/comments/${post._id}`);
      if (res.data.success) {
        setComments(res.data.comments);
        setCommentCount(res.data.comments.length); // sync count
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleReaction = async (type) => {
    try {
      setAnimatingReaction(type);
      setTimeout(() => setAnimatingReaction(null), 200);

      const res = await api.post(`/reactions/${post._id}`, { type });

      if (res.data.action === "created") {
        setReactionCounts((prev) => ({
          ...prev,
          [type]: (prev[type] || 0) + 1,
        }));
        setUserReaction(type);
      }

      if (res.data.action === "removed") {
        setReactionCounts((prev) => ({
          ...prev,
          [type]: Math.max((prev[type] || 1) - 1, 0),
        }));
        setUserReaction(null);
      }

      if (res.data.action === "updated") {
        const oldType = userReaction;

        setReactionCounts((prev) => ({
          ...prev,
          [oldType]: Math.max((prev[oldType] || 1) - 1, 0),
          [type]: (prev[type] || 0) + 1,
        }));

        setUserReaction(type);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComments = () => {
    if (!isOpen) fetchComments();
    onToggle();
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      const res = await api.post("/comments", {
        postId: post._id,
        content: commentText,
      });

      if (res.data.success) {
        const newComment = res.data.comment;

        setComments((prev) => [...prev, newComment]);
        setCommentCount((prev) => prev + 1); // realtime update
        setCommentText("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative bg-white dark:bg-[#1a1f25] rounded-3xl p-7 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300">
      {/* Accent Strip */}
      <div
        className={`absolute left-0 top-6 bottom-6 w-[3px] rounded-r-full
        ${post.mode === "vent" ? "bg-amber-400" : "bg-teal-500"}`}
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Anonymous · {timeAgo(post.createdAt)}
        </span>

        {isOwner ? (
          <div className="flex gap-3 text-sm">
            <button
              onClick={() => setEditing(true)}
              className="text-gray-400 hover:text-teal-500 transition"
            >
              Edit
            </button>

            <button
              onClick={async () => {
                if (!window.confirm("Delete this post?")) return;

                await api.delete(`/posts/${post._id}`);
                window.location.reload();
              }}
              className="text-gray-400 hover:text-red-500 transition"
            >
              Delete
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              if (!hasReported) setShowReportModal(true);
            }}
            disabled={hasReported}
            className={`transition-colors ${
              hasReported
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-400 hover:text-red-500"
            }`}
          >
            <Flag size={16} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Content */}
      {editing ? (
        <div className="mb-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-700"
            rows={4}
          />

          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={() => setEditing(false)}
              className="text-sm text-gray-500"
            >
              Cancel
            </button>

            <button
              onClick={async () => {
                await api.patch(`/posts/${post._id}`, {
                  content: editContent,
                });
                setEditing(false);
                window.location.reload();
              }}
              className="text-sm text-teal-600"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-[15px] mb-4">
          {post.content}
        </p>
      )}

      {/* Mood */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
        {post.moodTag}
      </p>

      {/* Interaction Row */}
      <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4">
        {/* Reactions */}
        <div className="flex gap-3 flex-wrap">
          {reactionsList.map((r) => {
            const isActive = userReaction === r.type;
            const isAnimating = animatingReaction === r.type;

            return (
              <button
                key={r.type}
                onClick={() => handleReaction(r.type)}
                title={r.label}
                className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-full transition-all duration-200
                  ${
                    isActive
                      ? "bg-teal-100 text-teal-700 dark:bg-teal-800/40 dark:text-teal-300"
                      : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
                  }`}
              >
                <span
                  className={`text-lg transition-transform duration-200 ${
                    isAnimating ? "scale-125" : "scale-100"
                  }`}
                >
                  {r.emoji}
                </span>
                <span>{reactionCounts[r.type] || 0}</span>
              </button>
            );
          })}
        </div>

        {/* Comment Button */}
        <button
          onClick={toggleComments}
          className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition"
        >
          <MessageCircle size={16} strokeWidth={1.5} />
          <span>{commentCount}</span>
        </button>
      </div>

      {/* Comments Section */}
      {isOpen && (
        <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
          {loadingComments && (
            <p className="text-sm text-gray-400">Loading comments...</p>
          )}

          {!loadingComments && comments.length === 0 && (
            <p className="text-sm text-gray-400">No comments yet.</p>
          )}

          {comments.map((comment) => (
            <div
              key={comment._id}
              className="mb-3 p-3 rounded-xl bg-gray-100 dark:bg-gray-800"
            >
              <div className="text-xs text-gray-400 mb-1">
                Anonymous · {timeAgo(comment.createdAt)}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {comment.content}
              </p>
            </div>
          ))}

          {/* Add Comment */}
          <div className="mt-4 flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white outline-none border border-gray-300 dark:border-gray-700 focus:border-teal-500 transition"
            />

            <button
              onClick={handleAddComment}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors duration-200"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {showReportModal && (
        <ReportModal
          postId={post._id}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
