// Sprint 11 - MongoDB (Reviews + Wishlist).
import { Router } from "express";
import * as reviewController from "../controllers/review.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validateReview } from "../middlewares/validateReview.js";

// mergeParams: true para poder leer req.params.id (el id del producto)
// definido en el router padre (product.routes.js)
const router = Router({ mergeParams: true });

router.get("/", reviewController.getReviews);
router.post("/", authenticate, validateReview, reviewController.createReview);

export default router;
