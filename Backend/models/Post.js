import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, required: true },
    moodTag: { type: String, required: true },
    mode: { type: String, enum: ["vent", "advice"], required: true },

    reactions: {
      relate: { type: Number, default: 0 },
      support: { type: Number, default: 0 },
      helpful: { type: Number, default: 0 },
      hug: { type: Number, default: 0 },
    },

    reportCount: { type: Number, default: 0 },

    isHidden: { type: Boolean, default: false },

  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
