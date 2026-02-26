import { useState, useEffect } from "react";
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
      if (e.key === "Escape") onClose();
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

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-50 px-4"
            onClick={onClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="
                relative w-full max-w-lg
                bg-white dark:bg-[#1a1d21]
                rounded-3xl p-6
                border border-black/5 dark:border-white/5
                shadow-lg
                transition-colors
              "
            >
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
              >
                ✕
              </button>

              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Share your thoughts 🌿
              </h2>

              {/* Textarea */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What’s on your mind?"
                className="
                  w-full p-3 rounded-xl
                  bg-[#f0ede8] dark:bg-[#22262c]
                  text-gray-800 dark:text-white
                  outline-none resize-none
                  border border-black/5 dark:border-white/5
                "
                rows={4}
              />

              {/* Mode */}
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setMode("advice")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition
                    ${
                      mode === "advice"
                        ? "bg-teal-600 text-white"
                        : "bg-[#f0ede8] dark:bg-[#22262c] text-gray-700 dark:text-gray-300"
                    }`}
                >
                  Looking for Advice
                </button>

                <button
                  onClick={() => setMode("vent")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition
                    ${
                      mode === "vent"
                        ? "bg-amber-500 text-white"
                        : "bg-[#f0ede8] dark:bg-[#22262c] text-gray-700 dark:text-gray-300"
                    }`}
                >
                  Just Venting
                </button>
              </div>

              {/* Emotions */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                {emotions.map((emotion) => (
                  <button
                    key={emotion.label}
                    onClick={() => setSelectedEmotion(emotion.label)}
                    className={`p-3 rounded-xl text-sm flex flex-col items-center transition
                      ${
                        selectedEmotion === emotion.label
                          ? "bg-teal-100 dark:bg-teal-900/40"
                          : "bg-[#f0ede8] dark:bg-[#22262c]"
                      }`}
                  >
                    <span className="text-xl">{emotion.emoji}</span>
                    <span className="mt-1 text-xs text-gray-600 dark:text-gray-300 text-center">
                      {emotion.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                className="
                  mt-6 w-full py-3 rounded-xl
                  bg-teal-600 hover:bg-teal-700
                  dark:bg-teal-500 dark:hover:bg-teal-600
                  text-white font-medium
                  transition-colors duration-200
                "
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