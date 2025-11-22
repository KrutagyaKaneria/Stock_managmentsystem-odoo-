import prisma from "../config/db.js";

export const getLowStockProducts = async () => {
  const products = await prisma.product.findMany({
    include: {
      stockRecords: true
    }
  });

  const lowStockList = [];

  for (const p of products) {
    const totalQty = p.stockRecords.reduce((sum, rec) => sum + Number(rec.quantity), 0);
    const reorderLevel = Number(p.reorderLevel || 0);

    if (reorderLevel > 0 && totalQty < reorderLevel) {
      lowStockList.push({
        id: p.id,
        sku: p.sku,
        name: p.name,
        current_stock: totalQty,
        reorder_level: reorderLevel
      });
    }
  }

  return lowStockList.sort((a, b) => a.current_stock - b.current_stock);
};


export const getDashboardStats = async () => {
  const [
    totalProducts,
    totalWarehouses,
    totalMovements,
    lowStock,
    stockRecords
  ] = await Promise.all([
    prisma.product.count(),
    prisma.warehouse.count(),
    prisma.stockMove.count(),
    prisma.product.count({ where: { quantityAvailable: { lt: 1 }}}).catch(() => 0),
    prisma.stockRecord.findMany()
  ]);

  const totalStockUnits = stockRecords.reduce((sum, r) => sum + Number(r.quantity), 0);

  return {
    total_products: totalProducts,
    total_warehouses: totalWarehouses,
    total_stock_units: totalStockUnits,
    total_movements: totalMovements,
    low_stock_count: lowStock
  };
};

// export const getLowStockProducts = async () => {
//   const rows = await prisma.product.findMany({
//     where: {
//       quantityAvailable: {
//         lt: prisma.product.fields.reorderLevel
//       }
//     },
//     orderBy: { quantityAvailable: "asc" }
//   });

//   return rows.map(p => ({
//     id: p.id,
//     sku: p.sku,
//     name: p.name,
//     current_stock: Number(p.quantityAvailable || 0),
//     reorder_level: Number(p.reorderLevel)
//   }));
// };

export const getRecentStockMoves = async () => {
  const moves = await prisma.stockMove.findMany({
    take: 15,
    orderBy: { createdAt: "desc" },
    include: { product: true }
  });

  return moves.map(m => ({
    id: m.id,
    type: m.type,
    reference: m.reference,
    product_id: m.productId,
    product_name: m.product?.name,
    quantity: Number(m.quantity),
    uom: m.uom,
    from_location: m.fromLocationId,
    to_location: m.toLocationId,
    status: m.status,
    created_at: m.createdAt
  }));
};

export const getWarehouseSummary = async () => {
  const warehouses = await prisma.warehouse.findMany({
    include: {
      locations: {
        include: {
          stockRecords: true
        }
      }
    }
  });

  return warehouses.map(w => {
    const totalStock = w.locations.reduce((sum, loc) => {
      return sum + loc.stockRecords.reduce((s, r) => s + Number(r.quantity), 0);
    }, 0);

    return {
      id: w.id,
      name: w.name,
      code: w.code,
      total_stock_units: totalStock,
      location_count: w.locations.length
    };
  });
};

export const getTopMovingProducts = async () => {
  const top = await prisma.stockMove.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 10
  });

  const result = [];
  for (const item of top) {
    const product = await prisma.product.findUnique({ where: { id: item.productId }});
    if (product) {
      result.push({
        product_id: product.id,
        name: product.name,
        sku: product.sku,
        total_moved_qty: Number(item._sum.quantity)
      });
    }
  }

  return result;
};
