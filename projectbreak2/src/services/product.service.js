// Sprint 8 (capas controller/service) + Sprint 9 (CRUD con Prisma).
// setProductImage añadido en Project Break 2 - Mejora opcional 1 (Cloudinary).
// avgRating/reviewCount añadidos cruzando con Mongo (Sprint 16): las reviews
// viven en otra base de datos, así que no se puede hacer un include de Prisma.
// En vez de una consulta a Mongo por producto (N+1), una sola agregación
// trae la media de TODOS los productos de golpe y se cruza aquí por id.
import prisma from "../config/prismaClient.js";
import { AppError } from "../utils/AppError.js";
import * as reviewService from "./review.service.js";

function withRating(product, ratingsMap) {
  const rating = ratingsMap.get(product.id);
  return {
    ...product,
    avgRating: rating?.avgRating ?? null,
    reviewCount: rating?.reviewCount ?? 0,
  };
}

// query soporta: ?search=texto  y  ?sort=price_asc|price_desc|recent
export async function getAllProducts(query = {}) {
  const { search, sort } = query;

  const where = search
    ? { name: { contains: search, mode: "insensitive" } }
    : undefined;

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
      ? { price: "desc" }
      : { createdAt: "desc" }; // "recent" / por defecto

  // Prisma y Mongo son independientes: pedimos las dos cosas en paralelo
  const [products, ratingsMap] = await Promise.all([
    prisma.product.findMany({ where, orderBy }),
    reviewService.getAverageRatingsByProduct(),
  ]);

  return products.map((product) => withRating(product, ratingsMap));
}

// Lookup interno sin rating: lo usan update/delete/setImage solo para
// comprobar que el producto existe (lanzando 404 si no) — no necesitan
// tocar Mongo para eso, sería una consulta desperdiciada en cada escritura.
async function findProductOrThrow(id) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new AppError("Producto no encontrado.", 404);
  }
  return product;
}

export async function getProductById(id) {
  const product = await findProductOrThrow(id);
  const { avgRating, reviewCount } = await reviewService.getAverageRatingForProduct(id);
  return { ...product, avgRating, reviewCount };
}

export async function createProduct(data) {
  return prisma.product.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      stock: data.stock,
      imageUrl: data.imageUrl ?? null,
    },
  });
}

export async function updateProduct(id, data) {
  await findProductOrThrow(id); // lanza 404 si no existe, antes de intentar el update

  return prisma.product.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.stock !== undefined && { stock: data.stock }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
    },
  });
}

export async function deleteProduct(id) {
  await findProductOrThrow(id); // lanza 404 si no existe

  await prisma.product.delete({ where: { id } });
}

export async function setProductImage(id, imageUrl) {
  await findProductOrThrow(id); // lanza 404 si no existe

  return prisma.product.update({
    where: { id },
    data: { imageUrl },
  });
}