import express from "express";
import Reaction from "../models/Reaction.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/*
  Toggle Reaction Logic

  If:
    - No existing reaction → create
    - Same reaction → remove
    - Different reaction → update
*/

router.post("/:postId", auth, async (req, res, next) => {
  try {
    const { type } = req.body;
    const { postId } = req.params;

    if (!["relate", "alone", "helpful", "support"].includes(type)) {
      const error = new Error("Invalid reaction type");
      error.status = 400;
      throw error;
    }

    const existingReaction = await Reaction.findOne({
      postId,
      userId: req.user._id,
    });

    // No reaction yet → Create
    if (!existingReaction) {
      await Reaction.create({
        postId,
        userId: req.user._id,
        type,
      });

      return res.json({ action: "created", type });
    }

    // Same reaction → Remove
    if (existingReaction.type === type) {
      await existingReaction.deleteOne();
      return res.json({ action: "removed" });
    }

    // Different reaction → Update
    existingReaction.type = type;
    await existingReaction.save();

    res.json({ action: "updated", type });

  } catch (err) {
    next(err);
  }
});

export default router;