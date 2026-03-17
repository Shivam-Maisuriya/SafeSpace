import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import helmet from "helmet";

import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js"; // ✅ NEW
import notificationRoutes from "./routes/notificationRoutes.js";
import reactionRoutes from "./routes/reactionRoutes.js";

const app = express();

// Trust proxy (important for deployment)
app.set("trust proxy", 1);

// Connect database
connectDB();

// ---------------- Middleware ----------------

// Logging
app.use(morgan("dev"));

// Security
app.use(helmet());

// CORS (adjust for production later)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// ---------------- Rate Limiters ----------------

// Strict (auth, reports, admin login)
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many requests. Please try again later.",
});

// Medium (normal usage)
const mediumLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// Apply limiters
app.use("/api/auth", strictLimiter);
app.use("/api/reports", strictLimiter);
app.use("/api/admin/auth", strictLimiter); // ✅ admin login protection

app.use("/api/posts", mediumLimiter);
app.use("/api/comments", mediumLimiter);
app.use("/api/admin", mediumLimiter); // ✅ admin dashboard usage

// ---------------- Routes ----------------

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api/reports", reportRoutes);

app.use("/api/admin/auth", adminAuthRoutes); // ✅ NEW
app.use("/api/admin", adminRoutes);

app.use("/api/notifications", notificationRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("🚀 SafeSpace API running...");
});

// ---------------- Error Handler ----------------

app.use(errorHandler);

// ---------------- Start Server ----------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});