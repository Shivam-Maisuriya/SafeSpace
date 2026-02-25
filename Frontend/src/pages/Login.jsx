import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/anonymous"
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);

      navigate("/feed");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 transition-colors duration-500">
      <div className="bg-white dark:bg-gray-900 p-10 rounded-3xl shadow-xl w-[350px] text-center">
        <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
          SafeSpace
        </h1>

        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Share your thoughts anonymously.
        </p>

        <button
          onClick={handleLogin}
          className="mt-6 w-full py-3 rounded-xl bg-indigo-500 text-white hover:scale-105 transition-transform duration-200"
        >
          Enter Anonymously
        </button>
      </div>
    </div>
  );
}