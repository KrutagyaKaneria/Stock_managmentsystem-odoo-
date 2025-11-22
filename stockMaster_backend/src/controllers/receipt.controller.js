export const receiveReceipt = async (req, res, next) => {
  try {
    const receiptId = Number(req.params.id);
    const { lines, notes, received_by } = req.body;
    const receipt = await prisma.receipt.findUnique({ where: { id: receiptId }});
    if (!receipt) return res.status(404).json({ success:false, message: "Receipt not found" });

    const moves = [];
    await prisma.$transaction(async (tx) => {
      for (const L of lines) {
        const pid = L.product_id;
        const qty = Number(L.qty_received);

        await tx.receiptLine.updateMany({
          where: { receiptId, productId: pid },
          data: { qtyReceived: { increment: qty } }
        });

        const sr = await tx.stockRecord.findFirst({
          where: { productId: pid, locationId: receipt.locationId }
        });

        if (sr) {
          await tx.stockRecord.update({
            where: { id: sr.id },
            data: { quantity: sr.quantity + qty }
          });
        } else {
          await tx.stockRecord.create({
            data: {
              productId: pid,
              warehouseId: receipt.warehouseId,
              locationId: receipt.locationId,
              quantity: qty
            }
          });
        }

        const move = await tx.stockMove.create({
          data: {
            type: "receipt",
            reference: receipt.reference,
            productId: pid,
            fromLocationId: null,
            toLocationId: receipt.locationId,
            quantity: qty,
            uom: L.uom || null,
            status: "done",
            createdBy: received_by || null
          }
        });

        moves.push(move);
      }

      await tx.receipt.update({
        where: { id: receiptId },
        data: { status: "done" }
      });
    });

    return res.json({
      success:true,
      receipt: { id: receiptId, status: "done" },
      stock_moves: moves
    });

  } catch (err) {
    next(err);
  }
};
