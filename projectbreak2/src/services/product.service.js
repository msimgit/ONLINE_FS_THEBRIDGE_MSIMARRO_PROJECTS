// Sprint 8 (capas controller/service) + Sprint 9 (CRUD con Prisma).
// setProductImage añadido en Project Break 2 - Mejora opcional 1 (Cloudinary).
import prisma from "../config/prismaClient.js";
import { AppError } from "../utils/AppError.js";

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

  return prisma.product.findMany({ where, orderBy });
}

export async function getProductById(id) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new AppError("Producto no encontrado.", 404);
  }
  return product;
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
  await getProductById(id); // lanza 404 si no existe, antes de intentar el update

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
  await getProductById(id); // lanza 404 si no existe

  await prisma.product.delete({ where: { id } });
}

export async function setProductImage(id, imageUrl) {
  await getProductById(id); // lanza 404 si no existe

  return prisma.product.update({
    where: { id },
    data: { imageUrl },
  });
}
