// src/routes/adjustment.routes.js
import express from "express";
import * as adjustmentController from "../controllers/adjustment.controller.js";

const router = express.Router();

// List adjustments (optional filters)
router.get("/", adjustmentController.listAdjustments);

// Create adjustment (and apply it immediately)
router.post("/", adjustmentController.createAdjustment);

// Get adjustment by id
router.get("/:id", adjustmentController.getAdjustmentById);

// Update adjustment (only if draft)
router.put("/:id", adjustmentController.updateAdjustment);

// Delete adjustment
router.delete("/:id", adjustmentController.deleteAdjustment);

export default router;
