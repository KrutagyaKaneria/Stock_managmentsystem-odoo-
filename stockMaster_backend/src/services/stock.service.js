import prisma from "../config/db.js";
import emailService from "./email.service.js";

/**
 * convert Decimal to Number safely
 */
const toNumber = (v) => (v === null || v === undefined ? 0 : Number(v));

/**
 * Create or update a StockRecord for a given product/location.
 * Returns the updated stockRecord object.
 */
export const upsertStockRecord = async ({ productId, warehouseId, locationId, qty, uom }) => {
  const existing = await prisma.stockRecord.findFirst({
    where: { productId, locationId }
  });

  if (existing) {
    const updated = await prisma.stockRecord.update({
      where: { id: existing.id },
      data: { quantity: { increment: qty }, uom: uom || existing.uom }
    });
    return updated;
  } else {
    const created = await prisma.stockRecord.create({
      data: {
        productId,
        warehouseId,
        locationId,
        quantity: qty,
        uom: uom || undefined
      }
    });
    return created;
  }
};

/**
 * Decrease quantity from a stock record (location).
 * Throws error if insufficient stock (unless allowNegative=true).
 */
export const decreaseStockAtLocation = async ({ productId, locationId, warehouseId, qty, allowNegative = false, uom }) => {
  const sr = await prisma.stockRecord.findFirst({ where: { productId, locationId } });
  if (!sr) {
    if (!allowNegative) throw new Error("No stock record found at location");
    // create negative record
    return await prisma.stockRecord.create({
      data: { productId, warehouseId, locationId, quantity: -qty, uom }
    });
  }
  const current = toNumber(sr.quantity);
  const newQty = current - qty;
  if (!allowNegative && newQty < 0) throw new Error("Insufficient stock at location");
  return await prisma.stockRecord.update({
    where: { id: sr.id },
    data: { quantity: newQty }
  });
};

/**
 * Create a StockMove ledger entry.
 */
export const createStockMove = async ({ type, reference, productId, fromLocationId = null, toLocationId = null, fromWarehouseId = null, toWarehouseId = null, quantity, uom, status = "done", createdBy = null, notes = null }) => {
  const move = await prisma.stockMove.create({
    data: {
      type,
      reference,
      productId,
      fromLocationId,
      toLocationId,
      quantity,
      uom,
      status,
      createdBy
    }
  });
  return move;
};

/**
 * Increase stock (used for receipts, transfers to)
 * - updates/creates StockRecord at toLocation
 * - creates StockMove of type 'receipt' or 'internal' or 'adjustment'
 * - runs low-stock check (only when increase? usually check on decrease; still included)
 */
export const increaseStock = async ({ productId, toWarehouseId, toLocationId, qty, uom, reference = null, type = "receipt", createdBy = null }) => {
  // upsert stock record
  const updated = await upsertStockRecord({ productId, warehouseId: toWarehouseId, locationId: toLocationId, qty, uom });

  // ledger
  const move = await createStockMove({
    type,
    reference,
    productId,
    fromLocationId: null,
    toLocationId,
    toWarehouseId,
    quantity: qty,
    uom,
    status: "done",
    createdBy
  });

  // optional: after increase, you might notify if stock crosses reorder threshold on either direction. Usually low-stock notified on decrease.
  return { stockRecord: updated, move };
};

/**
 * Decrease stock (used for deliveries, transfers from)
 */
export const decreaseStock = async ({ productId, fromWarehouseId, fromLocationId, qty, uom, reference = null, type = "delivery", createdBy = null, allowNegative = false }) => {
  // decrement
  const updated = await decreaseStockAtLocation({ productId, locationId: fromLocationId, warehouseId: fromWarehouseId, qty, allowNegative, uom });

  // ledger
  const move = await createStockMove({
    type,
    reference,
    productId,
    fromLocationId,
    toLocationId: null,
    fromWarehouseId,
    quantity: qty,
    uom,
    status: "done",
    createdBy
  });

  // run low-stock check at warehouse level
  await checkAndNotifyLowStock(productId, fromWarehouseId);

  return { stockRecord: updated, move };
};

/**
 * Transfer stock between locations (internal)
 * Steps:
 *  - decrease at fromLocation
 *  - increase at toLocation
 *  - create internal stock move (single move representing the transfer)
 */
export const transferStock = async ({ productId, fromWarehouseId, fromLocationId, toWarehouseId, toLocationId, qty, uom, reference = null, createdBy = null }) => {
  // transaction: ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // 1. decrease
    const srFrom = await tx.stockRecord.findFirst({ where: { productId, locationId: fromLocationId }});
    if (!srFrom) throw new Error("Source stock record not found");
    const cur = toNumber(srFrom.quantity);
    if (cur < qty) throw new Error("Insufficient stock in source location");
    await tx.stockRecord.update({ where: { id: srFrom.id }, data: { quantity: cur - qty }});

    // 2. increase (upsert-like)
    const srTo = await tx.stockRecord.findFirst({ where: { productId, locationId: toLocationId }});
    if (srTo) {
      await tx.stockRecord.update({ where: { id: srTo.id }, data: { quantity: toNumber(srTo.quantity) + qty }});
    } else {
      await tx.stockRecord.create({
        data: { productId, warehouseId: toWarehouseId, locationId: toLocationId, quantity: qty, uom }
      });
    }

    // 3. create ledger (single internal move)
    const move = await tx.stockMove.create({
      data: {
        type: "internal",
        reference,
        productId,
        fromLocationId,
        toLocationId,
        quantity: qty,
        uom,
        status: "done",
        createdBy
      }
    });

    return { move };
  });

  return result;
};

/**
 * Adjustment (set counted quantity) — creates adjustment lines and stock move
 * - For each line: find stock_record, compute diff, update quantity to counted, create move of type "adjustment"
 */
export const adjustStock = async ({ warehouseId, locationId, lines = [], reference = null, createdBy = null }) => {
  // lines = [{ productId, qty_counted, uom, reason }]
  const moves = [];
  await prisma.$transaction(async (tx) => {
    for (const L of lines) {
      const pid = L.productId;
      const counted = Number(L.qty_counted);
      let sr = await tx.stockRecord.findFirst({ where: { productId: pid, locationId } });

      if (!sr) {
        // create with counted qty (could be 0)
        sr = await tx.stockRecord.create({
          data: { productId: pid, warehouseId, locationId, quantity: counted, uom: L.uom || undefined }
        });
        const move = await tx.stockMove.create({
          data: {
            type: "adjustment",
            reference,
            productId: pid,
            fromLocationId: null,
            toLocationId: locationId,
            quantity: counted,
            uom: L.uom,
            status: "done",
            createdBy
          }
        });
        moves.push(move);
        continue;
      }

      const recorded = toNumber(sr.quantity);
      const diff = counted - recorded;
      // update record to counted
      await tx.stockRecord.update({ where: { id: sr.id }, data: { quantity: counted }});
      // create move with positive or negative qty (for clarity we'll set quantity = diff and type adjustment)
      const move = await tx.stockMove.create({
        data: {
          type: "adjustment",
          reference,
          productId: pid,
          fromLocationId: recorded > counted ? locationId : null,
          toLocationId: recorded < counted ? locationId : null,
          quantity: Math.abs(diff),
          uom: L.uom,
          status: "done",
          createdBy
        }
      });
      moves.push(move);

      // If diff negative -> decreased stock: check low stock
      if (diff < 0) {
        await checkAndNotifyLowStock(pid, warehouseId);
      }
    }
  });

  return moves;
};

/**
 * Get recent stock moves (for dashboard)
 */
export const getRecentStockMoves = async ({ limit = 10 } = {}) => {
  const moves = await prisma.stockMove.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { product: true }
  });
  return moves.map(m => ({
    id: m.id,
    type: m.type,
    reference: m.reference,
    product_id: m.productId,
    product_name: m.product?.name || null,
    from_location_id: m.fromLocationId,
    to_location_id: m.toLocationId,
    quantity: toNumber(m.quantity),
    uom: m.uom,
    status: m.status,
    created_at: m.createdAt
  }));
};

/**
 * Get stock by product across warehouses / locations
 * useful for product details API
 */
export const getStockByProduct = async (productId) => {
  const records = await prisma.stockRecord.findMany({
    where: { productId },
    include: { location: true, warehouse: true }
  });
  return records.map(r => ({
    product_id: r.productId,
    product_name: null,
    location_id: r.locationId,
    location_name: r.location?.name || null,
    warehouse_id: r.warehouseId,
    warehouse_name: r.warehouse?.name || null,
    quantity: toNumber(r.quantity),
    uom: r.uom
  }));
};

/**
 * Low-stock checking and notification (warehouse-level)
 * Sends an email to ADMIN_EMAIL if total stock in warehouse < reorderLevel
 */
export const checkAndNotifyLowStock = async (productId, warehouseId) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.reorderLevel) return;

  const records = await prisma.stockRecord.findMany({ where: { productId, warehouseId } });
  const total = records.reduce((s, r) => s + toNumber(r.quantity), 0);

  if (total < Number(product.reorderLevel)) {
    // send email via emailService
    try {
      await emailService.sendLowStockAlert({
        productId,
        sku: product.sku,
        name: product.name,
        current: total,
        reorderLevel: product.reorderLevel,
        warehouseId
      });
    } catch (err) {
      console.error("Low stock email failed:", err);
    }
  }
};

export default emailService