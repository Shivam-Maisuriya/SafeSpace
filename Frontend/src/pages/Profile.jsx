import { useEffect, useState } from "react";
import api from "../services/api";
import PostCard from "../components/PostCard";

export default function Profile() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPostId, setOpenPostId] = useState(null);

  const fetchMyPosts = async () => {
    try {
      const res = await api.get("/posts/me");
      if (res.data.success) {
        setPosts(res.data.posts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  // ✅ Remove post locally
  const handleDelete = (id) => {
    setPosts((prev) => prev.filter((post) => post._id !== id));
  };

  // ✅ Update post locally
  const handleUpdate = (updatedPost) => {
    setPosts((prev) =>
      prev.map((post) =>
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        My Posts
      </h2>

      {loading && (
        <p className="text-gray-500 dark:text-gray-400">
          Loading...
        </p>
      )}

      {!loading && posts.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">
          You haven’t posted anything yet.
        </p>
      )}

      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            isOwner={true}
            isOpen={openPostId === post._id}
            onToggle={() =>
              setOpenPostId(openPostId === post._id ? null : post._id)
            }
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))}
      </div>
    </div>
  );
}