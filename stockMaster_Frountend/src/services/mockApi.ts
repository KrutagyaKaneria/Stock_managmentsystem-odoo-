// Mock API service that returns dummy data with delays to simulate real API
import type { AxiosResponse } from 'axios'
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
import {
  mockDashboard,
  mockProducts,
  mockProductDetail,
  mockReceipts,
  mockReceiptDetail,
  mockDeliveries,
  mockDeliveryDetail,
  mockTransfers,
  mockTransferDetail,
  mockAdjustments,
  mockAdjustmentDetail,
  mockStockMoves,
  mockWarehouses,
  mockLocations,
  mockCategories,
  mockSuppliers,
  mockCustomers,
  mockUser,
} from './mockData'

// Simulate network delay
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms))

// Helper to create axios-like response
const createResponse = <T>(data: T): Promise<AxiosResponse<T>> =>
  delay().then(() => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  }))

// Mock API functions matching the real API structure
export const mockAPI = {
  // Dashboard
  getKPIs: (params?: any) => createResponse(mockDashboard),

  // Products
  list: (params?: any) => {
    // Simulate filtering
    let products = [...mockProducts.products]
    
    if (params?.search) {
      const search = params.search.toLowerCase()
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search)
      )
    }
    
    if (params?.category_id) {
      products = products.filter((p) => p.category_id === params.category_id)
    }

    return createResponse({
      ...mockProducts,
      products,
      pagination: {
        ...mockProducts.pagination,
        total: products.length,
      },
    })
  },

  getById: (id: number) => {
    const product = mockProducts.products.find((p) => p.id === id)
    if (!product) {
      return Promise.reject({ response: { status: 404, data: { message: 'Product not found' } } })
    }
    return createResponse({
      ...mockProductDetail,
      product: { ...product, ...mockProductDetail.product },
    })
  },

  create: (data: any) => {
    const newProduct = {
      id: mockProducts.products.length + 1,
      ...data,
      category_name: mockCategories.categories.find((c) => c.id === data.category_id)?.name || '',
      created_at: new Date().toISOString(),
    }
    mockProducts.products.push(newProduct)
    return createResponse({
      ...mockProductDetail,
      product: newProduct,
    })
  },

  update: (id: number, data: any) => {
    const index = mockProducts.products.findIndex((p) => p.id === id)
    if (index === -1) {
      return Promise.reject({ response: { status: 404, data: { message: 'Product not found' } } })
    }
    mockProducts.products[index] = {
      ...mockProducts.products[index],
      ...data,
      updated_at: new Date().toISOString(),
    }
    return createResponse({
      ...mockProductDetail,
      product: mockProducts.products[index],
    })
  },

  delete: (id: number) => {
    const index = mockProducts.products.findIndex((p) => p.id === id)
    if (index === -1) {
      return Promise.reject({ response: { status: 404, data: { message: 'Product not found' } } })
    }
    mockProducts.products.splice(index, 1)
    return createResponse({} as any)
  },

  // Receipts
  receipts: {
    list: (params?: any) => {
      let receipts = [...mockReceipts.receipts]
      
      if (params?.status) {
        receipts = receipts.filter((r) => r.status === params.status)
      }

      return createResponse({
        ...mockReceipts,
        receipts,
        pagination: {
          ...mockReceipts.pagination,
          total: receipts.length,
        },
      })
    },

    getById: (id: number) => {
      const receipt = mockReceipts.receipts.find((r) => r.id === id)
      if (!receipt) {
        return Promise.reject({ response: { status: 404, data: { message: 'Receipt not found' } } })
      }
      return createResponse({
        ...mockReceiptDetail,
        receipt: { ...receipt, ...mockReceiptDetail.receipt },
      })
    },

    create: (data: any) => {
      const newReceipt = {
        id: mockReceipts.receipts.length + 501,
        ...data,
        supplier_name: mockSuppliers.suppliers.find((s) => s.id === data.supplier_id)?.name || '',
        warehouse_name: mockWarehouses.warehouses.find((w) => w.id === data.warehouse_id)?.name || '',
        location_name: mockLocations.locations.find((l) => l.id === data.location_id)?.name || '',
        status: 'draft',
        total_items: data.lines?.length || 0,
        created_at: new Date().toISOString(),
      }
      mockReceipts.receipts.push(newReceipt)
      return createResponse({
        success: true,
        receipt: newReceipt,
      })
    },

    update: (id: number, data: any) => {
      const index = mockReceipts.receipts.findIndex((r) => r.id === id)
      if (index === -1) {
        return Promise.reject({ response: { status: 404, data: { message: 'Receipt not found' } } })
      }
      mockReceipts.receipts[index] = {
        ...mockReceipts.receipts[index],
        ...data,
      }
      return createResponse({
        success: true,
        receipt: mockReceipts.receipts[index],
      })
    },

    delete: (id: number) => {
      const index = mockReceipts.receipts.findIndex((r) => r.id === id)
      if (index === -1) {
        return Promise.reject({ response: { status: 404, data: { message: 'Receipt not found' } } })
      }
      mockReceipts.receipts.splice(index, 1)
      return createResponse({} as any)
    },

    receive: (id: number, data: any) => {
      const receipt = mockReceipts.receipts.find((r) => r.id === id)
      if (!receipt) {
        return Promise.reject({ response: { status: 404, data: { message: 'Receipt not found' } } })
      }
      receipt.status = 'done'
      return createResponse({
        success: true,
        receipt,
      })
    },
  },

  // Deliveries
  deliveries: {
    list: (params?: any) => {
      let deliveries = [...mockDeliveries.deliveries]
      
      if (params?.status) {
        deliveries = deliveries.filter((d) => d.status === params.status)
      }

      return createResponse({
        ...mockDeliveries,
        deliveries,
        pagination: {
          ...mockDeliveries.pagination,
          total: deliveries.length,
        },
      })
    },

    getById: (id: number) => {
      const delivery = mockDeliveries.deliveries.find((d) => d.id === id)
      if (!delivery) {
        return Promise.reject({ response: { status: 404, data: { message: 'Delivery not found' } } })
      }
      return createResponse({
        ...mockDeliveryDetail,
        delivery: { ...delivery, ...mockDeliveryDetail.delivery },
      })
    },

    create: (data: any) => {
      const newDelivery = {
        id: mockDeliveries.deliveries.length + 301,
        ...data,
        customer_name: mockCustomers.customers.find((c) => c.id === data.customer_id)?.name || '',
        warehouse_name: mockWarehouses.warehouses.find((w) => w.id === data.warehouse_id)?.name || '',
        location_name: mockLocations.locations.find((l) => l.id === data.location_id)?.name || '',
        status: 'draft',
        total_items: data.lines?.length || 0,
        created_at: new Date().toISOString(),
      }
      mockDeliveries.deliveries.push(newDelivery)
      return createResponse({
        success: true,
        delivery: newDelivery,
      })
    },

    update: (id: number, data: any) => {
      const index = mockDeliveries.deliveries.findIndex((d) => d.id === id)
      if (index === -1) {
        return Promise.reject({ response: { status: 404, data: { message: 'Delivery not found' } } })
      }
      mockDeliveries.deliveries[index] = {
        ...mockDeliveries.deliveries[index],
        ...data,
      }
      return createResponse({
        success: true,
        delivery: mockDeliveries.deliveries[index],
      })
    },

    delete: (id: number) => {
      const index = mockDeliveries.deliveries.findIndex((d) => d.id === id)
      if (index === -1) {
        return Promise.reject({ response: { status: 404, data: { message: 'Delivery not found' } } })
      }
      mockDeliveries.deliveries.splice(index, 1)
      return createResponse({} as any)
    },

    pick: (id: number, data: any) => {
      const delivery = mockDeliveries.deliveries.find((d) => d.id === id)
      if (!delivery) {
        return Promise.reject({ response: { status: 404, data: { message: 'Delivery not found' } } })
      }
      delivery.status = 'ready'
      return createResponse({
        success: true,
        delivery,
      })
    },

    validate: (id: number, data?: any) => {
      const delivery = mockDeliveries.deliveries.find((d) => d.id === id)
      if (!delivery) {
        return Promise.reject({ response: { status: 404, data: { message: 'Delivery not found' } } })
      }
      delivery.status = 'done'
      return createResponse({
        success: true,
        delivery,
      })
    },
  },

  // Transfers
  transfers: {
    list: (params?: any) => {
      let transfers = [...mockTransfers.transfers]
      
      if (params?.status) {
        transfers = transfers.filter((t) => t.status === params.status)
      }

      return createResponse({
        ...mockTransfers,
        transfers,
        pagination: {
          ...mockTransfers.pagination,
          total: transfers.length,
        },
      })
    },

    getById: (id: number) => {
      const transfer = mockTransfers.transfers.find((t) => t.id === id)
      if (!transfer) {
        return Promise.reject({ response: { status: 404, data: { message: 'Transfer not found' } } })
      }
      return createResponse({
        ...mockTransferDetail,
        transfer: { ...transfer, ...mockTransferDetail.transfer },
      })
    },

    create: (data: any) => {
      const newTransfer = {
        id: mockTransfers.transfers.length + 201,
        ...data,
        from_location_name: mockLocations.locations.find((l) => l.id === data.from_location_id)?.name || '',
        to_location_name: mockLocations.locations.find((l) => l.id === data.to_location_id)?.name || '',
        status: 'draft',
        total_items: data.lines?.length || 0,
        created_at: new Date().toISOString(),
      }
      mockTransfers.transfers.push(newTransfer)
      return createResponse({
        success: true,
        transfer: newTransfer,
      })
    },

    update: (id: number, data: any) => {
      const index = mockTransfers.transfers.findIndex((t) => t.id === id)
      if (index === -1) {
        return Promise.reject({ response: { status: 404, data: { message: 'Transfer not found' } } })
      }
      mockTransfers.transfers[index] = {
        ...mockTransfers.transfers[index],
        ...data,
      }
      return createResponse({
        success: true,
        transfer: mockTransfers.transfers[index],
      })
    },

    delete: (id: number) => {
      const index = mockTransfers.transfers.findIndex((t) => t.id === id)
      if (index === -1) {
        return Promise.reject({ response: { status: 404, data: { message: 'Transfer not found' } } })
      }
      mockTransfers.transfers.splice(index, 1)
      return createResponse({} as any)
    },

    validate: (id: number, data: any) => {
      const transfer = mockTransfers.transfers.find((t) => t.id === id)
      if (!transfer) {
        return Promise.reject({ response: { status: 404, data: { message: 'Transfer not found' } } })
      }
      transfer.status = 'done'
      return createResponse({
        success: true,
        transfer,
      })
    },
  },

  // Adjustments
  adjustments: {
    list: (params?: any) => {
      let adjustments = [...mockAdjustments.adjustments]
      
      if (params?.status) {
        adjustments = adjustments.filter((a) => a.status === params.status)
      }

      return createResponse({
        ...mockAdjustments,
        adjustments,
        pagination: {
          ...mockAdjustments.pagination,
          total: adjustments.length,
        },
      })
    },

    getById: (id: number) => {
      const adjustment = mockAdjustments.adjustments.find((a) => a.id === id)
      if (!adjustment) {
        return Promise.reject({ response: { status: 404, data: { message: 'Adjustment not found' } } })
      }
      return createResponse({
        ...mockAdjustmentDetail,
        adjustment: { ...adjustment, ...mockAdjustmentDetail.adjustment },
      })
    },

    create: (data: any) => {
      const newAdjustment = {
        id: mockAdjustments.adjustments.length + 401,
        ...data,
        warehouse_name: mockWarehouses.warehouses.find((w) => w.id === data.warehouse_id)?.name || '',
        location_name: mockLocations.locations.find((l) => l.id === data.location_id)?.name || '',
        status: 'draft',
        total_items: data.lines?.length || 0,
        created_at: new Date().toISOString(),
      }
      mockAdjustments.adjustments.push(newAdjustment)
      return createResponse({
        success: true,
        adjustment: newAdjustment,
      })
    },

    update: (id: number, data: any) => {
      const index = mockAdjustments.adjustments.findIndex((a) => a.id === id)
      if (index === -1) {
        return Promise.reject({ response: { status: 404, data: { message: 'Adjustment not found' } } })
      }
      mockAdjustments.adjustments[index] = {
        ...mockAdjustments.adjustments[index],
        ...data,
      }
      return createResponse({
        success: true,
        adjustment: mockAdjustments.adjustments[index],
      })
    },

    delete: (id: number) => {
      const index = mockAdjustments.adjustments.findIndex((a) => a.id === id)
      if (index === -1) {
        return Promise.reject({ response: { status: 404, data: { message: 'Adjustment not found' } } })
      }
      mockAdjustments.adjustments.splice(index, 1)
      return createResponse({} as any)
    },
  },

  // Stock Moves
  stockMoves: {
    list: (params?: any) => {
      let moves = [...mockStockMoves.moves]
      
      if (params?.type) {
        moves = moves.filter((m) => m.type === params.type)
      }
      
      if (params?.product_id) {
        moves = moves.filter((m) => m.id === params.product_id) // Simplified
      }

      return createResponse({
        ...mockStockMoves,
        moves,
        pagination: {
          ...mockStockMoves.pagination,
          total: moves.length,
        },
      })
    },
  },

  // Warehouses
  warehouses: {
    list: () => createResponse(mockWarehouses),
    create: (data: any) => {
      const newWarehouse = {
        id: mockWarehouses.warehouses.length + 1,
        ...data,
        location_count: 0,
        created_at: new Date().toISOString(),
      }
      mockWarehouses.warehouses.push(newWarehouse)
      return createResponse({
        success: true,
        warehouse: newWarehouse,
      })
    },
  },

  // Locations
  locations: {
    list: (warehouse_id?: number) => {
      let locations = [...mockLocations.locations]
      if (warehouse_id) {
        locations = locations.filter((l) => l.warehouse_id === warehouse_id)
      }
      return createResponse({
        ...mockLocations,
        locations,
      })
    },
    create: (warehouse_id: number, data: any) => {
      const newLocation = {
        id: mockLocations.locations.length + 1,
        warehouse_id,
        warehouse_name: mockWarehouses.warehouses.find((w) => w.id === warehouse_id)?.name || '',
        ...data,
      }
      mockLocations.locations.push(newLocation)
      return createResponse({
        success: true,
        location: newLocation,
      })
    },
  },

  // Categories
  categories: {
    list: () => createResponse<CategoriesResponse>({ categories: mockCategories }),
    get: (id: number) => {
      const category = mockCategories.find(cat => cat.id === id)
      if (!category) {
        return Promise.reject({ response: { status: 404, data: { message: 'Category not found' } } })
      }
      return createResponse({ category })
    },
    create: (data: { name: string; description?: string }) => {
      const newCategory = {
        id: Math.max(0, ...mockCategories.map(c => c.id)) + 1,
        name: data.name,
        description: data.description || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      mockCategories.push(newCategory)
      return createResponse({ category: newCategory })
    },
    update: (id: number, data: { name?: string; description?: string }) => {
      const index = mockCategories.findIndex(cat => cat.id === id)
      if (index === -1) {
        return Promise.reject({ response: { status: 404, data: { message: 'Category not found' } } })
      }
      const updatedCategory = {
        ...mockCategories[index],
        ...data,
        updated_at: new Date().toISOString(),
      }
      mockCategories[index] = updatedCategory
      return createResponse({ category: updatedCategory })
    },
    delete: (id: number) => {
      const index = mockCategories.findIndex(cat => cat.id === id)
      if (index === -1) {
        return Promise.reject({ response: { status: 404, data: { message: 'Category not found' } } })
      }
      mockCategories.splice(index, 1)
      return createResponse({ success: true })
    },
  },

  // Suppliers
  suppliers: {
    list: () => createResponse(mockSuppliers),
  },

  // Customers
  customers: {
    list: () => createResponse(mockCustomers),
  },

  // User
  user: {
    getMe: () => createResponse(mockUser),
  },
}

