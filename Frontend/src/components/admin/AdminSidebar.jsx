export default function AdminSidebar({ setTab, activeTab }) {
  const menu = ["dashboard", "reports", "users", "admins"];

  return (
    <div className="w-64 bg-white dark:bg-[#14171c] border-r p-6">
      <h2 className="text-xl font-semibold text-teal-600 mb-8">
        Admin Panel
      </h2>

      <nav className="space-y-3">
        {menu.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`block w-full text-left capitalize px-3 py-2 rounded-lg transition
              ${
                activeTab === item
                  ? "bg-teal-100 text-teal-700"
                  : "text-gray-600 hover:bg-gray-100"
              }
            `}  
          >
            {item}
          </button>
        ))}
      </nav>
    </div>
  );
}