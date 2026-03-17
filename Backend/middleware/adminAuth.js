import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export default async function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // Check header exists
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    // Check Bearer format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure admin role
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied (admin only)" });
    }

    // Find admin in DB
    const admin = await Admin.findById(decoded.adminId);

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    // Attach admin to request
    req.admin = admin;

    next();
  } catch (err) {
    console.error("AdminAuth Error:", err.message);

    return res.status(401).json({ message: "Invalid or expired token" });
  }
}