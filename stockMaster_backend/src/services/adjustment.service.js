// src/services/adjustment.service.js
import prisma from "../config/db.js";
import * as stockService from "./stock.service.js";

/**
 * List adjustments with optional filters
 */
export const listAdjustments = async ({ status, warehouse_id } = {}) => {
  const where = {};
  if (status) where.status = status;
  if (warehouse_id) where.warehouseId = Number(warehouse_id);

  const rows = await prisma.adjustment.findMany({
    where,
    include: {
      lines: { include: { product: true } },
      warehouse: true,
      location: true
    },
    orderBy: { createdAt: "desc" }
  });

  return rows.map(r => ({
    id: r.id,
    reference: r.reference,
    warehouse_id: r.warehouseId,
    location_id: r.locationId,
    status: r.status,
    created_at: r.createdAt,
    lines: r.lines.map(l => ({
      id: l.id,
      product_id: l.productId,
      product_name: l.product?.name || null,
      qty_recorded: Number(l.qtyRecorded),
      qty_counted: Number(l.qtyCounted),
      difference: Number(l.difference),
      reason: l.reason,
      uom: l.uom
    }))
  }));
};

/**
 * Create adjustment master record and apply counts (transactional)
 * payload: { reference?, warehouse_id, location_id, lines: [{ product_id, qty_recorded, qty_counted, uom, reason }] }
 *
 * This will:
 *  - create adjustment + lines (status = done)
 *  - update stock records for each line
 *  - create stockMove entries via stockService.adjustStock (or direct tx usage)
 */
// export const createAdjustment = async (payload) => {
//   if (!payload || !payload.lines || !Array.isArray(payload.lines) || payload.lines.length === 0) {
//     throw new Error("Invalid adjustment payload: lines required");
//   }

//   const reference = payload.reference || `ADJ-${Date.now()}`;

//   // create adjustment with lines, then apply changes in same transaction
//   const result = await prisma.$transaction(async (tx) => {
//     const adj = await tx.adjustment.create({
//       data: {
//         reference,
//         warehouseId: payload.warehouse_id,
//         locationId: payload.location_id,
//         status: "done", // apply immediately for hackathon scope
//         lines: {
//           create: payload.lines.map(l => ({
//             productId: l.product_id,
//             qtyRecorded: l.qty_recorded ?? 0,
//             qtyCounted: l.qty_counted,
//             difference: (Number(l.qty_counted) - Number(l.qty_recorded ?? 0)),
//             reason: l.reason || null,
//             uom: l.uom || null
//           }))
//         }
//       },
//       include: { lines: true }
//     });

//     // apply adjustments: update stockRecord per line and create stockMove entries
//     const moves = [];
//     for (const L of adj.lines) {
//       const pid = L.productId;
//       const counted = Number(L.qtyCounted);
//       const recorded = Number(L.qtyRecorded);

//       // find existing stock record at location
//       const existing = await tx.stockRecord.findFirst({
//         where: { productId: pid, locationId: payload.location_id }
//       });

//       if (existing) {
//         // update to counted
//         await tx.stockRecord.update({
//           where: { id: existing.id },
//           data: { quantity: counted, uom: L.uom || existing.uom }
//         });
//       } else {
//         // create new record with counted qty
//         await tx.stockRecord.create({
//           data: {
//             productId: pid,
//             warehouseId: payload.warehouse_id,
//             locationId: payload.location_id,
//             quantity: counted,
//             uom: L.uom || null
//           }
//         });
//       }

//       // create a stockMove representing the adjustment (quantity absolute difference)
//       const diff = counted - recorded;
//       const move = await tx.stockMove.create({
//         data: {
//           type: "adjustment",
//           reference,
//           productId: pid,
//           fromLocationId: diff < 0 ? payload.location_id : null,
//           toLocationId: diff > 0 ? payload.location_id : null,
//           quantity: Math.abs(diff),
//           uom: L.uom || null,
//           status: "done",
//           createdBy: null
//         }
//       });
//       moves.push(move);

//       // if stock decreased, check low stock after transaction (we'll notify after tx)
//     }

//     return { adjustment: adj, stock_moves: moves };
//   });

//   // after transaction: run low-stock notifications for any decreased lines
//   for (const L of payload.lines) {
//     const diff = Number(L.qty_counted) - Number(L.qty_recorded ?? 0);
//     if (diff < 0) {
//       // check and notify at warehouse level
//       try {
//         await stockService.checkAndNotifyLowStock(L.product_id, payload.warehouse_id);
//       } catch (err) {
//         // log and continue
//         console.error("Low stock check failed for product", L.product_id, err);
//       }
//     }
//   }

//   // format return
//   return {
//     id: result.adjustment.id,
//     reference: result.adjustment.reference,
//     warehouse_id: result.adjustment.warehouseId,
//     location_id: result.adjustment.locationId,
//     status: result.adjustment.status,
//     stock_moves: result.stock_moves
//   };
// };

/**
 * Get adjustment by id
 */
export const getAdjustmentById = async (id) => {
  const r = await prisma.adjustment.findUnique({
    where: { id },
    include: { lines: { include: { product: true } }, warehouse: true, location: true }
  });
  if (!r) return null;
  return {
    id: r.id,
    reference: r.reference,
    warehouse_id: r.warehouseId,
    location_id: r.locationId,
    status: r.status,
    created_at: r.createdAt,
    lines: r.lines.map(l => ({
      id: l.id,
      product_id: l.productId,
      product_name: l.product?.name || null,
      qty_recorded: Number(l.qtyRecorded),
      qty_counted: Number(l.qtyCounted),
      difference: Number(l.difference),
      reason: l.reason,
      uom: l.uom
    }))
  };
};

/**
 * Update adjustment (only if draft). For hackathon we set created adjustments to 'done' immediately,
 * so update is allowed only for drafts. Implementation provided for completeness.
 */
export const updateAdjustment = async (id, data) => {
  const adj = await prisma.adjustment.findUnique({ where: { id }});
  if (!adj) throw new Error("Adjustment not found");
  if (adj.status !== "draft") throw new Error("Only draft adjustments can be updated");

  const updated = await prisma.$transaction(async (tx) => {
    await tx.adjustmentLine.deleteMany({ where: { adjustmentId: id }});
    const up = await tx.adjustment.update({
      where: { id },
      data: {
        reference: data.reference || adj.reference,
        warehouseId: data.warehouse_id || adj.warehouseId,
        locationId: data.location_id || adj.locationId,
        lines: {
          create: (data.lines || []).map(l => ({
            productId: l.product_id,
            qtyRecorded: l.qty_recorded ?? 0,
            qtyCounted: l.qty_counted ?? 0,
            difference: (Number(l.qty_counted ?? 0) - Number(l.qty_recorded ?? 0)),
            reason: l.reason || null,
            uom: l.uom || null
          }))
        }
      },
      include: { lines: true }
    });
    return up;
  });

  return updated;
};

export const deleteAdjustment = async (id) => {
  await prisma.adjustment.delete({ where: { id }});
  return true;
};
