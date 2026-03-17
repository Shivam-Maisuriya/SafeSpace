import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function auth(req, res, next) {
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

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ❗ Permanent ban check
    if (user.isBanned) {
      return res.status(403).json({
        message: "Your account has been permanently banned.",
      });
    }

    // ❗ Temporary ban check
    if (user.banExpiresAt && user.banExpiresAt > new Date()) {
      return res.status(403).json({
        message: `You are temporarily banned until ${user.banExpiresAt}`,
      });
    }

    // Attach user
    req.user = user;

    next();
  } catch (err) {
    console.error("Auth Error:", err.message);

    return res.status(401).json({ message: "Invalid or expired token" });
  }
}