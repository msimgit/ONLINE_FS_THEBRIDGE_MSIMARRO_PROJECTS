// Sprint 11 - MongoDB (Reviews + Wishlist).
import mongoose from "mongoose";

// productId y userId son los ids (cuid) de las tablas Product/User en Postgres.
// Mongo no puede hacer un "foreign key" real entre bases distintas, así que
// los guardamos como String y validamos su existencia desde el service con Prisma.
const reviewSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

// Un usuario solo puede dejar una review por producto
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
