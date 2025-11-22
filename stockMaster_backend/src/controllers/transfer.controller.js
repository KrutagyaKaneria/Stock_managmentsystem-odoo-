// inside transfer.controller.js (validate endpoint)
import prisma from "../config/db.js";
import * as stockService from "../services/stock.service.js";

export const validateTransfer = async (req, res, next) => {
  try {
    const transferId = Number(req.params.id);
    const t = await prisma.transfer.findUnique({ where: { id: transferId }, include: { lines: true }});
    if (!t) return res.status(404).json({ success:false, message: "Transfer not found" });

    const moves = [];
    // transaction
    await prisma.$transaction(async (tx) => {
      for (const L of t.lines) {
        const pid = L.productId;
        const qty = Number(L.qty);
        // decrease at from location
        const srFrom = await tx.stockRecord.findFirst({ where: { productId: pid, locationId: t.fromLocationId }});
        if (!srFrom || toNumber(srFrom.quantity) < qty) throw new Error("Insufficient stock to transfer");
        await tx.stockRecord.update({ where: { id: srFrom.id }, data: { quantity: toNumber(srFrom.quantity) - qty }});

        // increase at to location
        const srTo = await tx.stockRecord.findFirst({ where: { productId: pid, locationId: t.toLocationId }});
        if (srTo) {
          await tx.stockRecord.update({ where: { id: srTo.id }, data: { quantity: toNumber(srTo.quantity) + qty }});
        } else {
          await tx.stockRecord.create({ data: { productId: pid, warehouseId: t.toWarehouseId, locationId: t.toLocationId, quantity: qty }});
        }

        // create internal move
        const move = await tx.stockMove.create({
          data: {
            type: "internal",
            reference: t.reference,
            productId: pid,
            fromLocationId: t.fromLocationId,
            toLocationId: t.toLocationId,
            quantity: qty,
            uom: L.uom || null,
            status: "done"
          }
        });
        moves.push(move);
      }
      await tx.transfer.update({ where: { id: transferId }, data: { status: "done" }});
    });

    return res.json({ success:true, transfer: { id: transferId, status: "done" }, stock_moves: moves });
  } catch (err) {
    next(err);
  }
};
