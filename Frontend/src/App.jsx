import { useEffect, useState } from "react";

export default function App() {
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

  return (
    <div className="min-h-screen transition-colors duration-500 bg-gray-100 dark:bg-gray-950">
      
      {/* Navbar */}
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

      {/* Main Content */}
      <div className="flex items-center justify-center h-[80vh]">
        <div className="bg-white dark:bg-gray-900 shadow-xl rounded-3xl p-10 transition-all duration-500">
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-white text-center">
            Welcome to your SafeSpace 🌿
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-center">
            A place to share, heal, and grow — anonymously.
          </p>
        </div>
      </div>

    </div>
  );
}