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
    <div className="min-h-screen flex flex-col justify-between px-6 py-12">

      {/* Top Section */}
      <div className="flex-1 flex flex-col justify-center items-center text-center">

        <h1 className="text-4xl sm:text-5xl font-semibold text-teal-600 dark:text-teal-400 tracking-tight">
          SafeSpace
        </h1>

        <p className="mt-6 text-gray-600 dark:text-gray-400 text-base max-w-md leading-relaxed">
          Speak freely.  
          Share honestly.  
          Stay anonymous.
        </p>

        <button
          onClick={handleLogin}
          className="
            mt-10 w-full max-w-sm py-4
            rounded-2xl
            bg-teal-600 hover:bg-teal-700
            dark:bg-teal-500 dark:hover:bg-teal-600
            text-white font-medium text-lg
            transition-colors duration-200
          "
        >
          Enter Anonymously
        </button>

      </div>

      {/* Bottom Section */}
      <div className="text-center text-xs text-gray-400 dark:text-gray-500">
        Built for comfort. Designed for honesty.
      </div>

    </div>
  );
}