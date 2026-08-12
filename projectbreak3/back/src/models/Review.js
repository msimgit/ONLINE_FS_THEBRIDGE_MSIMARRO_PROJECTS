// Sprint 11 - MongoDB (Reviews + Wishlist).
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },
    resolved: { type: Boolean, default: false },
    hidden: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true, // expone el virtual "id" (_id.toString()) en el JSON
      transform: (_doc, ret) => {
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);