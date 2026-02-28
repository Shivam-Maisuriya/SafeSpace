import { useEffect, useState } from "react";
import api from "../services/api";
import timeAgo from "../utils/timeAgo";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        Notifications
      </h2>

      {loading && (
        <p className="text-gray-500 dark:text-gray-400">
          Loading notifications...
        </p>
      )}

      {!loading && notifications.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">
          No notifications yet 🌿
        </p>
      )}

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification._id}
            className={`
    p-4 rounded-2xl transition border flex justify-between items-start
    ${
      notification.isRead
        ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        : "bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-700"
    }
  `}
          >
            <div
              className="cursor-pointer"
              onClick={() => markAsRead(notification._id)}
            >
              <p className="text-sm text-gray-800 dark:text-gray-200">
                {notification.message}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {timeAgo(notification.createdAt)}
              </p>
            </div>

            <button
              onClick={async () => {
                await api.delete(`/notifications/${notification._id}`);
                setNotifications((prev) =>
                  prev.filter((n) => n._id !== notification._id),
                );
              }}
              className="text-xs text-gray-400 hover:text-red-500 transition"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
