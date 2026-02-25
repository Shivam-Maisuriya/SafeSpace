import { useState } from "react";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

const emotions = [
  { label: "Feeling Lost", emoji: "😔" },
  { label: "Relationship Pain", emoji: "💔" },
  { label: "Anxiety / Stress", emoji: "😰" },
  { label: "Career Confusion", emoji: "🎓" },
  { label: "Self-Improvement", emoji: "🌱" },
  { label: "Just Need to Vent", emoji: "🫂" },
];

export default function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const [content, setContent] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState(emotions[0].label);
  const [mode, setMode] = useState("advice");

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      await api.post("/posts", {
        content,
        moodTag: selectedEmotion,
        mode,
      });

      setContent("");
      onPostCreated();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-50"
            onClick={onClose}
          >

            <div
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl p-6 shadow-lg"
            >
                
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white transition"
              >
                ✕
              </button>

              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Share your thoughts 🌿
              </h2>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What’s on your mind?"
                className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-800 
                text-gray-800 dark:text-white outline-none resize-none"
                rows={4}
              />

              {/* Mode */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setMode("advice")}
                  className={`px-4 py-2 rounded-full text-sm ${
                    mode === "advice"
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
                  }`}
                >
                  Looking for Advice
                </button>

                <button
                  onClick={() => setMode("vent")}
                  className={`px-4 py-2 rounded-full text-sm ${
                    mode === "vent"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
                  }`}
                >
                  Just Venting
                </button>
              </div>

              {/* Emotions */}
              <div className="grid grid-cols-3 gap-3 mt-5">
                {emotions.map((emotion) => (
                  <button
                    key={emotion.label}
                    onClick={() => setSelectedEmotion(emotion.label)}
                    className={`p-3 rounded-xl text-sm flex flex-col items-center
                      ${
                        selectedEmotion === emotion.label
                          ? "bg-indigo-100 dark:bg-indigo-900"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                  >
                    <span className="text-xl">{emotion.emoji}</span>
                    <span className="mt-1 text-gray-700 dark:text-gray-300 text-xs">
                      {emotion.label}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                className="mt-6 w-full py-3 rounded-xl bg-indigo-500 
                text-white hover:opacity-90 transition"
              >
                Post
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
