import { Navigate } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  if (role !== "admin" && role !== "superadmin") {
    return <Navigate to="/feed" replace />;
  }

  return children;
}