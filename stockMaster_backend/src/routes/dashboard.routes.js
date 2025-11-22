import express from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/", dashboardController.getDashboardStats);
router.get("/low-stock", dashboardController.getLowStockProducts);
router.get("/recent-moves", dashboardController.getRecentStockMoves);
router.get("/warehouse-summary", dashboardController.getWarehouseSummary);
router.get("/top-products", dashboardController.getTopMovingProducts);

export default router;
