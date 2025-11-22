// inside adjustment.controller.js
import prisma from "../config/db.js";
import * as stockService from "../services/stock.service.js";

export const createAdjustment = async (req, res, next) => {
  try {
    const { warehouse_id, location_id, lines, reference } = req.body;
    // create adjustment master
    const adj = await prisma.adjustment.create({
      data: {
        reference: reference || `ADJ-${Date.now()}`,
        warehouseId: warehouse_id,
        locationId: location_id,
        status: "done",
        lines: {
          create: lines.map(l => ({
            productId: l.product_id,
            qtyRecorded: l.qty_recorded || 0,
            qtyCounted: l.qty_counted,
            difference: (l.qty_counted - (l.qty_recorded || 0)),
            reason: l.reason || null
          }))
        }
      },
      include: { lines: true }
    });

    // call stockService.adjustStock to apply changes and create moves
    const moves = await stockService.adjustStock({
      warehouseId: warehouse_id,
      locationId: location_id,
      lines: lines.map(l => ({ productId: l.product_id, qty_counted: l.qty_counted, uom: l.uom || null, reason: l.reason })),
      reference: adj.reference
    });

    return res.json({ success:true, adjustment: adj, stock_moves: moves });
  } catch (err) {
    next(err);
  }
};

// src/controllers/adjustment.controller.js
import * as adjustmentService from "../services/adjustment.service.js";
import { success, fail } from "../utils/response.js";

export const listAdjustments = async (req, res, next) => {
  try {
    const { status, warehouse_id } = req.query;
    const rows = await adjustmentService.listAdjustments({ status, warehouse_id });
    return success(res, rows);
  } catch (err) {
    next(err);
  }
};

export const getAdjustmentById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await adjustmentService.getAdjustmentById(id);
    if (!row) return fail(res, "Adjustment not found", 404);
    return success(res, row);
  } catch (err) {
    next(err);
  }
};

export const updateAdjustment = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const updated = await adjustmentService.updateAdjustment(id, req.body);
    return success(res, updated, "Adjustment updated");
  } catch (err) {
    next(err);
  }
};

export const deleteAdjustment = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await adjustmentService.deleteAdjustment(id);
    return success(res, null, "Adjustment deleted");
  } catch (err) {
    next(err);
  }
};
