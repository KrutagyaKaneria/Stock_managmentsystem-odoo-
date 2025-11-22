import axios from 'axios'
import type {
  DashboardResponse,
  ProductsListResponse,
  ProductDetailResponse,
  CreateProductRequest,
  ReceiptsListResponse,
  Receipt,
  CreateReceiptRequest,
  ReceiveStockRequest,
  DeliveriesListResponse,
  Delivery,
  CreateDeliveryRequest,
  PickDeliveryRequest,
  ValidateDeliveryRequest,
  TransfersListResponse,
  Transfer,
  CreateTransferRequest,
  ValidateTransferRequest,
  AdjustmentsListResponse,
  Adjustment,
  CreateAdjustmentRequest,
  StockMovesResponse,
  WarehousesResponse,
  Warehouse,
  Location,
  CategoriesResponse,
  SuppliersResponse,
  CustomersResponse,
  UserResponse,
} from '@/types'

// Backend API Base URL - Update this to match your backend server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
})

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for transforming backend response format
// Backend returns: { success: true, message: "...", data: {...} }
// Frontend expects different formats per endpoint, so we transform here
api.interceptors.response.use(
  (response) => {
    // If backend wraps response in { success, message, data }
    // Extract the data and merge with success/message if needed
    if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
      const { data, success, message, ...rest } = response.data
      
      // For endpoints that expect the data directly (like products list)
      // Check if the response structure matches expected format
      if (data && typeof data === 'object') {
        // Merge data with success and other top-level fields
        response.data = {
          ...data,
          success: success !== undefined ? success : true,
          ...(message && { message }),
          ...rest,
        }
      }
    }
    return response
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      error.message = 'Network error - Please check if the backend server is running'
      console.error('🌐 API Error:', error.message)
      return Promise.reject({ ...error, message: error.message })
    }

    // Handle API errors
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An error occurred'
    
    console.error('🌐 API Error:', {
      status: error.response?.status,
      message,
      url: error.config?.url,
    })

    return Promise.reject({ ...error, message })
  }
)

// Log API connection status
console.log('🌐 Connecting to Backend API:', API_BASE_URL)

// Dashboard
export const dashboardAPI = {
  getKPIs: (params?: {
    document_type?: string
    status?: string
    warehouse_id?: number
    category_id?: number
  }) => api.get<DashboardResponse>('/dashboard', { params }),
}

// Products
export const productsAPI = {
  list: (params?: {
    category_id?: number
    search?: string
    warehouse_id?: number
    page?: number
    limit?: number
  }) => api.get<ProductsListResponse>('/products', { params }),
  getById: (id: number) => api.get<ProductDetailResponse>(`/products/${id}`),
  create: (data: CreateProductRequest) => api.post<ProductDetailResponse>('/products', data),
  update: (id: number, data: Partial<CreateProductRequest>) =>
    api.put<ProductDetailResponse>(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
}

// Receipts
export const receiptsAPI = {
  list: (params?: {
    status?: string
    warehouse_id?: number
    page?: number
    limit?: number
  }) => api.get<ReceiptsListResponse>('/receipts', { params }),
  getById: (id: number) => api.get<{ success: boolean; receipt: Receipt }>(`/receipts/${id}`),
  create: (data: CreateReceiptRequest) =>
    api.post<{ success: boolean; receipt: Receipt }>('/receipts', data),
  update: (id: number, data: Partial<CreateReceiptRequest>) =>
    api.put<{ success: boolean; receipt: Receipt }>(`/receipts/${id}`, data),
  delete: (id: number) => api.delete(`/receipts/${id}`),
  receive: (id: number, data: ReceiveStockRequest) =>
    api.post<{ success: boolean; receipt: Receipt }>(`/receipts/${id}/receive`, data),
}

// Deliveries
export const deliveriesAPI = {
  list: (params?: {
    status?: string
    warehouse_id?: number
    page?: number
    limit?: number
  }) => api.get<DeliveriesListResponse>('/deliveries', { params }),
  getById: (id: number) => api.get<{ success: boolean; delivery: Delivery }>(`/deliveries/${id}`),
  create: (data: CreateDeliveryRequest) =>
    api.post<{ success: boolean; delivery: Delivery }>('/deliveries', data),
  update: (id: number, data: Partial<CreateDeliveryRequest>) =>
    api.put<{ success: boolean; delivery: Delivery }>(`/deliveries/${id}`, data),
  delete: (id: number) => api.delete(`/deliveries/${id}`),
  pick: (id: number, data: PickDeliveryRequest) =>
    api.post<{ success: boolean; delivery: Delivery }>(`/deliveries/${id}/pick`, data),
  validate: (id: number, data?: ValidateDeliveryRequest) =>
    api.post<{ success: boolean; delivery: Delivery }>(`/deliveries/${id}/validate`, data || {}),
}

// Transfers
export const transfersAPI = {
  list: (params?: {
    status?: string
    warehouse_id?: number
    page?: number
    limit?: number
  }) => api.get<TransfersListResponse>('/transfers', { params }),
  getById: (id: number) => api.get<{ success: boolean; transfer: Transfer }>(`/transfers/${id}`),
  create: (data: CreateTransferRequest) =>
    api.post<{ success: boolean; transfer: Transfer }>('/transfers', data),
  update: (id: number, data: Partial<CreateTransferRequest>) =>
    api.put<{ success: boolean; transfer: Transfer }>(`/transfers/${id}`, data),
  delete: (id: number) => api.delete(`/transfers/${id}`),
  validate: (id: number, data: ValidateTransferRequest) =>
    api.post<{ success: boolean; transfer: Transfer }>(`/transfers/${id}/validate`, data),
}

// Adjustments
export const adjustmentsAPI = {
  list: (params?: {
    status?: string
    warehouse_id?: number
    page?: number
    limit?: number
  }) => api.get<AdjustmentsListResponse>('/adjustments', { params }),
  getById: (id: number) =>
    api.get<{ success: boolean; adjustment: Adjustment }>(`/adjustments/${id}`),
  create: (data: CreateAdjustmentRequest) =>
    api.post<{ success: boolean; adjustment: Adjustment }>('/adjustments', data),
  update: (id: number, data: Partial<CreateAdjustmentRequest>) =>
    api.put<{ success: boolean; adjustment: Adjustment }>(`/adjustments/${id}`, data),
  delete: (id: number) => api.delete(`/adjustments/${id}`),
}

// Stock Moves History
export const stockMovesAPI = {
  list: (params?: {
    product_id?: number
    type?: string
    warehouse_id?: number
    date_from?: string
    date_to?: string
    limit?: number
    page?: number
  }) => api.get<StockMovesResponse>('/stock-moves', { params }),
}

// Warehouses
export const warehousesAPI = {
  list: () => api.get<WarehousesResponse>('/warehouses'),
  getById: (id: number) => api.get<{ success: boolean; warehouse: Warehouse }>(`/warehouses/${id}`),
  create: (data: { name: string; address?: string }) =>
    api.post<{ success: boolean; warehouse: Warehouse }>('/warehouses', data),
  update: (id: number, data: { name?: string; address?: string }) =>
    api.put<{ success: boolean; warehouse: Warehouse }>(`/warehouses/${id}`, data),
  delete: (id: number) => api.delete(`/warehouses/${id}`),
}

// Locations
export const locationsAPI = {
  list: (warehouse_id?: number) =>
    api.get<LocationsResponse>('/locations', { params: { warehouse_id } }),
  getById: (id: number) => api.get<{ success: boolean; location: Location }>(`/locations/${id}`),
  create: (warehouse_id: number, data: { name: string; type?: string; capacity?: number; uom?: string }) =>
    api.post<{ success: boolean; location: Location }>(
      `/warehouses/${warehouse_id}/locations`,
      data
    ),
  update: (id: number, data: { name?: string; type?: string; capacity?: number; uom?: string }) =>
    api.put<{ success: boolean; location: Location }>(`/locations/${id}`, data),
  delete: (id: number) => api.delete(`/locations/${id}`),
}

// Categories
export const categoriesAPI = {
  list: () => api.get<CategoriesResponse>('/categories'),
}

// Suppliers
export const suppliersAPI = {
  list: () => api.get<SuppliersResponse>('/suppliers'),
}

// Customers
export const customersAPI = {
  list: () => api.get<CustomersResponse>('/customers'),
}

// User
export const userAPI = {
  getMe: () => api.get<UserResponse>('/me'),
  updateMe: (data: { name?: string; email?: string }) =>
    api.put<UserResponse>('/me', data),
}

export default api
