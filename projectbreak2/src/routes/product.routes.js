// Sprint 8/9 - rutas de producto. Reviews anidadas: Sprint 11.
// Subida de imagen: Project Break 2 - Mejora opcional 1 (Cloudinary).
import { Router } from "express";
import * as productController from "../controllers/product.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { requireRole } from "../middlewares/requireRole.js";
import { validateProduct } from "../middlewares/validateProduct.js";
import { upload } from "../middlewares/upload.js";
import reviewRoutes from "./review.routes.js";

const router = Router();

// Públicas
router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);

// Protegidas (solo ADMIN)
router.post("/", authenticate, requireRole("ADMIN"), validateProduct, productController.createProduct);
router.put("/:id", authenticate, requireRole("ADMIN"), validateProduct, productController.updateProduct);
router.delete("/:id", authenticate, requireRole("ADMIN"), productController.deleteProduct);
router.post(
  "/:id/image",
  authenticate,
  requireRole("ADMIN"),
  upload.single("image"),
  productController.uploadProductImage
);

// Reviews anidadas: GET/POST /api/products/:id/reviews
router.use("/:id/reviews", reviewRoutes);

export default router;
