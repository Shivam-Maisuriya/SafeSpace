import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors duration-500">
      
      {showNavbar && (
        <nav className="flex justify-between items-center px-8 py-4 shadow-md bg-white dark:bg-gray-900 transition-colors duration-500">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            SafeSpace
          </h1>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 rounded-xl bg-indigo-500 text-white hover:scale-105 transition-transform duration-200"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </nav>
      )}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/feed" element={<Feed />} />
      </Routes>
    </div>
  );
}