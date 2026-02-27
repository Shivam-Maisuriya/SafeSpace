import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Login from "./pages/Login";
import Feed from "./pages/Feed";

export default function App() {
  const location = useLocation();

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark",
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

  const showNavbar = location.pathname !== "/";

  return (
    <div
      className="
        min-h-screen 
        transition-colors duration-300
        bg-[#f4f2ee] 
        dark:bg-[#0f1115]
      "
    >
      {/* Navbar */}
      {showNavbar && (
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="
      flex justify-between items-center px-8 py-4
      bg-white/80 dark:bg-[#14171c]/80
      backdrop-blur-md
      border-b border-black/5 dark:border-white/5
    "
        >
          <h1 className="text-2xl font-semibold text-teal-600 dark:text-teal-400 tracking-tight">
            SafeSpace
          </h1>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="
          text-sm font-medium
          text-gray-600 dark:text-gray-300
          hover:text-teal-600 dark:hover:text-teal-400
          transition-colors
        "
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("username");
                window.location.href = "/";
              }}
              className="
          text-sm font-medium
          text-gray-500 hover:text-red-500
          transition-colors
        "
            >
              Logout
            </button>
          </div>
        </motion.nav>
      )}

      {/* Page Transition */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Login />
              </motion.div>
            }
          />
          <Route
            path="/feed"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Feed />
              </motion.div>
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
