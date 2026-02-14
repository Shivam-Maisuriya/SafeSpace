import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check temporary ban
    if (user.banExpiresAt && user.banExpiresAt > new Date()) {
      return res.status(403).json({
        message: `You are temporarily banned until ${user.banExpiresAt}`
      });
    }

    // attach full user object
    req.user = user; 
    next();

  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

