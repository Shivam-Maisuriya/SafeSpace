import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        username,
        password,
      });

      if (res.data.success) {
        const { token, user } = res.data;

        if (user.role !== "admin" && user.role !== "superadmin") {
          alert("You are not authorized as admin.");
          return;
        }

        localStorage.setItem("token", token);
        localStorage.setItem("username", user.username);
        localStorage.setItem("role", user.role);

        navigate("/admin");
      }
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0f1115]">
      <div className="bg-white dark:bg-[#1a1f25] p-8 rounded-xl shadow-lg w-96 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
          Admin Login
        </h2>

        <input
          placeholder="Username"
          className="w-full mb-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}