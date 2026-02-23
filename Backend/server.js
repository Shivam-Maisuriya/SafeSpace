import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();

// Trust proxy (important for deployment)
app.set("trust proxy", 1);

// Connect database
connectDB();

// Logging
app.use(morgan("dev"));

// Security & Parsing
app.use(cors());
app.use(express.json());

// ---------------- Rate Limiters ----------------

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many requests. Please try again later."
});

const mediumLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// Apply limiters
app.use("/api/auth", strictLimiter);
app.use("/api/reports", strictLimiter);
app.use("/api/admin", strictLimiter);

app.use("/api/posts", mediumLimiter);
app.use("/api/comments", mediumLimiter);

// ---------------- Routes ----------------

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("SafeSpace API running...");
});

// ---------------- Error Handler ----------------

app.use(errorHandler);

// ---------------- Start Server ----------------

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});