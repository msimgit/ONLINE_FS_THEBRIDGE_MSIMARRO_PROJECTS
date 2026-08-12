// Sprint 12 - Carrito y Checkout.
import { Router } from "express";
import * as cartController from "../controllers/cart.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.get("/", authenticate, cartController.getOrders);
router.post("/:id/return", authenticate, cartController.requestReturn);

export default router;
