// Sprint 8 - validaciones básicas y errores HTTP.
import { fail } from "../utils/response.js";

// En POST (creación) los campos obligatorios deben venir siempre.
// En PUT (actualización parcial) solo validamos los campos que vengan.
export function validateProduct(req, res, next) {
  const isCreate = req.method === "POST";
  const { name, price, stock, description, imageUrl } = req.body;
  const errors = [];

  if (isCreate || name !== undefined) {
    if (!name || typeof name !== "string" || name.trim() === "") {
      errors.push("El campo 'name' es obligatorio y debe ser texto.");
    }
  }

  if (isCreate || price !== undefined) {
    if (price === undefined || typeof price !== "number" || price < 0) {
      errors.push("El campo 'price' es obligatorio y debe ser un número positivo.");
    }
  }

  if (isCreate || stock !== undefined) {
    if (stock === undefined || typeof stock !== "number" || !Number.isInteger(stock) || stock < 0) {
      errors.push("El campo 'stock' es obligatorio y debe ser un número entero positivo.");
    }
  }

  if (description !== undefined && description !== null && typeof description !== "string") {
    errors.push("El campo 'description' debe ser texto.");
  }

  if (imageUrl !== undefined && imageUrl !== null && typeof imageUrl !== "string") {
    errors.push("El campo 'imageUrl' debe ser texto (URL).");
  }

  if (errors.length > 0) {
    return fail(res, errors.join(" "), 400);
  }

  next();
}
