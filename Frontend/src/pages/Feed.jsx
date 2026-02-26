import { useEffect, useState } from "react";
import api from "../services/api";
import CreatePostModal from "../components/CreatePostModal";
import PostCard from "../components/PostCard";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openPostId, setOpenPostId] = useState(null);

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
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          👋 Welcome,{" "}
          <span className="text-teal-600 dark:text-teal-400">
            {username}
          </span>
        </h2>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Share what you're feeling today 🌿
        </p>
      </div>

      {loading && (
        <p className="text-gray-500 dark:text-gray-400">
          Loading posts...
        </p>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-10">
          No posts yet. Be the first to share something 🌿
        </div>
      )}

      {/* Posts */}
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            isOpen={openPostId === post._id}
            onToggle={() =>
              setOpenPostId(openPostId === post._id ? null : post._id)
            }
          />
        ))}
      </div>

      {/* Floating Button */}
      <button
        title="Create Post"
        onClick={() => setIsModalOpen(true)}
        className="
          fixed bottom-6 right-6
          w-14 h-14
          rounded-full
          bg-teal-600 hover:bg-teal-700
          dark:bg-teal-500 dark:hover:bg-teal-600
          text-white text-2xl
          shadow-lg hover:shadow-xl
          transition-all duration-200
        "
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