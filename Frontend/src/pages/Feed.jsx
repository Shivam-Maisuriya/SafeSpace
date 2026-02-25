import { useEffect, useState } from "react";
import api from "../services/api";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [moodTag, setMoodTag] = useState("Feeling Lost");
  const username = localStorage.getItem("username");

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");
      setPosts(res.data.posts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!content.trim()) return;

    try {
      await api.post("/posts", {
        content,
        moodTag,
        mode: "advice",
      });

      setContent("");
      fetchPosts(); // refresh feed
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors duration-500 p-8">
      
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Welcome, {username}
      </h2>

      {/* Create Post */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md mb-8">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share what's on your mind..."
          className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white outline-none"
        />

        <select
          value={moodTag}
          onChange={(e) => setMoodTag(e.target.value)}
          className="mt-4 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
        >
          <option>Feeling Lost</option>
          <option>Relationship Pain</option>
          <option>Anxiety / Stress</option>
          <option>Career Confusion</option>
          <option>Self-Improvement</option>
          <option>Just Need to Vent</option>
        </select>

        <button
          onClick={handleCreatePost}
          className="mt-4 px-6 py-2 rounded-xl bg-indigo-500 text-white hover:scale-105 transition-transform duration-200"
        >
          Post
        </button>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post._id}
            className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md"
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