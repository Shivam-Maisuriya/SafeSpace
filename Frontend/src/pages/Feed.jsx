import { useEffect, useState } from "react";
import api from "../services/api";
import CreatePostModal from "../components/CreatePostModal";

const emotionMap = {
  "Feeling Lost": "😔",
  "Relationship Pain": "💔",
  "Anxiety / Stress": "😰",
  "Career Confusion": "🎓",
  "Self-Improvement": "🌱",
  "Just Need to Vent": "🫂",
};

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const username = localStorage.getItem("username");

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");
      setPosts(res.data.posts || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        👋 Welcome,{" "}
        <span className="text-indigo-600 dark:text-indigo-400">{username}</span>
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Share what you're feeling today 🌿
      </p>

      {loading && (
        <p className="text-gray-500 dark:text-gray-400">Loading posts...</p>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-10">
          No posts yet. Be the first to share something 🌿
        </div>
      )}

      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post._id}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm 
            p-5 border border-gray-100 dark:border-gray-800"
          >
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

            <p className="text-gray-800 dark:text-gray-200 mb-3">
              {post.content}
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {emotionMap[post.moodTag]} {post.moodTag}
            </p>
          </div>
        ))}
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 
        rounded-full bg-indigo-500 text-white text-2xl 
        shadow-lg hover:opacity-90 transition"
      >
        +
      </button>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={fetchPosts}
      />
    </div>
  );
}
