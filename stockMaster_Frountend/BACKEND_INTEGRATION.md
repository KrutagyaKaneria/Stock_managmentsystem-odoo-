# Backend Integration Guide

## ✅ Backend Integration Complete!

The frontend has been updated to use the **real backend API** instead of mock data.

## 🔧 Configuration

### Default Setup

The API service is now configured to use the real backend by default:

- **Backend URL:** `http://localhost:4000/api/v1`
- **Port:** 4000 (matches your backend server)
- **Base Path:** `/api/v1`

### Environment Variables

Create a `.env` file in `stockMaster_Frountend/` directory:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:4000/api/v1

# Set to false to use real backend (default)
VITE_USE_MOCK_API=false
```

**Note:** If `VITE_API_BASE_URL` is not set, it defaults to `http://localhost:4000/api/v1`

## 🚀 Running the Application

### Step 1: Start Backend Server

In `stockMaster_backend/` directory:
```bash
npm install
npm start
# or
node src/server.js
```

Backend should run on `http://localhost:4000`

### Step 2: Start Frontend

In `stockMaster_Frountend/` directory:
```bash
npm install
npm run dev
```

Frontend will run on `http://localhost:5173` (or next available port)

### Step 3: Verify Connection

1. Open browser console
2. You should see: `🌐 Connecting to Backend API: http://localhost:4000/api/v1`
3. Navigate to Dashboard - data should load from backend

## 📋 API Endpoints Mapping

All frontend API calls map to your backend routes:

| Frontend API | Backend Route | Method |
|-------------|---------------|--------|
| `dashboardAPI.getKPIs()` | `/api/v1/dashboard` | GET |
| `productsAPI.list()` | `/api/v1/products` | GET |
| `productsAPI.create()` | `/api/v1/products` | POST |
| `productsAPI.getById()` | `/api/v1/products/:id` | GET |
| `productsAPI.update()` | `/api/v1/products/:id` | PUT |
| `productsAPI.delete()` | `/api/v1/products/:id` | DELETE |
| `receiptsAPI.list()` | `/api/v1/receipts` | GET |
| `receiptsAPI.create()` | `/api/v1/receipts` | POST |
| `receiptsAPI.getById()` | `/api/v1/receipts/:id` | GET |
| `receiptsAPI.receive()` | `/api/v1/receipts/:id/receive` | POST |
| `deliveriesAPI.list()` | `/api/v1/deliveries` | GET |
| `deliveriesAPI.pick()` | `/api/v1/deliveries/:id/pick` | POST |
| `deliveriesAPI.validate()` | `/api/v1/deliveries/:id/validate` | POST |
| `transfersAPI.list()` | `/api/v1/transfers` | GET |
| `transfersAPI.validate()` | `/api/v1/transfers/:id/validate` | POST |
| `adjustmentsAPI.list()` | `/api/v1/adjustments` | GET |
| `stockMovesAPI.list()` | `/api/v1/stock-moves` | GET |
| `warehousesAPI.list()` | `/api/v1/warehouses` | GET |
| `locationsAPI.list()` | `/api/v1/locations` | GET |

## 🔍 Error Handling

The API service includes comprehensive error handling:

1. **Network Errors:**
   - Shows "Network error - Please check if the backend server is running"
   - Logs to console for debugging

2. **API Errors:**
   - Extracts error message from `response.data.message` or `response.data.error`
   - Displays user-friendly error messages
   - Logs full error details to console

3. **Timeout:**
   - 30-second timeout for all requests
   - Prevents hanging requests

## 🔐 Authentication

The API service automatically includes authentication tokens:

- Token is read from `localStorage.getItem('auth_token')`
- Added to all requests as `Authorization: Bearer <token>`
- Set token after login: `localStorage.setItem('auth_token', 'your-token-here')`

## 🧪 Testing the Integration

### Test 1: Dashboard
1. Navigate to `/`
2. Check browser console for API calls
3. Verify KPIs load from backend

### Test 2: Products
1. Navigate to `/products`
2. Verify product list loads
3. Try creating a new product
4. Check if it appears in the list

### Test 3: Receipts
1. Navigate to `/receipts`
2. Create a new receipt
3. View receipt details
4. Try receiving stock

### Test 4: Network Tab
1. Open browser DevTools → Network tab
2. Navigate through the app
3. Verify API calls are going to `http://localhost:4000/api/v1`
4. Check response status codes (200 = success)

## 🐛 Troubleshooting

### Issue: "Network error" or CORS errors

**Solution:**
1. Ensure backend is running on port 4000
2. Check backend CORS configuration allows frontend origin
3. Verify backend is accessible at `http://localhost:4000`

### Issue: 404 errors on API calls

**Solution:**
1. Verify backend routes match frontend API calls
2. Check backend is using `/api/v1` prefix
3. Verify route paths are correct

### Issue: 401 Unauthorized errors

**Solution:**
1. Set authentication token: `localStorage.setItem('auth_token', 'your-token')`
2. Verify token format matches backend expectations
3. Check backend authentication middleware

### Issue: Data not loading

**Solution:**
1. Check browser console for errors
2. Verify backend is returning data in expected format
3. Check Network tab for actual API responses
4. Verify response structure matches TypeScript types

## 📝 Response Format

The frontend expects responses in this format:

```json
{
  "success": true,
  "data": { ... }
}
```

Or for list endpoints:

```json
{
  "success": true,
  "products": [ ... ],
  "pagination": { ... }
}
```

If your backend uses a different format, you may need to adjust the response interceptors in `api.ts`.

## ✅ Integration Checklist

- [x] API service updated to use real backend
- [x] Default API URL set to `http://localhost:4000/api/v1`
- [x] Mock mode disabled by default
- [x] Error handling configured
- [x] Authentication token interceptor added
- [x] Timeout configured (30 seconds)
- [x] Console logging for debugging
- [x] All API endpoints mapped correctly

## 🎉 Ready to Use!

The frontend is now fully integrated with your backend. Just:

1. Start your backend server
2. Start the frontend
3. The app will automatically connect to the backend API

All API calls will go to your real backend - no mock data!

