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

// Media y nº de reviews de TODOS los productos en una sola agregación
// (usado por product.service.js al listar el catálogo: evita N+1 consultas).
// Devuelve un Map: productId -> { avgRating, reviewCount }
export async function getAverageRatingsByProduct() {
  const results = await Review.aggregate([
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

// Media y nº de reviews de UN producto (usado en el detalle: no tiene
// sentido traer la agregación completa de los 34 productos para mostrar uno).
export async function getAverageRatingForProduct(productId) {
  const [result] = await Review.aggregate([
    { $match: { productId } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } },
  ]);

  return result
    ? { avgRating: result.avgRating, reviewCount: result.reviewCount }
    : { avgRating: null, reviewCount: 0 };
}