import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Feed from "./pages/Feed";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/feed" element={<Feed />} />
    </Routes>
  );
}