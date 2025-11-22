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
