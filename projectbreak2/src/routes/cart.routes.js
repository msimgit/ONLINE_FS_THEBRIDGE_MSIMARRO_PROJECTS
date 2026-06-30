// Sprint 12 - Carrito y Checkout.
import { Router } from "express";
import * as cartController from "../controllers/cart.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validateAddItem, validateQuantity } from "../middlewares/validateCart.js";

const router = Router();

router.use(authenticate); // todo el carrito requiere usuario logueado

router.get("/", cartController.getCart);
router.post("/items", validateAddItem, cartController.addItem);
router.put("/items/:itemId", validateQuantity, cartController.updateItem);
router.delete("/items/:itemId", cartController.removeItem);
router.post("/checkout", cartController.checkout);

export default router;
