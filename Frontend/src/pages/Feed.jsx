import { useEffect, useState } from "react";
import api from "../services/api";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const username = localStorage.getItem("username");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get("/posts");
        setPosts(res.data.posts);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors duration-500 p-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Welcome, {username}
      </h2>

      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post._id}
            className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md transition-all"
          >
            <p className="text-gray-800 dark:text-gray-200">
              {post.content}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Mood: {post.moodTag}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}