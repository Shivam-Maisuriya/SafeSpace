// packages
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

// Methods
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";

// routes
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

app.set("trust proxy", 1);

// Database connection
connectDB(); 

// 
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 requests per 15 min
  message: "Too many attempts. Please try later."
});

const mediumLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10
});


app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SafeSpace API running...");
});

// routes
app.use("/api/auth", strictLimiter, authRoutes);
app.use("/api/reports", strictLimiter, reportRoutes);

app.use("/api/admin", adminLimiter, adminRoutes);

app.use("/api/posts", mediumLimiter, postRoutes);
app.use("/api/comments", mediumLimiter, commentRoutes);

// centralized error handler (MUST BE LAST)
app.use(errorHandler);

app.listen(5000, () => console.log("🚀 Server running on port 5000"));

