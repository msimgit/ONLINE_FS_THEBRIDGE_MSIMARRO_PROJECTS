import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import * as reviewController from "../controllers/review.controller.js";

const router = Router();

router.get("/negative", authenticate, requireAdmin, reviewController.getNegativeReviews);
router.put("/:reviewId/resolve", authenticate, requireAdmin, reviewController.resolveReview);
router.put("/:reviewId/hide", authenticate, requireAdmin, reviewController.hideReview);
router.put("/:reviewId/unhide", authenticate, requireAdmin, reviewController.unhideReview);

export default router;