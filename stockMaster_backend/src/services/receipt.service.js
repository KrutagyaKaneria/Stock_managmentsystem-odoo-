// src/services/receipt.service.js
import prisma from "../config/db.js";
import * as stockService from "./stock.service.js";

/**
 * List receipts
 * filter: status, warehouse_id
 */
export const listReceipts = async ({ status, warehouse_id } = {}) => {
  const where = {};
  if (status) where.status = status;
  if (warehouse_id) where.warehouseId = Number(warehouse_id);

  const rows = await prisma.receipt.findMany({
    where,
    include: {
      lines: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return rows.map(r => ({
    id: r.id,
    reference: r.reference,
    supplier_id: r.supplierId,
    warehouse_id: r.warehouseId,
    location_id: r.locationId,
    status: r.status,
    created_at: r.createdAt,
    lines: r.lines.map(l => ({
      id: l.id,
      product_id: l.productId,
      product_name: l.product?.name || null,
      qty_expected: Number(l.qtyExpected),
      qty_received: Number(l.qtyReceived || 0),
      uom: l.uom
    }))
  }));
};

/**
 * Create receipt (with lines)
 * body: { reference, supplier_id, warehouse_id, location_id, lines: [{ product_id, qty_expected, uom }] }
 */
export const createReceipt = async (data) => {
  const created = await prisma.receipt.create({
    data: {
      reference: data.reference || `REC-${Date.now()}`,
      supplierId: data.supplier_id || null,
      warehouseId: data.warehouse_id,
      locationId: data.location_id,
      status: "draft",
      lines: {
        create: (data.lines || []).map(l => ({
          productId: l.product_id,
          qtyExpected: l.qty_expected,
          qtyReceived: 0,
          uom: l.uom || null
        }))
      }
    },
    include: { lines: true }
  });

  // format for frontend
  return {
    id: created.id,
    reference: created.reference,
    supplier_id: created.supplierId,
    warehouse_id: created.warehouseId,
    location_id: created.locationId,
    status: created.status,
    created_at: created.createdAt,
    lines: created.lines.map(l => ({
      id: l.id,
      product_id: l.productId,
      qty_expected: Number(l.qtyExpected),
      qty_received: Number(l.qtyReceived),
      uom: l.uom
    }))
  };
};

/**
 * Get one receipt by id (with lines)
 */
export const getReceiptById = async (id) => {
  const r = await prisma.receipt.findUnique({
    where: { id },
    include: { lines: { include: { product: true }}, warehouse: true, location: true }
  });
  if (!r) return null;
  return {
    id: r.id,
    reference: r.reference,
    supplier_id: r.supplierId,
    warehouse_id: r.warehouseId,
    location_id: r.locationId,
    status: r.status,
    created_at: r.createdAt,
    lines: r.lines.map(l => ({
      id: l.id,
      product_id: l.productId,
      product_name: l.product?.name || null,
      qty_expected: Number(l.qtyExpected),
      qty_received: Number(l.qtyReceived || 0),
      uom: l.uom
    }))
  };
};

/**
 * Update receipt (only if draft)
 * Accepts same shape as create
 */
export const updateReceipt = async (id, data) => {
  const receipt = await prisma.receipt.findUnique({ where: { id }});
  if (!receipt) throw new Error("Receipt not found");
  if (receipt.status !== "draft") throw new Error("Only draft receipts can be updated");

  // simple approach: update master and replace lines (delete/create)
  const updated = await prisma.$transaction(async (tx) => {
    await tx.receiptLine.deleteMany({ where: { receiptId: id }});
    const up = await tx.receipt.update({
      where: { id },
      data: {
        reference: data.reference || receipt.reference,
        supplierId: data.supplier_id || receipt.supplierId,
        warehouseId: data.warehouse_id || receipt.warehouseId,
        locationId: data.location_id || receipt.locationId,
        lines: {
          create: (data.lines || []).map(l => ({
            productId: l.product_id,
            qtyExpected: l.qty_expected,
            qtyReceived: 0,
            uom: l.uom || null
          }))
        }
      },
      include: { lines: true }
    });
    return up;
  });

  return {
    id: updated.id,
    reference: updated.reference,
    status: updated.status,
    lines: updated.lines.map(l => ({ id: l.id, product_id: l.productId, qty_expected: Number(l.qtyExpected), qty_received: Number(l.qtyReceived) }))
  };
};

/**
 * Delete receipt
 */
export const deleteReceipt = async (id) => {
  await prisma.receipt.delete({ where: { id }});
  return true;
};

/**
 * Receive a receipt: transactional application of lines to stock.
 * Input: { receiptId, lines: [{ product_id, qty_received, uom }], receivedBy, notes }
 */
// export const receiveReceipt = async ({ receiptId, lines = [], receivedBy = null, notes = null }) => {
//   const receipt = await prisma.receipt.findUnique({ where: { id: receiptId }});
//   if (!receipt) throw new Error("Receipt not found");
//   if (!Array.isArray(lines) || lines.length === 0) throw new Error("No lines to receive");

//   const moves = [];
//   await prisma.$transaction(async (tx) => {
//     // validate location & warehouse exist
//     const location = await tx.location.findUnique({ where: { id: receipt.locationId }});
//     if (!location) throw new Error("Receipt location not found");

//     for (const L of lines) {
//       const pid = Number(L.product_id);
//       const qty = Number(L.qty_received);

//       if (qty <= 0) continue;

//       // update receipt line qty_received (increment)
//       await tx.receiptLine.updateMany({
//         where: { receiptId, productId: pid },
//         data: { qtyReceived: { increment: qty } }
//       });

//       // create or update stock record at receipt.locationId
//       const existing = await tx.stockRecord.findFirst({ where: { productId: pid, locationId: receipt.locationId }});
//       if (existing) {
//         await tx.stockRecord.update({
//           where: { id: existing.id },
//           data: { quantity: existing.quantity + qty, uom: L.uom || existing.uom }
//         });
//       } else {
//         await tx.stockRecord.create({
//           data: {
//             productId: pid,
//             warehouseId: receipt.warehouseId,
//             locationId: receipt.locationId,
//             quantity: qty,
//             uom: L.uom || null
//           }
//         });
//       }

//       // create stock move ledger
//       const move = await tx.stockMove.create({
//         data: {
//           type: "receipt",
//           reference: receipt.reference,
//           productId: pid,
//           fromLocationId: null,
//           toLocationId: receipt.locationId,
//           quantity: qty,
//           uom: L.uom || null,
//           status: "done",
//           createdBy: receivedBy
//         }
//       });
//       moves.push(move);
//     }

//     // mark receipt done
//     await tx.receipt.update({ where: { id: receiptId }, data: { status: "done" }});
//   });

//   return { receiptId, status: "done", stock_moves: moves };
// };
