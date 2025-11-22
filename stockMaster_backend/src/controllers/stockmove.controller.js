// src/controllers/stockmove.controller.js
import prisma from "../config/db.js";
import { success, fail } from "../utils/response.js";
import * as stockService from "../services/stock.service.js";

// GET /api/v1/stock-moves?product_id=&limit=
export const listStockMoves = async (req, res, next) => {
  try {
    const { product_id, limit = 20 } = req.query;
    if (product_id) {
      const moves = await prisma.stockMove.findMany({
        where: { productId: Number(product_id) },
        orderBy: { createdAt: "desc" },
        take: Number(limit),
        include: { product: true }
      });
      return success(res, moves);
    }
    const recent = await stockService.getRecentStockMoves({ limit: Number(limit) });
    return success(res, recent);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/stock-moves/:id
export const getStockMoveById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const move = await prisma.stockMove.findUnique({ where: { id }, include: { product: true }});
    if (!move) return fail(res, "Move not found", 404);
    return success(res, move);
  } catch (err) {
    next(err);
  }
};
