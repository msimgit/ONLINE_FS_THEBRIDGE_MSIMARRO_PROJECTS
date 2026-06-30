// Sprint 11 - MongoDB (Reviews + Wishlist).
import { Router } from "express";
import * as wishlistController from "../controllers/wishlist.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.use(authenticate); // todas las rutas de wishlist requieren login

router.get("/", wishlistController.getWishlist);
router.post("/:productId", wishlistController.addToWishlist);
router.delete("/:productId", wishlistController.removeFromWishlist);

export default router;
