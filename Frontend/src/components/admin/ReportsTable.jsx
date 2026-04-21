export default function ReportsTable({ reports, refresh }) {
  const handleDeletePost = async (id) => {
    await fetch(`/api/admin/posts/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });

    refresh();
  };

  return (
    <div className="bg-white dark:bg-[#1a1f25] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
      <h2 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">
        Reports
      </h2>

      <div className="space-y-3">
        {reports.map((r) => (
          <div
            key={r._id}
            className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 flex justify-between items-center"
          >
            <div>
              
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {r.reason}
              </p>
              <p className="text-xs text-gray-400">
                {r.type}
              </p>
            </div>

            <button
              onClick={() => handleDeletePost(r.targetId)}
              className="text-xs bg-red-500 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}