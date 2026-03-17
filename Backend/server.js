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
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reactionRoutes from "./routes/reactionRoutes.js";

const app = express();

// ---------------- TRUST PROXY ----------------
app.set("trust proxy", 1);

// ---------------- CONNECT DB ----------------
connectDB();

// ---------------- GLOBAL MIDDLEWARE ----------------

// Security headers
app.use(helmet());

// Logging
app.use(morgan("dev"));

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Body parser (🔥 limit added)
app.use(express.json({ limit: "10kb" }));

// ---------------- RATE LIMITERS ----------------

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  },
});

const mediumLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// Apply limiters
app.use("/api/auth", strictLimiter);
app.use("/api/reports", strictLimiter);
app.use("/api/admin/auth", strictLimiter);

app.use("/api/posts", mediumLimiter);
app.use("/api/comments", mediumLimiter);
app.use("/api/admin", mediumLimiter);

// ---------------- ROUTES ----------------

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api/reports", reportRoutes);

app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/notifications", notificationRoutes);

// ---------------- HEALTH CHECK ----------------
app.get("/", (req, res) => {
  res.send("🚀 SafeSpace API running...");
});

// ---------------- ERROR HANDLER ----------------
app.use(errorHandler);

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("=================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log("=================================");
});