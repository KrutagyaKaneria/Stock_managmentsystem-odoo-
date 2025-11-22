import * as dashboardService from "../services/dashboard.service.js";
import { success } from "../utils/response.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    return success(res, stats);
  } catch (err) { next(err); }
};

export const getLowStockProducts = async (req, res, next) => {
  try {
    const rows = await dashboardService.getLowStockProducts();
    return success(res, rows);
  } catch (err) { next(err); }
};

export const getRecentStockMoves = async (req, res, next) => {
  try {
    const rows = await dashboardService.getRecentStockMoves();
    return success(res, rows);
  } catch (err) { next(err); }
};

export const getWarehouseSummary = async (req, res, next) => {
  try {
    const rows = await dashboardService.getWarehouseSummary();
    return success(res, rows);
  } catch (err) { next(err); }
};

export const getTopMovingProducts = async (req, res, next) => {
  try {
    const rows = await dashboardService.getTopMovingProducts();
    return success(res, rows);
  } catch (err) { next(err); }
};
