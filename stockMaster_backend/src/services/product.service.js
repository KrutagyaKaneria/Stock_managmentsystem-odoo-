import prisma from "../config/db.js";

// GET all products with category + stock
export const getAllProducts = async () => {
  return await prisma.product.findMany({
    include: {
      category: true,
      stockRecords: {
        include: {
          warehouse: true,
          location: true
        }
      }
    }
  });
};

// CREATE product
export const createProduct = async (data) => {
  return await prisma.product.create({
    data: {
      name: data.name,
      sku: data.sku,
      categoryId: data.category_id || null,
      uom: data.uom,
      reorderLevel: data.reorder_level || 0
    }
  });
};

// GET product by ID
export const getProductById = async (id) => {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      stockRecords: {
        include: {
          warehouse: true,
          location: true
        }
      }
    }
  });
};

// UPDATE product
export const updateProduct = async (id, data) => {
  return await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      sku: data.sku,
      categoryId: data.category_id,
      uom: data.uom,
      reorderLevel: data.reorder_level
    }
  });
};

// DELETE product
export const deleteProduct = async (id) => {
  return await prisma.product.delete({
    where: { id }
  });
};
