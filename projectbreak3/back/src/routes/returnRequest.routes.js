import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import * as returnRequestController from "../controllers/returnRequest.controller.js";

const router = Router();

router.get("/", authenticate, requireAdmin, returnRequestController.listReturnRequests);
router.put("/:id/approve", authenticate, requireAdmin, returnRequestController.approveReturnRequest);
router.put("/:id/reject", authenticate, requireAdmin, returnRequestController.rejectReturnRequest);

export default router;