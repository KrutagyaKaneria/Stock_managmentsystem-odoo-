// src/routes/warehouse.routes.js
import express from "express";
import * as warehouseController from "../controllers/warehouse.controller.js";

const router = express.Router();

// GET all warehouses (with optional include locations)
router.get("/", warehouseController.getAllWarehouses);

// POST create warehouse
router.post("/", warehouseController.createWarehouse);

// GET one warehouse by id (include locations & stock summary)
router.get("/:id", warehouseController.getWarehouseById);

// PUT update
router.put("/:id", warehouseController.updateWarehouse);

// DELETE
router.delete("/:id", warehouseController.deleteWarehouse);

export default router;
