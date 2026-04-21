import { useEffect, useState } from "react";
import api from "../services/api";

import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopbar from "../components/admin/AdminTopbar";
import StatCard from "../components/admin/StatCard";
import ReportsTable from "../components/admin/ReportsTable";
import UsersTable from "../components/admin/UsersTable";
import AdminsTable from "../components/admin/AdminsTable";

export default function AdminDashboard() {
  const [tab, setTab] = useState("dashboard");

  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);

  const token = localStorage.getItem("adminToken");

  const fetchDashboard = async () => {
    const res = await api.get("/admin/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setStats(res.data.stats);
  };

  const fetchReports = async () => {
    const res = await api.get("/admin/reports", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setReports(res.data.reports);
  };

  const fetchUsers = async () => {
    const res = await api.get("/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(res.data.users);
  };

  const fetchAdmins = async () => {
    const res = await api.get("/admin/admins", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setAdmins(res.data.admins);
  };

  useEffect(() => {
    fetchDashboard();
    fetchReports();
    fetchUsers();
    fetchAdmins();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-[#0f1115]">

      <AdminSidebar setTab={setTab} activeTab={tab} />

      <div className="flex-1 flex flex-col">
        <AdminTopbar />

        <div className="p-6 space-y-6 overflow-y-auto">

          {tab === "dashboard" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="Users" value={stats?.totalUsers} />
              <StatCard title="Posts" value={stats?.totalPosts} />
              <StatCard title="Comments" value={stats?.totalComments} />
              <StatCard title="Reports" value={stats?.totalReports} />
            </div>
          )}

          {tab === "reports" && (
            <ReportsTable reports={reports} refresh={fetchReports} />
          )}

          {tab === "users" && (
            <UsersTable users={users} refresh={fetchUsers} />
          )}

          {tab === "admins" && (
            <AdminsTable admins={admins} refresh={fetchAdmins} />
          )}

        </div>
      </div>
    </div>
  );
}