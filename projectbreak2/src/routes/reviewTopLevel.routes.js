// Sprint 11 - MongoDB (Reviews + Wishlist).
import { Router } from "express";
import * as reviewController from "../controllers/review.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.delete("/:reviewId", authenticate, reviewController.deleteReview);

export default router;
