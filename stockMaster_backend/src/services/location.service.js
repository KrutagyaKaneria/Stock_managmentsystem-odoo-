import prisma from "../config/db.js";

// Create location under a warehouse
export const createLocation = async (data) => {
  // data: { warehouse_id, name, code }
  const created = await prisma.location.create({
    data: {
      warehouseId: data.warehouse_id,
      name: data.name,
      code: data.code || null
    }
  });

  return {
    id: created.id,
    warehouse_id: created.warehouseId,
    name: created.name,
    code: created.code
  };
};

// Get all locations
export const getAllLocations = async () => {
  const rows = await prisma.location.findMany({
    include: {
      warehouse: true
    },
    orderBy: { id: "asc" }
  });

  return rows.map(loc => ({
    id: loc.id,
    name: loc.name,
    code: loc.code,
    warehouse_id: loc.warehouseId,
    warehouse_name: loc.warehouse?.name || null
  }));
};

// Get locations of a specific warehouse
export const getLocationsByWarehouse = async (warehouseId) => {
  const rows = await prisma.location.findMany({
    where: { warehouseId },
    include: {
      stockRecords: {
        include: {
          product: true
        }
      }
    }
  });

  return rows.map(loc => ({
    id: loc.id,
    name: loc.name,
    code: loc.code,
    warehouse_id: warehouseId,
    stock: loc.stockRecords.map(sr => ({
      product_id: sr.productId,
      product_name: sr.product?.name || null,
      sku: sr.product?.sku || null,
      quantity: Number(sr.quantity),
      uom: sr.uom
    }))
  }));
};

// Get one location (with stock)
export const getLocationById = async (id) => {
  const loc = await prisma.location.findUnique({
    where: { id },
    include: {
      warehouse: true,
      stockRecords: {
        include: { product: true }
      }
    }
  });

  if (!loc) return null;

  return {
    id: loc.id,
    name: loc.name,
    code: loc.code,
    warehouse_id: loc.warehouseId,
    warehouse_name: loc.warehouse?.name,
    stock: loc.stockRecords.map(sr => ({
      product_id: sr.productId,
      product_name: sr.product?.name,
      sku: sr.product?.sku,
      quantity: Number(sr.quantity),
      uom: sr.uom
    }))
  };
};

// Update location
export const updateLocation = async (id, data) => {
  const updated = await prisma.location.update({
    where: { id },
    data: {
      name: data.name,
      code: data.code
    }
  });

  return {
    id: updated.id,
    name: updated.name,
    code: updated.code
  };
};

// Delete location
export const deleteLocation = async (id) => {
  await prisma.location.delete({
    where: { id }
  });
  return true;
};
