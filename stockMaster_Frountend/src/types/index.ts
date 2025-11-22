// Exact API response types - DO NOT MODIFY field names

export interface ApiResponse<T> {
  success: boolean
  [key: string]: any
}

// Dashboard
export interface DashboardResponse {
  success: boolean
  kpis: {
    total_products_in_stock: number
    low_stock_items_count: number
    out_of_stock_items_count: number
    pending_receipts_count: number
    pending_deliveries_count: number
    internal_transfers_scheduled_count: number
  }
  filters: {
    by_document_type: string[]
    by_status: string[]
    by_warehouse: Array<{ id: number; name: string }>
    by_category: Array<{ id: number; name: string }>
  }
  recent_stock_moves: StockMove[]
  low_stock_items: LowStockItem[]
}

export interface StockMove {
  id: number
  type: 'receipt' | 'delivery' | 'internal' | 'adjustment'
  product_name: string
  reference: string
  quantity: number
  uom: string
  status: 'draft' | 'waiting' | 'ready' | 'done' | 'canceled'
  created_at: string
}

export interface LowStockItem {
  product_id: number
  product_name: string
  sku: string
  quantity: number
  reorder_level: number
  uom: string
  location_id: number
  warehouse_id: number
}

// Products
export interface ProductsListResponse {
  success: boolean
  products: Product[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface Product {
  id: number
  name: string
  sku: string
  category_id: number
  category_name: string
  uom: string
  initial_stock: number
  reorder_level: number
  created_at?: string
  updated_at?: string
}

export interface ProductDetailResponse {
  success: boolean
  product: Product
  stock_by_location: StockByLocation[]
}

export interface StockByLocation {
  location_id: number
  location_name: string
  warehouse_id: number
  warehouse_name: string
  quantity: number
  uom: string
}

export interface CreateProductRequest {
  name: string
  sku: string
  category_id: number
  uom: string
  initial_stock?: number
  reorder_level: number
}

// Receipts
export interface ReceiptsListResponse {
  success: boolean
  receipts: Receipt[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface Receipt {
  id: number
  reference: string
  supplier_name?: string
  supplier_id?: number
  warehouse_id: number
  warehouse_name: string
  location_id?: number
  location_name?: string
  status: 'draft' | 'waiting' | 'ready' | 'done' | 'canceled'
  total_items: number
  notes?: string
  created_at: string
  lines?: ReceiptLine[]
}

export interface ReceiptLine {
  product_id: number
  product_name: string
  qty_expected: number
  qty_received?: number | null
  uom: string
}

export interface CreateReceiptRequest {
  reference: string
  supplier_id: number
  warehouse_id: number
  location_id: number
  lines: Array<{
    product_id: number
    qty_expected: number
    uom: string
  }>
}

export interface ReceiveStockRequest {
  lines: Array<{
    product_id: number
    qty_received: number
  }>
}

// Deliveries
export interface DeliveriesListResponse {
  success: boolean
  deliveries: Delivery[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface Delivery {
  id: number
  reference: string
  customer_name?: string
  customer_id?: number
  warehouse_id: number
  warehouse_name: string
  location_id?: number
  location_name?: string
  status: 'draft' | 'waiting' | 'ready' | 'done' | 'canceled'
  total_items: number
  created_at: string
  lines?: DeliveryLine[]
}

export interface DeliveryLine {
  product_id: number
  product_name: string
  qty_ordered: number
  qty_picked?: number | null
  uom: string
}

export interface CreateDeliveryRequest {
  reference: string
  customer_id: number
  warehouse_id: number
  location_id: number
  lines: Array<{
    product_id: number
    qty_ordered: number
    uom: string
  }>
}

export interface PickDeliveryRequest {
  lines: Array<{
    product_id: number
    qty_picked: number
  }>
}

export interface ValidateDeliveryRequest {
  tracking_number?: string
}

// Transfers
export interface TransfersListResponse {
  success: boolean
  transfers: Transfer[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface Transfer {
  id: number
  reference: string
  from_location_id: number
  from_location_name: string
  to_location_id: number
  to_location_name: string
  from_warehouse_id?: number
  from_warehouse_name?: string
  to_warehouse_id?: number
  to_warehouse_name?: string
  status: 'draft' | 'waiting' | 'ready' | 'done' | 'canceled'
  total_items: number
  created_at: string
  lines?: TransferLine[]
}

export interface TransferLine {
  product_id: number
  product_name: string
  qty: number
  qty_received?: number | null
  uom: string
}

export interface CreateTransferRequest {
  reference: string
  from_location_id: number
  to_location_id: number
  lines: Array<{
    product_id: number
    qty: number
    uom: string
  }>
}

export interface ValidateTransferRequest {
  lines: Array<{
    product_id: number
    qty_received: number
  }>
}

// Adjustments
export interface AdjustmentsListResponse {
  success: boolean
  adjustments: Adjustment[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface Adjustment {
  id: number
  reference: string
  warehouse_id: number
  warehouse_name: string
  location_id?: number
  location_name?: string
  status: 'draft' | 'waiting' | 'ready' | 'done' | 'canceled'
  total_items: number
  created_at: string
  lines?: AdjustmentLine[]
}

export interface AdjustmentLine {
  product_id: number
  product_name: string
  qty_counted: number
  reason?: string
  uom?: string
}

export interface CreateAdjustmentRequest {
  reference: string
  warehouse_id: number
  location_id: number
  lines: Array<{
    product_id: number
    qty_counted: number
    reason?: string
  }>
}

// Stock Moves History
export interface StockMovesResponse {
  success: boolean
  moves: StockMoveDetail[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface StockMoveDetail {
  id: number
  type: 'receipt' | 'delivery' | 'internal' | 'adjustment'
  product_name: string
  reference: string
  from_location: string | null
  to_location: string | null
  warehouse_name: string
  quantity: number
  uom: string
  status: 'draft' | 'waiting' | 'ready' | 'done' | 'canceled'
  created_at: string
}

// Warehouses
export interface WarehousesResponse {
  success: boolean
  warehouses: Warehouse[]
}

export interface Warehouse {
  id: number
  name: string
  address?: string
  location_count?: number
  created_at: string
}

// Locations
export interface LocationsResponse {
  success: boolean
  locations: Location[]
}

export interface Location {
  id: number
  name: string
  warehouse_id: number
  warehouse_name: string
  type?: string
  capacity?: number
  current_stock?: number
  uom?: string
}

// Categories
export interface CategoriesResponse {
  success: boolean
  categories: Category[]
}

export interface Category {
  id: number
  name: string
}

// Suppliers
export interface SuppliersResponse {
  success: boolean
  suppliers: Supplier[]
}

export interface Supplier {
  id: number
  name: string
}

// Customers
export interface CustomersResponse {
  success: boolean
  customers: Customer[]
}

export interface Customer {
  id: number
  name: string
}

// User
export interface UserResponse {
  success: boolean
  user: User
}

export interface User {
  id: number
  name: string
  email: string
  role: string
  avatar_url?: string | null
  created_at: string
}
