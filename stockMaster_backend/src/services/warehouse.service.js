// src/services/warehouse.service.js
import prisma from "../config/db.js";

/**
 * Returns warehouses.
 * if includeLocations === true -> include locations array and stock summary per location
 */
export const getAllWarehouses = async (includeLocations = false) => {
  if (includeLocations) {
    const rows = await prisma.warehouse.findMany({
      include: {
        locations: {
          include: {
            stockRecords: {
              include: { product: true }
            }
          }
        }
      },
      orderBy: { id: "asc" }
    });

    // map into frontend-friendly structure
    return rows.map(w => ({
      id: w.id,
      name: w.name,
      location_code: w.locationCode,
      locations: w.locations.map(loc => ({
        id: loc.id,
        name: loc.name,
        code: loc.code,
        stock: loc.stockRecords.map(sr => ({
          product_id: sr.productId,
          product_name: sr.product?.name || null,
          sku: sr.product?.sku || null,
          quantity: Number(sr.quantity),
          uom: sr.uom
        }))
      }))
    }));
  }

  // simple list
  return prisma.warehouse.findMany({
    select: { id: true, name: true, locationCode: true },
    orderBy: { id: "asc" }
  });
};

export const createWarehouse = async (data) => {
  // data: { name, location_code }
  const created = await prisma.warehouse.create({
    data: {
      name: data.name,
      locationCode: data.location_code || null
    }
  });
  // return in frontend contract shape
  return {
    id: created.id,
    name: created.name,
    location_code: created.locationCode
  };
};

export const getWarehouseById = async (id) => {
  const w = await prisma.warehouse.findUnique({
    where: { id },
    include: {
      locations: {
        include: {
          stockRecords: {
            include: { product: true }
          }
        }
      }
    }
  });
  if (!w) return null;

  // compute stock summary per warehouse (total quantities by product)
  const stockByProduct = {};
  for (const loc of w.locations) {
    for (const sr of loc.stockRecords) {
      const pid = sr.productId;
      const qty = Number(sr.quantity);
      if (!stockByProduct[pid]) {
        stockByProduct[pid] = {
          product_id: pid,
          product_name: sr.product?.name || null,
          sku: sr.product?.sku || null,
          quantity: 0,
          uom: sr.uom
        };
      }
      stockByProduct[pid].quantity += qty;
    }
  }

  return {
    id: w.id,
    name: w.name,
    location_code: w.locationCode,
    locations: w.locations.map(loc => ({
      id: loc.id,
      name: loc.name,
      code: loc.code,
      stock: loc.stockRecords.map(sr => ({
        product_id: sr.productId,
        product_name: sr.product?.name || null,
        sku: sr.product?.sku || null,
        quantity: Number(sr.quantity),
        uom: sr.uom
      }))
    })),
    stock_summary: Object.values(stockByProduct) // array of product aggregates in this warehouse
  };
};

export const updateWarehouse = async (id, data) => {
  const updated = await prisma.warehouse.update({
    where: { id },
    data: {
      name: data.name,
      locationCode: data.location_code
    }
  });
  return {
    id: updated.id,
    name: updated.name,
    location_code: updated.locationCode
  };
};

export const deleteWarehouse = async (id) => {
  // simple delete; if you want cascade safety check, implement checks before deleting
  await prisma.warehouse.delete({ where: { id } });
  return true;
};
``