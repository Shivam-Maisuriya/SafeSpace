import api from "../../services/api";

export default function UsersTable({ users, refresh }) {
  const token = localStorage.getItem("adminToken");

  const toggleBan = async (id, isBanned) => {
    await api.put(`/admin/users/${id}/${isBanned ? "unban" : "ban"}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    refresh();
  };

  return (
    <div className="bg-white dark:bg-[#1a1f25] p-4 rounded-xl">
      <h2 className="text-lg mb-4 text-gray-800 dark:text-white">
        Users
      </h2>

      {users.map((u) => (
        <div key={u._id} className="flex justify-between mb-2">
          <span>{u.username}</span>

          <button
            onClick={() => toggleBan(u._id, u.isBanned)}
            className={`px-3 py-1 text-xs rounded ${
              u.isBanned ? "bg-green-500" : "bg-red-500"
            } text-white`}
          >
            {u.isBanned ? "Unban" : "Ban"}
          </button>
        </div>
      ))}
    </div>
  );
}