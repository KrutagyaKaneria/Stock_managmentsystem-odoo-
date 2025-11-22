// inside delivery.controller.js (validate endpoint)
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
        await tx.stockRecord.update({ where: { id: sr.id }, data: { quantity: toNumber(sr.quantity) - qty }});

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
            status: "done",
            createdBy: packed_by_id || null
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
