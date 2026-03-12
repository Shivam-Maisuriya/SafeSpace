import { useEffect, useState } from "react";
import {
  BarChart3,
  Flag,
  FileWarning,
  MessageSquare,
  Users,
} from "lucide-react";

import api from "../services/api";
import ReportsTable from "../components/admin/ReportsTable";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/dashboard");
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sidebarItems = [
    { key: "dashboard", label: "Dashboard", icon: BarChart3 },
    { key: "reports", label: "Reports", icon: Flag },
    { key: "posts", label: "Hidden Posts", icon: FileWarning },
    { key: "comments", label: "Hidden Comments", icon: MessageSquare },
    { key: "users", label: "Users", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0f1115] flex">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-[#14171c] border-r border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-8">
          Admin Panel
        </h2>

        <div className="space-y-3">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;

            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm transition
                  ${
                    active
                      ? "bg-teal-600 text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }
                `}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        {activeTab === "dashboard" && (
          <>
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-white mb-8">
              Dashboard Overview
            </h1>

            {stats && (
              <div className="grid grid-cols-3 gap-6">
                <StatCard title="Total Users" value={stats.totalUsers} />
                <StatCard title="Total Posts" value={stats.totalPosts} />
                <StatCard title="Total Comments" value={stats.totalComments} />
                <StatCard title="Total Reports" value={stats.totalReports} />
                <StatCard title="Hidden Posts" value={stats.hiddenPosts} />
                <StatCard
                  title="Hidden Comments"
                  value={stats.hiddenComments}
                />
              </div>
            )}
          </>
        )}

        {activeTab === "reports" && <ReportsTable />}
        
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white dark:bg-[#1a1f25] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-semibold text-gray-800 dark:text-white mt-2">
        {value}
      </p>
    </div>
  );
}