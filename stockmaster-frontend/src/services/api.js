import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default {
  // Products
  getProducts: () => api.get('/products'),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  
  // Warehouses
  getWarehouses: () => api.get('/warehouses'),
  createWarehouse: (data) => api.post('/warehouses', data),
  updateWarehouse: (id, data) => api.put(`/warehouses/${id}`, data),
  deleteWarehouse: (id) => api.delete(`/warehouses/${id}`),
  
  // Locations
  getLocations: () => api.get('/locations'),
  getLocationsByWarehouse: (wid) => api.get(`/locations/warehouse/${wid}`),
  createLocation: (data) => api.post('/locations', data),
  updateLocation: (id, data) => api.put(`/locations/${id}`, data),
  deleteLocation: (id) => api.delete(`/locations/${id}`),
  
  // Receipts
  getReceipts: (params) => api.get('/receipts', { params }),
  createReceipt: (data) => api.post('/receipts', data),
  receiveReceipt: (id, data) => api.post(`/receipts/${id}/receive`, data),
  deleteReceipt: (id) => api.delete(`/receipts/${id}`),
  
  // Deliveries
  getDeliveries: (params) => api.get('/deliveries', { params }),
  createDelivery: (data) => api.post('/deliveries', data),
  validateDelivery: (id, data) => api.post(`/deliveries/${id}/validate`, data),
  deleteDelivery: (id) => api.delete(`/deliveries/${id}`),
  
  // Transfers
  getTransfers: (params) => api.get('/transfers', { params }),
  createTransfer: (data) => api.post('/transfers', data),
  validateTransfer: (id, data) => api.post(`/transfers/${id}/validate`, data),
  deleteTransfer: (id) => api.delete(`/transfers/${id}`),
  
  // Adjustments
  getAdjustments: (params) => api.get('/adjustments', { params }),
  createAdjustment: (data) => api.post('/adjustments', data),
  deleteAdjustment: (id) => api.delete(`/adjustments/${id}`),
  
  // Stock Moves
  getStockMoves: (params) => api.get('/stock-moves', { params }),
  
  // Dashboard
  getDashboardStats: () => api.get('/dashboard'),
  getLowStock: () => api.get('/dashboard/low-stock'),
  getRecentMoves: () => api.get('/dashboard/recent-moves'),
  getWarehouseSummary: () => api.get('/dashboard/warehouse-summary'),
  getTopProducts: () => api.get('/dashboard/top-products')
}