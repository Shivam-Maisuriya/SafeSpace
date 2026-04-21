import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";

import Login from "./pages/Login";
import Feed from "./pages/Feed";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";

import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // ✅ Better navbar logic
  const hideNavbar =
    location.pathname === "/" ||
    location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen transition-colors duration-300 bg-[#f4f2ee] dark:bg-[#0f1115]">

      {/* Navbar */}
      {!hideNavbar && (
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="flex justify-between items-center px-8 py-4 bg-white/80 dark:bg-[#14171c]/80 backdrop-blur-md border-b border-black/5 dark:border-white/5"
        >
          <h1
            onClick={() => navigate("/feed")}
            className="cursor-pointer text-2xl font-semibold text-teal-600 dark:text-teal-400 tracking-tight"
          >
            SafeSpace
          </h1>

          <div className="flex items-center gap-6">

            {/* Notifications */}
            <button
              onClick={() => navigate("/notifications")}
              className="text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 transition"
            >
              <Bell size={20} />
            </button>

            {/* Profile */}
            <button
              onClick={() => navigate("/profile")}
              className="text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 transition"
            >
              Profile
            </button>

            {/* Dark Mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-sm text-gray-600 dark:text-gray-300"
            >
              {darkMode ? "Light" : "Dark"}
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("username");
                navigate("/");
              }}
              className="text-sm text-gray-500 hover:text-red-500"
            >
              Logout
            </button>

          </div>
        </motion.nav>
      )}

      {/* Routes */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          {/* PUBLIC */}
          <Route path="/" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* USER PROTECTED */}
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* ADMIN PROTECTED */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />

        </Routes>
      </AnimatePresence>
    </div>
  );
}