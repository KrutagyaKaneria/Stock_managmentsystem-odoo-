# Mock Data Setup Guide

## 🎯 Overview

The frontend now supports running with **mock/dummy data** so you can test and develop the entire application without a backend API.

## 🚀 Quick Start

### Option 1: Use Mock Data (Default)

1. **Create a `.env` file** in the root directory:
   ```env
   VITE_USE_MOCK_API=true
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

The app will automatically use mock data!

### Option 2: Use Real Backend API

1. **Create a `.env` file** with your backend URL:
   ```env
   VITE_USE_MOCK_API=false
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

## 📋 Mock Data Features

### ✅ What's Included

The mock data includes:

- **Dashboard Data**
  - 6 KPI cards with realistic values
  - Recent stock moves (10 items)
  - Low stock alerts (2 items)
  - Filter options (warehouses, categories, statuses)

- **Products** (5 sample products)
  - Steel Rod, Bolt M8, Washer 10mm, Aluminum Sheet, Nail 2 inch
  - Different categories and UOMs
  - Stock by location data

- **Receipts** (3 sample receipts)
  - Different statuses (draft, done, ready)
  - Product lines with quantities
  - Supplier information

- **Deliveries** (2 sample deliveries)
  - Customer information
  - Product lines
  - Different statuses

- **Transfers** (1 sample transfer)
  - From/to locations
  - Product lines

- **Adjustments** (1 sample adjustment)
  - Warehouse and location
  - Product with counted quantity and reason

- **Stock History** (3 sample moves)
  - Receipt, delivery, and internal transfer moves
  - Different dates and quantities

- **Warehouses** (2 warehouses)
  - Main Warehouse, Secondary Warehouse
  - Address and location counts

- **Locations** (3 locations)
  - Different types (shelf, rack)
  - Capacity and current stock
  - Linked to warehouses

- **Categories** (3 categories)
  - Finished Goods, Raw Material, Components

- **Suppliers** (3 suppliers)
  - Vendor ABC, Supplier XYZ, Industrial Supplies Co

- **Customers** (3 customers)
  - Customer ABC Corp, XYZ Industries, Global Manufacturing Ltd

### 🔄 Mock API Behavior

The mock API:
- ✅ Returns data matching exact API response structures
- ✅ Simulates network delays (500ms)
- ✅ Supports filtering and search
- ✅ Supports CRUD operations (Create, Read, Update, Delete)
- ✅ Updates mock data in memory (persists during session)
- ✅ Returns proper error responses for invalid IDs

### 📝 How It Works

1. **Automatic Detection:**
   - If `VITE_USE_MOCK_API=true` → Uses mock data
   - If `VITE_API_BASE_URL` is not set → Uses mock data
   - Otherwise → Uses real API

2. **Data Persistence:**
   - Mock data is stored in memory
   - Changes persist during the session
   - Refreshing the page resets to initial mock data

3. **Realistic Behavior:**
   - Network delays simulate real API calls
   - Error handling for invalid operations
   - Proper response structures

## 🧪 Testing Scenarios

### Test Creating a Product
1. Go to `/products/create`
2. Fill in the form
3. Submit
4. Product will be added to the mock data
5. You'll see it in the products list

### Test Receipt Workflow
1. Create a receipt at `/receipts/create`
2. View it at `/receipts/:id`
3. Receive stock at `/receipts/:id/receive`
4. Status will update to "done"

### Test Filtering
1. Go to Dashboard
2. Use filters (Document Type, Status, Warehouse, Category)
3. Data will be filtered in real-time

### Test Search
1. Go to Products list
2. Search for "Steel" or "Bolt"
3. Results will filter based on name or SKU

## 🔧 Customizing Mock Data

To add more mock data, edit `src/services/mockData.ts`:

```typescript
export const mockProducts: ProductsListResponse = {
  success: true,
  products: [
    // Add more products here
    {
      id: 6,
      name: 'Your New Product',
      sku: 'YNP-001',
      // ... other fields
    },
  ],
  // ...
}
```

## 🚨 Important Notes

1. **Data Resets:** Mock data resets when you refresh the page
2. **No Persistence:** Changes are not saved to a database
3. **Session Only:** Data persists only during the browser session
4. **Exact API Match:** All mock responses match the exact API contract structure

## 🔄 Switching Between Mock and Real API

### During Development (Mock)
```env
VITE_USE_MOCK_API=true
```

### When Backend is Ready (Real API)
```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### No Configuration Needed
If you don't set `VITE_USE_MOCK_API`, it will:
- Use mock data if `VITE_API_BASE_URL` is not set
- Use real API if `VITE_API_BASE_URL` is set

## ✅ Benefits

1. **Full Frontend Testing:** Test all features without backend
2. **UI/UX Development:** Work on design and user experience
3. **Demo Ready:** Show the application to stakeholders
4. **No Dependencies:** No need to wait for backend completion
5. **Exact API Match:** Mock data matches real API structure exactly

## 🎉 You're All Set!

The frontend is now ready to run with mock data. Just set `VITE_USE_MOCK_API=true` in your `.env` file and start developing!

