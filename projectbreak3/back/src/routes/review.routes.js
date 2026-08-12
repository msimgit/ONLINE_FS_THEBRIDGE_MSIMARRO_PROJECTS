// Sprint 11 - MongoDB (Reviews + Wishlist).
import { Router } from "express";
import * as reviewController from "../controllers/review.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { optionalAuthenticate } from "../middlewares/optionalAuthenticate.js";
import { validateReview } from "../middlewares/validateReview.js";

const router = Router({ mergeParams: true });

router.get("/", optionalAuthenticate, reviewController.getReviews);
router.post("/", authenticate, validateReview, reviewController.createReview);

export default router;
