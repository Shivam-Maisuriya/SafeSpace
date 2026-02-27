import { useState } from "react";
import api from "../services/api";

const reasons = [
  "Harassment",
  "Hate Speech",
  "Spam",
  "Self-harm Content",
  "Other",
];

export default function ReportModal({ postId, onClose }) {
  const [selectedReason, setSelectedReason] = useState(reasons[0]);
  const [otherText, setOtherText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // unified message state

  const handleSubmit = async () => {
    if (selectedReason === "Other" && !otherText.trim()) return;

    try {
      setLoading(true);

      const res = await api.post("/reports", {
        type: "post",
        targetId: postId,
        reason: selectedReason === "Other" ? otherText.trim() : selectedReason,
      });

      setMessage("Report submitted. Thank you.");

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      const backendMessage = err.response?.data?.message;

      if (backendMessage === "You already reported this.") {
        setMessage("You have already reported this post.");
      } else {
        setMessage("Something went wrong. Try again.");
      }

      // auto close after showing message
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#1a1f25] p-6 rounded-2xl w-80 shadow-xl border border-gray-200 dark:border-gray-700">
        {message ? (
          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            {message}
          </p>
        ) : (
          <>
            <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">
              Report Post
            </h3>

            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white mb-4 outline-none"
            >
              {reasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>

            {selectedReason === "Other" && (
              <textarea
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                placeholder="Please describe the issue..."
                className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white mb-4 outline-none resize-none"
                rows={3}
              />
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="
                  bg-red-500 hover:bg-red-600
                  text-white text-sm px-4 py-2
                  rounded-lg transition-colors duration-200
                  disabled:opacity-50
                "
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
