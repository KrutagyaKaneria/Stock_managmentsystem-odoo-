// src/controllers/warehouse.controller.js
import * as warehouseService from "../services/warehouse.service.js";
import { success, fail } from "../utils/response.js";

export const getAllWarehouses = async (req, res, next) => {
  try {
    const { includeLocations } = req.query; // e.g., /api/v1/warehouses?includeLocations=true
    const warehouses = await warehouseService.getAllWarehouses(includeLocations === "true");
    return success(res, warehouses);
  } catch (err) {
    next(err);
  }
};

export const createWarehouse = async (req, res, next) => {
  try {
    const payload = req.body; // { name, location_code }
    const warehouse = await warehouseService.createWarehouse(payload);
    return success(res, warehouse, "Warehouse created");
  } catch (err) {
    next(err);
  }
};

export const getWarehouseById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const warehouse = await warehouseService.getWarehouseById(id);
    if (!warehouse) return fail(res, "Warehouse not found", 404);
    return success(res, warehouse);
  } catch (err) {
    next(err);
  }
};

export const updateWarehouse = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const payload = req.body; // { name, location_code }
    const warehouse = await warehouseService.updateWarehouse(id, payload);
    return success(res, warehouse, "Warehouse updated");
  } catch (err) {
    next(err);
  }
};

export const deleteWarehouse = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await warehouseService.deleteWarehouse(id);
    return success(res, null, "Warehouse deleted");
  } catch (err) {
    next(err);
  }
};
