export const formatStockRecord = (record) => ({
  id: record.id,
  product_id: record.productId,
  warehouse_id: record.warehouseId,
  location_id: record.locationId,
  quantity: record.quantity,
  uom: record.uom,
});