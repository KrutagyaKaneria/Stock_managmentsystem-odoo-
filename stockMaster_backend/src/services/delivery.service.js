import prisma from "../config/db.js";
import * as stockService from "./stock.service.js";

export const listDeliveries = async ({ status, warehouse_id } = {}) => {
  const where = {};
  if (status) where.status = status;
  if (warehouse_id) where.warehouseId = Number(warehouse_id);

  const rows = await prisma.delivery.findMany({
    where,
    include: {
      lines: { include: { product: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return rows.map(d => ({
    id: d.id,
    reference: d.reference,
    customer_id: d.customerId,
    warehouse_id: d.warehouseId,
    status: d.status,
    created_at: d.createdAt,
    lines: d.lines.map(l => ({
      id: l.id,
      product_id: l.productId,
      product_name: l.product?.name,
      qty_ordered: Number(l.qtyOrdered),
      qty_packed: Number(l.qtyPacked || 0),
      uom: l.uom
    }))
  }));
};

export const createDelivery = async (data) => {
  const delivery = await prisma.delivery.create({
    data: {
      reference: data.reference || `DEL-${Date.now()}`,
      customerId: data.customer_id || null,
      warehouseId: data.warehouse_id,
      status: "draft",
      lines: {
        create: (data.lines || []).map(l => ({
          productId: l.product_id,
          qtyOrdered: l.qty_ordered,
          qtyPacked: 0,
          uom: l.uom || null
        }))
      }
    },
    include: { lines: true }
  });

  return delivery;
};

export const getDeliveryById = async (id) => {
  const d = await prisma.delivery.findUnique({
    where: { id },
    include: {
      lines: { include: { product: true } },
      warehouse: true
    }
  });
  if (!d) return null;

  return {
    id: d.id,
    reference: d.reference,
    warehouse_id: d.warehouseId,
    status: d.status,
    created_at: d.createdAt,
    lines: d.lines.map(l => ({
      id: l.id,
      product_id: l.productId,
      product_name: l.product?.name,
      qty_ordered: Number(l.qtyOrdered),
      qty_packed: Number(l.qtyPacked),
      uom: l.uom
    }))
  };
};

export const updateDelivery = async (id, data) => {
  const delivery = await prisma.delivery.findUnique({ where: { id }});
  if (!delivery) throw new Error("Delivery not found");
  if (delivery.status !== "draft") throw new Error("Only draft deliveries can be updated");

  const updated = await prisma.$transaction(async (tx) => {
    await tx.deliveryLine.deleteMany({ where: { deliveryId: id }});

    return await tx.delivery.update({
      where: { id },
      data: {
        reference: data.reference || delivery.reference,
        customerId: data.customer_id || delivery.customerId,
        warehouseId: data.warehouse_id || delivery.warehouseId,
        lines: {
          create: (data.lines || []).map(l => ({
            productId: l.product_id,
            qtyOrdered: l.qty_ordered,
            qtyPacked: 0,
            uom: l.uom || null
          }))
        }
      },
      include: { lines: true }
    });
  });

  return updated;
};

export const deleteDelivery = async (id) => {
  await prisma.delivery.delete({ where: { id }});
  return true;
};
