import * as locationService from "../services/location.service.js";
import { success, fail } from "../utils/response.js";

// POST /api/v1/locations
export const createLocation = async (req, res, next) => {
  try {
    const location = await locationService.createLocation(req.body);
    return success(res, location, "Location created");
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/locations
export const getAllLocations = async (req, res, next) => {
  try {
    const locations = await locationService.getAllLocations();
    return success(res, locations);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/locations/warehouse/:warehouseId
export const getLocationsByWarehouse = async (req, res, next) => {
  try {
    const locations = await locationService.getLocationsByWarehouse(
      Number(req.params.warehouseId)
    );
    return success(res, locations);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/locations/:id
export const getLocationById = async (req, res, next) => {
  try {
    const location = await locationService.getLocationById(Number(req.params.id));
    if (!location) return fail(res, "Location not found", 404);
    return success(res, location);
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/locations/:id
export const updateLocation = async (req, res, next) => {
  try {
    const location = await locationService.updateLocation(
      Number(req.params.id),
      req.body
    );
    return success(res, location, "Location updated");
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/locations/:id
export const deleteLocation = async (req, res, next) => {
  try {
    await locationService.deleteLocation(Number(req.params.id));
    return success(res, null, "Location deleted");
  } catch (err) {
    next(err);
  }
};
