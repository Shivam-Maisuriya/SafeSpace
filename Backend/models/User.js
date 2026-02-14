import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    anonId: { type: String, required: true },
    username: { type: String, required: true },
    isBanned: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isReadOnly: {
      type: Boolean,
      default: false,
    },

    banExpiresAt: {
      type: Date,
      default: null,
    },

    strikeCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
