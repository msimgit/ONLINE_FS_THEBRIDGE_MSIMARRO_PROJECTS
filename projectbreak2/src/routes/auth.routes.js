// Sprint 10 - Autenticación + Autorización + Seguridad.
import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validateRegister, validateLogin } from "../middlewares/validateAuth.js";

const router = Router();

router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);
router.post("/logout", authController.logout);

// GET /api/me vive fuera de /auth (lo monta index.routes.js directamente)
export const meHandler = [authenticate, authController.me];

export default router;
