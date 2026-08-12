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

// $ne: true (en vez de hidden: false) para que también encaje con reviews
// antiguas creadas antes de existir este campo, que no lo tienen guardado.
export async function getReviewsByProduct(productId, { includeHidden = false } = {}) {
  await ensureProductExists(productId);
  const filter = includeHidden ? { productId } : { productId, hidden: { $ne: true } };
  return Review.find(filter).sort({ createdAt: -1 });
}

export async function createReview({ productId, userId, rating, comment }) {
  await ensureProductExists(productId);

  const existing = await Review.findOne({ productId, userId });
  if (existing) {
    throw new AppError("Ya has dejado una review en este producto.", 409);
  }

  return Review.create({ productId, userId, rating, comment });
}

export async function unhideReview(reviewId) {
  const review = await Review.findById(reviewId);
  if (!review) throw new AppError("Review no encontrada.", 404);

  review.hidden = false;
  await review.save();
  return review;
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

export async function getAverageRatingsByProduct() {
  const results = await Review.aggregate([
    { $match: { hidden: { $ne: true } } },
    {
      $group: {
        _id: "$productId",
        avgRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const map = new Map();
  for (const r of results) {
    map.set(r._id, { avgRating: r.avgRating, reviewCount: r.reviewCount });
  }
  return map;
}

export async function getAverageRatingForProduct(productId) {
  const [result] = await Review.aggregate([
    { $match: { productId, hidden: { $ne: true } } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } },
  ]);

  return result
    ? { avgRating: result.avgRating, reviewCount: result.reviewCount }
    : { avgRating: null, reviewCount: 0 };
}

// ============ ADMIN: incidencias de comentarios ============

// Valoraciones < 4 estrellas, no resueltas todavía. Cruzamos con Prisma para
// traer nombre/imagen del producto (Mongo no puede hacer join real).
export async function getNegativeReviews() {
  const reviews = await Review.find({
    rating: { $lt: 4 },
    resolved: { $ne: true },
  }).sort({ createdAt: -1 });

  if (reviews.length === 0) return [];

  const productIds = [...new Set(reviews.map((r) => r.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  return reviews.map((r) => ({
    id: r._id.toString(),
    productId: r.productId,
    userId: r.userId,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
    product: productMap.get(r.productId) ?? null,
  }));
}

export async function resolveReview(reviewId) {
  const review = await Review.findById(reviewId);
  if (!review) throw new AppError("Review no encontrada.", 404);

  review.resolved = true;
  await review.save();
  return review;
}

export async function hideReview(reviewId) {
  const review = await Review.findById(reviewId);
  if (!review) throw new AppError("Review no encontrada.", 404);

  review.hidden = true;
  await review.save();
  return review;
}
