// Sprint 8 (capas controller/service) + Sprint 9 (CRUD con Prisma).
// uploadProductImage añadido en Project Break 2 - Mejora opcional 1 (Cloudinary).
import * as productService from "../services/product.service.js";
import { uploadImageBuffer } from "../services/upload.service.js";
import { ok, fail } from "../utils/response.js";

export async function getProducts(req, res, next) {
  try {
    const products = await productService.getAllProducts(req.query);
    return ok(res, { products });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    return ok(res, { product });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const product = await productService.createProduct(req.body);
    return ok(res, { product }, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    return ok(res, { product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    await productService.deleteProduct(req.params.id);
    return ok(res, { message: "Producto eliminado correctamente." });
  } catch (err) {
    next(err);
  }
}

export async function uploadProductImage(req, res, next) {
  try {
    if (!req.file) {
      return fail(res, "Falta el archivo de imagen (campo 'image').", 400);
    }

    const result = await uploadImageBuffer(req.file.buffer);
    const product = await productService.setProductImage(req.params.id, result.secure_url);

    return ok(res, { product });
  } catch (err) {
    next(err);
  }
}
