import express from "express";
import * as transferController from "../controllers/transfer.controller.js";

const router = express.Router();

// List transfers
router.get("/", transferController.listTransfers);

// Create transfer (draft)
router.post("/", transferController.createTransfer);

// Get transfer by ID
router.get("/:id", transferController.getTransferById);

// Update transfer (only draft)
router.put("/:id", transferController.updateTransfer);

// Validate transfer (perform internal stock movement)
router.post("/:id/validate", transferController.validateTransfer);

// Delete transfer
router.delete("/:id", transferController.deleteTransfer);

export default router;
