// Sprint 11 - MongoDB (Reviews + Wishlist).
import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    productIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Wishlist", wishlistSchema);
