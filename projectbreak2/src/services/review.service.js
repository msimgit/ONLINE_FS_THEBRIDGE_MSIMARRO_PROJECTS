// Sprint 11 - MongoDB (Reviews + Wishlist).
import Review from "../models/Review.js";
import prisma from "../config/prismaClient.js";
import { AppError } from "../utils/AppError.js";

async function ensureProductExists(productId) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError("Producto no encontrado.", 404);
  }
}

export async function getReviewsByProduct(productId) {
  await ensureProductExists(productId);
  return Review.find({ productId }).sort({ createdAt: -1 });
}

export async function createReview({ productId, userId, rating, comment }) {
  await ensureProductExists(productId);

  const existing = await Review.findOne({ productId, userId });
  if (existing) {
    throw new AppError("Ya has dejado una review en este producto.", 409);
  }

  return Review.create({ productId, userId, rating, comment });
}

export async function deleteReview(reviewId, requester) {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError("Review no encontrada.", 404);
  }

  const isOwner = review.userId === requester.sub;
  const isAdmin = requester.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    throw new AppError("No tienes permiso para borrar esta review.", 403);
  }

  await review.deleteOne();
}
