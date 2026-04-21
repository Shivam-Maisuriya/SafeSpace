import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/admin/auth/login", {
        email,
        password,
      });

      // ✅ Save admin token
      localStorage.setItem("adminToken", res.data.token);

      // ✅ Redirect to dashboard
      navigate("/admin");

    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f2ee] dark:bg-[#0f1115]">

      <div className="w-full max-w-md bg-white dark:bg-[#1a1f25] p-8 rounded-2xl shadow-lg">

        <h2 className="text-2xl font-semibold text-center text-teal-600 dark:text-teal-400 mb-6">
          Admin Login
        </h2>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">
            {error}
          </p>
        )}

        {/* Email */}
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white outline-none border border-gray-300 dark:border-gray-700"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white outline-none border border-gray-300 dark:border-gray-700"
        />

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}