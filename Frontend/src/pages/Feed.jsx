import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import CreatePostModal from "../components/CreatePostModal";
import PostCard from "../components/PostCard";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openPostId, setOpenPostId] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastId, setLastId] = useState(null);

  const username = localStorage.getItem("username");

  // 🔥 Fetch posts (cursor-based)
  const fetchPosts = async (cursor = null) => {
    if (loading) return;

    try {
      setLoading(true);

      let url = "/posts?limit=10";
      if (cursor) {
        url += `&lastId=${cursor}`;
      }

      const res = await api.get(url);

      if (res.data.success) {
        const newPosts = res.data.posts;

        setPosts((prev) => [...prev, ...newPosts]);
        setHasMore(res.data.hasMore);

        if (newPosts.length > 0) {
          setLastId(newPosts[newPosts.length - 1]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // 🔥 Initial load
  useEffect(() => {
    fetchPosts();
  }, []);

  // 🔥 Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!hasMore || loading) return;

    const scrollPosition =
      window.innerHeight + document.documentElement.scrollTop;

    const threshold =
      document.documentElement.offsetHeight - 200;

    if (scrollPosition >= threshold) {
      fetchPosts(lastId);
    }
  }, [lastId, hasMore, loading]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // 🔥 Refresh feed after creating post
  const refreshFeed = async () => {
    setPosts([]);
    setLastId(null);
    setHasMore(true);
    setInitialLoading(true);
    await fetchPosts();
  };

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

      {initialLoading && (
        <p className="text-gray-500 dark:text-gray-400">
          Loading posts...
        </p>
      )}

      {!initialLoading && posts.length === 0 && (
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
              setOpenPostId(
                openPostId === post._id ? null : post._id
              )
            }
          />
        ))}
      </div>

      {/* Loading More Indicator */}
      {loading && !initialLoading && (
        <p className="text-center mt-6 text-gray-500 dark:text-gray-400">
          Loading more posts...
        </p>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="text-center mt-6 text-gray-400">
          You've reached the end 🌿
        </p>
      )}

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
        onPostCreated={refreshFeed}
      />
    </div>
  );
}