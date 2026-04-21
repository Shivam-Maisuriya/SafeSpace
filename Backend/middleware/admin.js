import User from "../models/User.js";

export default async function adminOnly(req, res, next) {
  try {
    const user = await User.findById(req.userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required." });
    }

    next();
  } catch {
    res.status(500).json({ message: "Authorization error." });
  }
}
