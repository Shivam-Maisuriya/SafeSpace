export default function AdminTopbar() {
  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white dark:bg-[#14171c] border-b border-gray-200 dark:border-gray-800">
      <h1 className="text-lg font-medium text-gray-800 dark:text-white">
        Dashboard
      </h1>

      <button
        onClick={() => {
          localStorage.removeItem("adminToken");
          window.location.href = "/admin/login";
        }}
        className="text-sm text-red-500 hover:text-red-600"
      >
        Logout
      </button>
    </div>
  );
}