export const receiveReceipt = async (req, res, next) => {
  try {
    const receiptId = Number(req.params.id);
    const { lines = [], notes = "", received_by = null } = req.body;

    if (!receiptId || isNaN(receiptId)) {
      return res.status(400).json({ success: false, message: "Invalid receipt ID" });
    }

    if (!Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ success: false, message: "No receipt lines provided" });
    }

    const receipt = await prisma.receipt.findUnique({ where: { id: receiptId }});

    if (!receipt) {
      return res.status(404).json({ success:false, message: "Receipt not found" });
    }

    const moves = [];

    await prisma.$transaction(async (tx) => {
      for (const line of lines) {
        const productId = Number(line.product_id);
        const qty = Number(line.qty_received || 0);
        const uom = line.uom || null;

        if (!productId || qty <= 0) {
          throw new Error("Invalid product line in receipt");
        }

        // 1. Update receipt line qtyReceived
        await tx.receiptLine.updateMany({
          where: { receiptId, productId },
          data: { qtyReceived: { increment: qty } }
        });

        // 2. Update or create stock record
        const existingStock = await tx.stockRecord.findFirst({
          where: {
            productId,
            locationId: receipt.locationId
          }
        });

        if (existingStock) {
          await tx.stockRecord.update({
            where: { id: existingStock.id },
            data: {
              quantity: Number(existingStock.quantity) + qty
            }
          });
        } else {
          await tx.stockRecord.create({
            data: {
              productId,
              warehouseId: receipt.warehouseId,
              locationId: receipt.locationId,
              quantity: qty
            }
          });
        }

        // 3. Create stock move record
        const move = await tx.stockMove.create({
          data: {
            type: "receipt",
            reference: receipt.reference,
            productId,
            fromLocationId: null,
            toLocationId: receipt.locationId,
            quantity: qty,
            uom,
            status: "done",
            // createdBy: received_by
          }
        });

        moves.push(move);
      }

      // 4. Mark receipt as done
      await tx.receipt.update({
        where: { id: receiptId },
        data: {
          status: "done"
          // notes: notes || receipt.notes
        }
      });
    });

    return res.json({
      success: true,
      message: "Receipt validated successfully",
      receipt: { id: receiptId, status: "done" },
      stock_moves: moves
    });

  } catch (err) {
    console.error("Error in receiveReceipt:", err);
    next(err);
  }
};

// src/controllers/receipt.controller.js
import prisma from "../config/db.js";
import * as receiptService from "../services/receipt.service.js";
import * as stockService from "../services/stock.service.js";
import { success, fail } from "../utils/response.js";

/**
 * GET /api/v1/receipts
 * optional query: status, warehouse_id
 */
export const listReceipts = async (req, res, next) => {
  try {
    const { status, warehouse_id } = req.query;
    const receipts = await receiptService.listReceipts({ status, warehouse_id });
    return success(res, receipts);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/receipts
 * body: { reference, supplier_id, warehouse_id, location_id, lines: [{ product_id, qty_expected, uom }] }
 */
export const createReceipt = async (req, res, next) => {
  try {
    const payload = req.body;
    const receipt = await receiptService.createReceipt(payload);
    return success(res, receipt, "Receipt created");
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/receipts/:id
 */
export const getReceiptById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const receipt = await receiptService.getReceiptById(id);
    if (!receipt) return fail(res, "Receipt not found", 404);
    return success(res, receipt);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/receipts/:id
 * allow editing if status is draft
 */
export const updateReceipt = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const updated = await receiptService.updateReceipt(id, req.body);
    return success(res, updated, "Receipt updated");
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/receipts/:id/receive
 * body: { received_by, lines:[ { product_id, qty_received, uom } ], notes }
 *
 * This runs transactionally:
 *  - update receipt lines qty_received
 *  - create/update stockRecords at receipt.locationId
 *  - create stockMove entries
 *  - mark receipt status -> done
 */

/**
 * DELETE /api/v1/receipts/:id
 */
export const deleteReceipt = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await receiptService.deleteReceipt(id);
    return success(res, null, "Receipt deleted");
  } catch (err) {
    next(err);
  }
};
