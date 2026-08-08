import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { createCheckoutSession } from "../controllers/checkout.controller.js";

const router = Router();
router.post("/", authenticate, createCheckoutSession);

export default router;
