import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Login from "./pages/Login";
import Feed from "./pages/Feed";

export default function App() {
  const location = useLocation();

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

  const showNavbar = location.pathname !== "/";

  return (
    <div className="min-h-screen transition-colors duration-300 
      bg-gradient-to-br from-indigo-50 via-white to-purple-100 
      dark:from-[#0f172a] dark:via-[#111827] dark:to-[#1e293b]">

      {/* Navbar */}
      {showNavbar && (
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="flex justify-between items-center px-8 py-4 
          backdrop-blur-lg bg-white/70 dark:bg-gray-900/70 
          shadow-md border-b border-white/20"
        >
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            SafeSpace
          </h1>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 rounded-xl 
            bg-indigo-500 text-white 
            hover:opacity-90 
            transition-all duration-200"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
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