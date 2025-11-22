// src/routes/receipt.routes.js
import express from "express";
import * as receiptController from "../controllers/receipt.controller.js";

const router = express.Router();

// List receipts with optional status, warehouse filter
router.get("/", receiptController.listReceipts);

// Create receipt (draft)
router.post("/", receiptController.createReceipt);

// Get receipt by id (with lines)
router.get("/:id", receiptController.getReceiptById);

// Update receipt (edit lines etc.)
router.put("/:id", receiptController.updateReceipt);

// Receive / validate receipt (apply stock)
router.post("/:id/receive", receiptController.receiveReceipt);

// Delete receipt
router.delete("/:id", receiptController.deleteReceipt);

export default router;
