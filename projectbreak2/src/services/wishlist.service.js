// Sprint 11 - MongoDB (Reviews + Wishlist).
import Wishlist from "../models/Wishlist.js";
import prisma from "../config/prismaClient.js";
import { AppError } from "../utils/AppError.js";

async function ensureProductExists(productId) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError("Producto no encontrado.", 404);
  }
}

// findOneAndUpdate con upsert: crea la wishlist del usuario si es la primera vez
async function getOrCreateWishlist(userId) {
  return Wishlist.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, productIds: [] } },
    { new: true, upsert: true }
  );
}

export async function getWishlist(userId) {
  return getOrCreateWishlist(userId);
}

export async function addToWishlist(userId, productId) {
  await ensureProductExists(productId);

  // $addToSet evita duplicados sin necesidad de comprobarlo a mano
  return Wishlist.findOneAndUpdate(
    { userId },
    { $addToSet: { productIds: productId } },
    { new: true, upsert: true }
  );
}

export async function removeFromWishlist(userId, productId) {
  return Wishlist.findOneAndUpdate(
    { userId },
    { $pull: { productIds: productId } },
    { new: true, upsert: true }
  );
}
