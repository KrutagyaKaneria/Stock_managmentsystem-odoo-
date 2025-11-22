import prisma from "../config/db.js";
import * as stockService from "./stock.service.js";

export const listTransfers = async ({ status, from_warehouse_id, to_warehouse_id }) => {
  const where = {};
  if (status) where.status = status;
  if (from_warehouse_id) where.fromWarehouseId = Number(from_warehouse_id);
  if (to_warehouse_id) where.toWarehouseId = Number(to_warehouse_id);

  const t = await prisma.transfer.findMany({
    where,
    include: { lines: { include: { product: true } } },
    orderBy: { createdAt: "desc" }
  });

  return t.map(tr => ({
    id: tr.id,
    reference: tr.reference,
    from_warehouse_id: tr.fromWarehouseId,
    to_warehouse_id: tr.toWarehouseId,
    from_location_id: tr.fromLocationId,
    to_location_id: tr.toLocationId,
    status: tr.status,
    created_at: tr.createdAt,
    lines: tr.lines.map(l => ({
      id: l.id,
      product_id: l.productId,
      product_name: l.product?.name,
      qty: Number(l.qty),
      uom: l.uom
    }))
  }));
};

export const createTransfer = async (data) => {
  const t = await prisma.transfer.create({
    data: {
      reference: data.reference || `TRF-${Date.now()}`,
      fromWarehouseId: data.from_warehouse_id,
      toWarehouseId: data.to_warehouse_id,
      fromLocationId: data.from_location_id,
      toLocationId: data.to_location_id,
      status: "draft",
      lines: {
        create: (data.lines || []).map(l => ({
          productId: l.product_id,
          qty: l.qty,
          uom: l.uom || null
        }))
      }
    },
    include: { lines: true }
  });

  return t;
};

export const getTransferById = async (id) => {
  const t = await prisma.transfer.findUnique({
    where: { id },
    include: { lines: { include: { product: true } } }
  });
  if (!t) return null;

  return {
    id: t.id,
    reference: t.reference,
    from_warehouse_id: t.fromWarehouseId,
    to_warehouse_id: t.toWarehouseId,
    from_location_id: t.fromLocationId,
    to_location_id: t.toLocationId,
    status: t.status,
    created_at: t.createdAt,
    lines: t.lines.map(l => ({
      id: l.id,
      product_id: l.productId,
      product_name: l.product?.name,
      qty: Number(l.qty),
      uom: l.uom
    }))
  };
};

export const updateTransfer = async (id, data) => {
  const t = await prisma.transfer.findUnique({ where: { id }});
  if (!t) throw new Error("Transfer not found");
  if (t.status !== "draft") throw new Error("Only draft transfers can be updated");

  const updated = await prisma.$transaction(async (tx) => {
    await tx.transferLine.deleteMany({ where: { transferId: id }});

    return await tx.transfer.update({
      where: { id },
      data: {
        reference: data.reference || t.reference,
        fromWarehouseId: data.from_warehouse_id || t.fromWarehouseId,
        toWarehouseId: data.to_warehouse_id || t.toWarehouseId,
        fromLocationId: data.from_location_id || t.fromLocationId,
        toLocationId: data.to_location_id || t.toLocationId,
        lines: {
          create: (data.lines || []).map(l => ({
            productId: l.product_id,
            qty: l.qty,
            uom: l.uom || null
          }))
        }
      },
      include: { lines: true }
    });
  });

  return updated;
};

export const deleteTransfer = async (id) => {
  await prisma.transfer.delete({ where: { id }});
  return true;
};
