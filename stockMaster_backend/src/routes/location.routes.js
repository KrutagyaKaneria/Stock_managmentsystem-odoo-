import express from "express";
import * as locationController from "../controllers/location.controller.js";

const router = express.Router();

// CREATE location under a warehouse
router.post("/", locationController.createLocation);

// GET all locations
router.get("/", locationController.getAllLocations);

// GET locations inside a specific warehouse
router.get("/warehouse/:warehouseId", locationController.getLocationsByWarehouse);

// GET one location (with stock)
router.get("/:id", locationController.getLocationById);

// UPDATE location
router.put("/:id", locationController.updateLocation);

// DELETE location
router.delete("/:id", locationController.deleteLocation);

export default router;
