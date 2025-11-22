import express from "express";
import * as deliveryController from "../controllers/delivery.controller.js";

const router = express.Router();

// List deliveries
router.get("/", deliveryController.listDeliveries);

// Create delivery (draft)
router.post("/", deliveryController.createDelivery);

// Get delivery by id
router.get("/:id", deliveryController.getDeliveryById);

// Update delivery (only draft)
router.put("/:id", deliveryController.updateDelivery);

// Validate delivery (apply stock deduction)
router.post("/:id/validate", deliveryController.validateDelivery);

// Delete delivery
router.delete("/:id", deliveryController.deleteDelivery);

export default router;
