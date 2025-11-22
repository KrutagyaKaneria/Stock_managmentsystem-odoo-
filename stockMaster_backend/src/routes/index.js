// src/routes/index.js
import express from "express";

import productRoutes from "./product.routes.js";
import warehouseRoutes from "./warehouse.routes.js";
import locationRoutes from "./location.routes.js";
import receiptRoutes from "./receipt.routes.js";
import deliveryRoutes from "./delivery.routes.js";
import transferRoutes from "./transfer.routes.js";
import adjustmentRoutes from "./adjustment.routes.js";
import stockMoveRoutes from "./stockmove.routes.js";
import dashboardRoutes from "./dashboard.routes.js";

const router = express.Router();

router.use("/products", productRoutes);
router.use("/warehouses", warehouseRoutes);
router.use("/locations", locationRoutes);
router.use("/receipts", receiptRoutes);
router.use("/deliveries", deliveryRoutes);
router.use("/transfers", transferRoutes);
router.use("/adjustments", adjustmentRoutes);
router.use("/stock-moves", stockMoveRoutes);
router.use("/dashboard", dashboardRoutes);

// health check
router.get("/health", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

export default router;
