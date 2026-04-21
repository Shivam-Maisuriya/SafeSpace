import { useState } from "react";
import api from "../../services/api";

export default function AdminsTable({ admins, refresh }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const token = localStorage.getItem("adminToken");

  const createAdmin = async () => {
    await api.post("/admin/admins", { email, password }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setEmail("");
    setPassword("");
    refresh();
  };

  const deleteAdmin = async (id) => {
    await api.delete(`/admin/admins/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    refresh();
  };

  return (
    <div className="bg-white dark:bg-[#1a1f25] p-4 rounded-xl">
      <h2 className="text-lg mb-4 text-white">Admins</h2>

      {/* Create */}
      <div className="flex gap-2 mb-4">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="p-2 rounded bg-gray-100 text-black outline-none dark:bg-gray-600 dark:text-white"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="p-2 rounded bg-gray-100 text-black outline-none dark:bg-gray-600 dark:text-white"
        />
        <button
          onClick={createAdmin}
          className="bg-teal-600 text-white px-3 rounded hover:bg-teal-700"
        >
          Add
        </button>
      </div>

      {/* List */}
      {admins.map((a) => (
        <div key={a._id} className="flex justify-between mb-2">
          <span className='text-black dark:text-white'>{a.email}</span>

          <button
            onClick={() => deleteAdmin(a._id)}
            className="text-red-500 text-sm hover:text-red-600"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}