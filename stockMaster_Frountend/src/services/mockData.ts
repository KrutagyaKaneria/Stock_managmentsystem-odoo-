// Mock data matching exact API response structures
import type {
  DashboardResponse,
  ProductsListResponse,
  ProductDetailResponse,
  ReceiptsListResponse,
  DeliveriesListResponse,
  TransfersListResponse,
  AdjustmentsListResponse,
  StockMovesResponse,
  WarehousesResponse,
  LocationsResponse,
  CategoriesResponse,
  SuppliersResponse,
  CustomersResponse,
  UserResponse,
} from '@/types'

// Mock Dashboard Data
export const mockDashboard: DashboardResponse = {
  success: true,
  kpis: {
    total_products_in_stock: 245,
    low_stock_items_count: 6,
    out_of_stock_items_count: 2,
    pending_receipts_count: 3,
    pending_deliveries_count: 4,
    internal_transfers_scheduled_count: 2,
  },
  filters: {
    by_document_type: ['receipt', 'delivery', 'internal', 'adjustment'],
    by_status: ['draft', 'waiting', 'ready', 'done', 'canceled'],
    by_warehouse: [
      { id: 1, name: 'Main Warehouse' },
      { id: 2, name: 'Secondary Warehouse' },
    ],
    by_category: [
      { id: 1, name: 'Finished Goods' },
      { id: 2, name: 'Raw Material' },
    ],
  },
  recent_stock_moves: [
    {
      id: 1001,
      type: 'receipt',
      product_name: 'Steel Rod',
      reference: 'REC-2025-001',
      quantity: 50,
      uom: 'kg',
      status: 'done',
      created_at: new Date().toISOString(),
    },
    {
      id: 1002,
      type: 'delivery',
      product_name: 'Bolt M8',
      reference: 'DEL-2025-012',
      quantity: -100,
      uom: 'pcs',
      status: 'done',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 1003,
      type: 'internal',
      product_name: 'Steel Rod',
      reference: 'TRF-2025-001',
      quantity: 20,
      uom: 'kg',
      status: 'done',
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ],
  low_stock_items: [
    {
      product_id: 5,
      product_name: 'Bolt M8',
      sku: 'BOLT-M8',
      quantity: 3,
      reorder_level: 10,
      uom: 'pcs',
      location_id: 10,
      warehouse_id: 1,
    },
    {
      product_id: 12,
      product_name: 'Washer 10mm',
      sku: 'WASH-10',
      quantity: 5,
      reorder_level: 20,
      uom: 'pcs',
      location_id: 15,
      warehouse_id: 1,
    },
  ],
}

// Mock Products
export const mockProducts: ProductsListResponse = {
  success: true,
  products: [
    {
      id: 1,
      name: 'Steel Rod',
      sku: 'SR-100',
      category_id: 2,
      category_name: 'Raw Material',
      uom: 'kg',
      initial_stock: 100,
      reorder_level: 20,
      created_at: '2025-01-10T00:00:00.000Z',
    },
    {
      id: 2,
      name: 'Bolt M8',
      sku: 'BOLT-M8',
      category_id: 1,
      category_name: 'Finished Goods',
      uom: 'pcs',
      initial_stock: 500,
      reorder_level: 50,
      created_at: '2025-01-11T00:00:00.000Z',
    },
    {
      id: 3,
      name: 'Washer 10mm',
      sku: 'WASH-10',
      category_id: 1,
      category_name: 'Finished Goods',
      uom: 'pcs',
      initial_stock: 300,
      reorder_level: 20,
      created_at: '2025-01-12T00:00:00.000Z',
    },
    {
      id: 4,
      name: 'Aluminum Sheet',
      sku: 'AL-SHT-001',
      category_id: 2,
      category_name: 'Raw Material',
      uom: 'm',
      initial_stock: 50,
      reorder_level: 10,
      created_at: '2025-01-13T00:00:00.000Z',
    },
    {
      id: 5,
      name: 'Nail 2 inch',
      sku: 'NAIL-2IN',
      category_id: 1,
      category_name: 'Finished Goods',
      uom: 'pcs',
      initial_stock: 1000,
      reorder_level: 200,
      created_at: '2025-01-14T00:00:00.000Z',
    },
  ],
  pagination: {
    total: 5,
    page: 1,
    limit: 20,
    pages: 1,
  },
}

// Mock Product Detail
export const mockProductDetail: ProductDetailResponse = {
  success: true,
  product: {
    id: 1,
    name: 'Steel Rod',
    sku: 'SR-100',
    category_id: 2,
    category_name: 'Raw Material',
    uom: 'kg',
    initial_stock: 100,
    reorder_level: 20,
    created_at: '2025-01-10T00:00:00.000Z',
    updated_at: '2025-01-10T00:00:00.000Z',
  },
  stock_by_location: [
    {
      location_id: 10,
      location_name: 'Rack A',
      warehouse_id: 1,
      warehouse_name: 'Main Warehouse',
      quantity: 120,
      uom: 'kg',
    },
    {
      location_id: 15,
      location_name: 'Shelf B-2',
      warehouse_id: 2,
      warehouse_name: 'Secondary Warehouse',
      quantity: 30,
      uom: 'kg',
    },
  ],
}

// Mock Receipts
export const mockReceipts: ReceiptsListResponse = {
  success: true,
  receipts: [
    {
      id: 501,
      reference: 'REC-2025-001',
      supplier_name: 'Vendor ABC',
      supplier_id: 42,
      warehouse_id: 1,
      warehouse_name: 'Main Warehouse',
      location_id: 10,
      location_name: 'Rack A',
      status: 'draft',
      total_items: 3,
      created_at: new Date().toISOString(),
    },
    {
      id: 502,
      reference: 'REC-2025-002',
      supplier_name: 'Supplier XYZ',
      supplier_id: 43,
      warehouse_id: 1,
      warehouse_name: 'Main Warehouse',
      location_id: 10,
      location_name: 'Rack A',
      status: 'done',
      total_items: 5,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 503,
      reference: 'REC-2025-003',
      supplier_name: 'Vendor ABC',
      supplier_id: 42,
      warehouse_id: 1,
      warehouse_name: 'Main Warehouse',
      status: 'ready',
      total_items: 2,
      created_at: new Date(Date.now() - 172800000).toISOString(),
    },
  ],
  pagination: {
    total: 3,
    page: 1,
    limit: 20,
    pages: 1,
  },
}

// Mock Receipt Detail
export const mockReceiptDetail = {
  success: true,
  receipt: {
    id: 501,
    reference: 'REC-2025-001',
    supplier_name: 'Vendor ABC',
    supplier_id: 42,
    warehouse_id: 1,
    warehouse_name: 'Main Warehouse',
    location_id: 10,
    location_name: 'Rack A',
    status: 'ready',
    notes: 'Urgent delivery',
    created_at: new Date().toISOString(),
    lines: [
      {
        product_id: 1,
        product_name: 'Steel Rod',
        qty_expected: 50,
        qty_received: null,
        uom: 'kg',
      },
      {
        product_id: 3,
        product_name: 'Washer 10mm',
        qty_expected: 100,
        qty_received: null,
        uom: 'pcs',
      },
    ],
  },
}

// Mock Deliveries
export const mockDeliveries: DeliveriesListResponse = {
  success: true,
  deliveries: [
    {
      id: 301,
      reference: 'DEL-2025-001',
      customer_name: 'Customer ABC Corp',
      customer_id: 77,
      warehouse_id: 1,
      warehouse_name: 'Main Warehouse',
      location_id: 10,
      location_name: 'Rack A',
      status: 'draft',
      total_items: 2,
      created_at: new Date().toISOString(),
    },
    {
      id: 302,
      reference: 'DEL-2025-002',
      customer_name: 'XYZ Industries',
      customer_id: 78,
      warehouse_id: 1,
      warehouse_name: 'Main Warehouse',
      status: 'waiting',
      total_items: 3,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  pagination: {
    total: 2,
    page: 1,
    limit: 20,
    pages: 1,
  },
}

// Mock Delivery Detail
export const mockDeliveryDetail = {
  success: true,
  delivery: {
    id: 301,
    reference: 'DEL-2025-001',
    customer_name: 'Customer ABC Corp',
    customer_id: 77,
    warehouse_id: 1,
    warehouse_name: 'Main Warehouse',
    location_id: 10,
    location_name: 'Rack A',
    status: 'draft',
    total_items: 2,
    created_at: new Date().toISOString(),
    lines: [
      {
        product_id: 3,
        product_name: 'Washer 10mm',
        qty_ordered: 10,
        qty_picked: null,
        uom: 'pcs',
      },
    ],
  },
}

// Mock Transfers
export const mockTransfers: TransfersListResponse = {
  success: true,
  transfers: [
    {
      id: 201,
      reference: 'TRF-2025-001',
      from_location_id: 10,
      from_location_name: 'Rack A',
      to_location_id: 21,
      to_location_name: 'Shelf B-2',
      from_warehouse_id: 1,
      from_warehouse_name: 'Main Warehouse',
      to_warehouse_id: 2,
      to_warehouse_name: 'Secondary Warehouse',
      status: 'draft',
      total_items: 1,
      created_at: new Date().toISOString(),
    },
  ],
  pagination: {
    total: 1,
    page: 1,
    limit: 20,
    pages: 1,
  },
}

// Mock Transfer Detail
export const mockTransferDetail = {
  success: true,
  transfer: {
    id: 201,
    reference: 'TRF-2025-001',
    from_location_id: 10,
    from_location_name: 'Rack A',
    to_location_id: 21,
    to_location_name: 'Shelf B-2',
    from_warehouse_id: 1,
    from_warehouse_name: 'Main Warehouse',
    to_warehouse_id: 2,
    to_warehouse_name: 'Secondary Warehouse',
    status: 'ready',
    total_items: 1,
    created_at: new Date().toISOString(),
    lines: [
      {
        product_id: 1,
        product_name: 'Steel Rod',
        qty: 20,
        qty_received: null,
        uom: 'kg',
      },
    ],
  },
}

// Mock Adjustments
export const mockAdjustments: AdjustmentsListResponse = {
  success: true,
  adjustments: [
    {
      id: 401,
      reference: 'ADJ-2025-001',
      warehouse_id: 1,
      warehouse_name: 'Main Warehouse',
      location_id: 10,
      location_name: 'Rack A',
      status: 'draft',
      total_items: 1,
      created_at: new Date().toISOString(),
    },
  ],
  pagination: {
    total: 1,
    page: 1,
    limit: 20,
    pages: 1,
  },
}

// Mock Adjustment Detail
export const mockAdjustmentDetail = {
  success: true,
  adjustment: {
    id: 401,
    reference: 'ADJ-2025-001',
    warehouse_id: 1,
    warehouse_name: 'Main Warehouse',
    location_id: 10,
    location_name: 'Rack A',
    status: 'draft',
    total_items: 1,
    created_at: new Date().toISOString(),
    lines: [
      {
        product_id: 1,
        product_name: 'Steel Rod',
        qty_counted: 117,
        reason: 'Damaged',
        uom: 'kg',
      },
    ],
  },
}

// Mock Stock Moves
export const mockStockMoves: StockMovesResponse = {
  success: true,
  moves: [
    {
      id: 1001,
      type: 'receipt',
      product_name: 'Steel Rod',
      reference: 'REC-2025-001',
      from_location: null,
      to_location: 'Rack A',
      warehouse_name: 'Main Warehouse',
      quantity: 50,
      uom: 'kg',
      status: 'done',
      created_at: new Date().toISOString(),
    },
    {
      id: 1002,
      type: 'delivery',
      product_name: 'Bolt M8',
      reference: 'DEL-2025-012',
      from_location: 'Shelf B-2',
      to_location: null,
      warehouse_name: 'Main Warehouse',
      quantity: -100,
      uom: 'pcs',
      status: 'done',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 1003,
      type: 'internal',
      product_name: 'Steel Rod',
      reference: 'TRF-2025-001',
      from_location: 'Rack A',
      to_location: 'Shelf B-2',
      warehouse_name: 'Main → Secondary',
      quantity: 20,
      uom: 'kg',
      status: 'done',
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ],
  pagination: {
    total: 3,
    page: 1,
    limit: 50,
    pages: 1,
  },
}

// Mock Warehouses
export const mockWarehouses: WarehousesResponse = {
  success: true,
  warehouses: [
    {
      id: 1,
      name: 'Main Warehouse',
      address: '123 Industrial Ave, City',
      location_count: 15,
      created_at: '2025-01-10T00:00:00.000Z',
    },
    {
      id: 2,
      name: 'Secondary Warehouse',
      address: '456 Storage Blvd',
      location_count: 8,
      created_at: '2025-01-11T00:00:00.000Z',
    },
  ],
}

// Mock Locations
export const mockLocations: LocationsResponse = {
  success: true,
  locations: [
    {
      id: 10,
      name: 'Rack A',
      warehouse_id: 1,
      warehouse_name: 'Main Warehouse',
      type: 'shelf',
      capacity: 1000,
      current_stock: 750,
      uom: 'kg',
    },
    {
      id: 15,
      name: 'Shelf B-2',
      warehouse_id: 2,
      warehouse_name: 'Secondary Warehouse',
      type: 'shelf',
      capacity: 500,
      current_stock: 300,
      uom: 'kg',
    },
    {
      id: 21,
      name: 'Rack C',
      warehouse_id: 1,
      warehouse_name: 'Main Warehouse',
      type: 'rack',
      capacity: 2000,
      current_stock: 1200,
      uom: 'kg',
    },
  ],
}

// Mock Categories
export const mockCategories: CategoriesResponse = {
  success: true,
  categories: [
    { id: 1, name: 'Finished Goods' },
    { id: 2, name: 'Raw Material' },
    { id: 3, name: 'Components' },
  ],
}

// Mock Suppliers
export const mockSuppliers: SuppliersResponse = {
  success: true,
  suppliers: [
    { id: 42, name: 'Vendor ABC' },
    { id: 43, name: 'Supplier XYZ' },
    { id: 44, name: 'Industrial Supplies Co' },
  ],
}

// Mock Customers
export const mockCustomers: CustomersResponse = {
  success: true,
  customers: [
    { id: 77, name: 'Customer ABC Corp' },
    { id: 78, name: 'XYZ Industries' },
    { id: 79, name: 'Global Manufacturing Ltd' },
  ],
}

// Mock User
export const mockUser: UserResponse = {
  success: true,
  user: {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    avatar_url: null,
    created_at: '2025-01-01T00:00:00.000Z',
  },
}

