// Sprint 11 - MongoDB (Reviews + Wishlist).
import * as reviewService from "../services/review.service.js";
import { ok } from "../utils/response.js";

export async function getReviews(req, res, next) {
  try {
    const includeHidden = req.user?.role === "ADMIN";
    const reviews = await reviewService.getReviewsByProduct(req.params.id, { includeHidden });
    return ok(res, { reviews });
  } catch (err) {
    next(err);
  }
}

export async function createReview(req, res, next) {
  try {
    const { rating, comment } = req.body;
    const review = await reviewService.createReview({
      productId: req.params.id,
      userId: req.user.sub,
      rating,
      comment,
    });
    return ok(res, { review }, 201);
  } catch (err) {
    next(err);
  }
}

export async function deleteReview(req, res, next) {
  try {
    await reviewService.deleteReview(req.params.reviewId, req.user);
    return ok(res, { message: "Review eliminada correctamente." });
  } catch (err) {
    next(err);
  }
}

export async function getNegativeReviews(req, res, next) {
  try {
    const reviews = await reviewService.getNegativeReviews();
    return ok(res, { reviews });
  } catch (err) {
    next(err);
  }
}

export async function resolveReview(req, res, next) {
  try {
    const review = await reviewService.resolveReview(req.params.reviewId);
    return ok(res, { review });
  } catch (err) {
    next(err);
  }
}

export async function hideReview(req, res, next) {
  try {
    const review = await reviewService.hideReview(req.params.reviewId);
    return ok(res, { review });
  } catch (err) {
    next(err);
  }
}

export async function unhideReview(req, res, next) {
  try {
    const review = await reviewService.unhideReview(req.params.reviewId);
    return ok(res, { review });
  } catch (err) {
    next(err);
  }
}