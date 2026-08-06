// Sprint 12 - Carrito y Checkout.
import { fail } from "../utils/response.js";

export function validateAddItem(req, res, next) {
  const { productId, quantity } = req.body;
  const errors = [];

  if (!productId || typeof productId !== "string") {
    errors.push("El campo 'productId' es obligatorio.");
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    errors.push("El campo 'quantity' es obligatorio y debe ser un entero >= 1.");
  }

  if (errors.length > 0) {
    return fail(res, errors.join(" "), 400);
  }
  next();
}

export function validateQuantity(req, res, next) {
  const { quantity } = req.body;

  if (!Number.isInteger(quantity) || quantity < 1) {
    return fail(res, "El campo 'quantity' es obligatorio y debe ser un entero >= 1.", 400);
  }
  next();
}
