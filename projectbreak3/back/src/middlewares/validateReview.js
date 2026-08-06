// Sprint 11 - MongoDB (Reviews + Wishlist).
import { fail } from "../utils/response.js";

export function validateReview(req, res, next) {
  const { rating, comment } = req.body;
  const errors = [];

  if (rating === undefined || typeof rating !== "number" || rating < 1 || rating > 5) {
    errors.push("El campo 'rating' es obligatorio y debe ser un número entre 1 y 5.");
  }

  if (comment !== undefined && comment !== null && typeof comment !== "string") {
    errors.push("El campo 'comment' debe ser texto.");
  }

  if (errors.length > 0) {
    return fail(res, errors.join(" "), 400);
  }

  next();
}
