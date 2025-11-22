import express from "express";
import * as ctrl from "../controllers/stockmove.controller.js";
const router = express.Router();

router.get("/", ctrl.listStockMoves);
router.get("/:id", ctrl.getStockMoveById);

export default router;
