// inside delivery.controller.js (validate endpoint)
import * as deliveryService from "../services/delivery.service.js";
import { success, fail } from "../utils/response.js";
import prisma from "../config/db.js";
import * as stockService from "../services/stock.service.js";

export const validateDelivery = async (req, res, next) => {
  try {
    const deliveryId = Number(req.params.id);
    const { packed_by_id, packages } = req.body; // packages optional
    const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId }, include: { lines: true }});
    if (!delivery) return res.status(404).json({ success:false, message: "Delivery not found" });

    const moves = [];
    await prisma.$transaction(async (tx) => {
      for (const L of delivery.lines) {
        const pid = L.productId;
        const qty = Number(L.qtyOrdered); // or use qty_packed if tracked
        // find a source location (simple policy: choose any location in warehouse with stock)
        const sr = await tx.stockRecord.findFirst({
          where: { productId: pid, warehouseId: delivery.warehouseId, quantity: { gt: 0 } },
          orderBy: { quantity: "desc" } // pick location with highest qty
        });
        if (!sr) throw new Error(`Insufficient stock for product ${pid}`);

        // decrement from chosen location
        await tx.stockRecord.update({ where: { id: sr.id }, data: { quantity: Number(sr.quantity) - qty }});

        // create move
        const move = await tx.stockMove.create({
          data: {
            type: "delivery",
            reference: delivery.reference,
            productId: pid,
            fromLocationId: sr.locationId,
            toLocationId: null,
            quantity: qty,
            uom: L.uom || null,
            status: "done"
            // createdBy: packed_by_id || null
          }
        });
        moves.push(move);

        // after decrease, check low stock at warehouse level
        await stockService.checkAndNotifyLowStock(pid, delivery.warehouseId);
      }

      // mark delivery done
      await tx.delivery.update({ where: { id: deliveryId }, data: { status: "done" }});
    });

    return res.json({ success: true, delivery: { id: deliveryId, status: "done" }, stock_moves: moves });
  } catch (err) {
    next(err);
  }
};


export const listDeliveries = async (req, res, next) => {
  try {
    const { status, warehouse_id } = req.query;
    const rows = await deliveryService.listDeliveries({ status, warehouse_id });
    return success(res, rows);
  } catch (err) { next(err); }
};

export const createDelivery = async (req, res, next) => {
  try {
    const delivery = await deliveryService.createDelivery(req.body);
    return success(res, delivery, "Delivery created");
  } catch (err) { next(err); }
};

export const getDeliveryById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await deliveryService.getDeliveryById(id);
    if (!row) return fail(res, "Delivery not found", 404);
    return success(res, row);
  } catch (err) { next(err); }
};

export const updateDelivery = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const updated = await deliveryService.updateDelivery(id, req.body);
    return success(res, updated, "Delivery updated");
  } catch (err) { next(err); }
};

export const deleteDelivery = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await deliveryService.deleteDelivery(id);
    return success(res, null, "Delivery deleted");
  } catch (err) { next(err); }
};
