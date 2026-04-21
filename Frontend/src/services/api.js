import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// ✅ Auto attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");

  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;