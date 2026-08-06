// Sprint 7 - router base. Cada módulo se monta en el sprint donde se construyó
// (auth: 10, productos: 8/9, reviews/wishlist: 11, carrito/pedidos: 12).
import { Router } from "express";
import authRoutes, { meHandler } from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import reviewTopLevelRoutes from "./reviewTopLevel.routes.js";
import wishlistRoutes from "./wishlist.routes.js";
import cartRoutes from "./cart.routes.js";
import orderRoutes from "./order.routes.js";

const router = Router();

router.use("/auth", authRoutes);

// El PDF de Project Break 2 pide explícitamente GET /api/me (no /api/auth/me)
router.get("/me", ...meHandler);

router.use("/products", productRoutes); // incluye /products/:id/reviews anidado
router.use("/reviews", reviewTopLevelRoutes); // DELETE /reviews/:reviewId
router.use("/wishlist", wishlistRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);

export default router;
