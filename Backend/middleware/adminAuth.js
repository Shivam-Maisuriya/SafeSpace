import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export default async function adminAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Not admin" });
    }

    const admin = await Admin.findById(decoded.adminId);

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    req.admin = admin;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
}