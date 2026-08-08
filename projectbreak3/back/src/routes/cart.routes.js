// Sprint 12 - Carrito y Checkout.
// POST /checkout ELIMINADO: crear un pedido ya no es algo que el cliente
// pueda pedir directamente. Ahora solo lo hace el webhook de Stripe
// (webhook.controller.js), server-a-servidor, cuando el pago se confirma
// de verdad. Ver GET /orders/by-session/:sessionId más abajo para cómo
// consulta el frontend si el pedido ya existe.
import { Router } from "express";
import * as cartController from "../controllers/cart.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import {
  validateAddItem,
  validateQuantity,
} from "../middlewares/validateCart.js";

const router = Router();

router.use(authenticate); // todo el carrito requiere usuario logueado

router.get("/", cartController.getCart);
router.post("/items", validateAddItem, cartController.addItem);
router.put("/items/:itemId", validateQuantity, cartController.updateItem);
router.delete("/items/:itemId", cartController.removeItem);
router.get("/orders/by-session/:sessionId", cartController.getOrderBySessionId);

export default router;
