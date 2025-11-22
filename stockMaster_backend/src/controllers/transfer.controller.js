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

import * as transferService from "../services/transfer.service.js";
import { success, fail } from "../utils/response.js";

export const listTransfers = async (req, res, next) => {
  try {
    const { status, from_warehouse_id, to_warehouse_id } = req.query;
    const rows = await transferService.listTransfers({ status, from_warehouse_id, to_warehouse_id });
    return success(res, rows);
  } catch (err) { next(err); }
};

export const createTransfer = async (req, res, next) => {
  try {
    const transfer = await transferService.createTransfer(req.body);
    return success(res, transfer, "Transfer created");
  } catch (err) { next(err); }
};

export const getTransferById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await transferService.getTransferById(id);
    if (!row) return fail(res, "Transfer not found", 404);
    return success(res, row);
  } catch (err) { next(err); }
};

export const updateTransfer = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const updated = await transferService.updateTransfer(id, req.body);
    return success(res, updated, "Transfer updated");
  } catch (err) { next(err); }
};

export const deleteTransfer = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await transferService.deleteTransfer(id);
    return success(res, null, "Transfer deleted");
  } catch (err) { next(err); }
};
