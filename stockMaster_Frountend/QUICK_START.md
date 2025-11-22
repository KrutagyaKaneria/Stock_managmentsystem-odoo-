# 🚀 Quick Start Guide - StockMaster Frontend

## Run with Mock Data (No Backend Needed!)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create `.env` File
Create a file named `.env` in the root directory with:
```env
VITE_USE_MOCK_API=true
```

### Step 3: Start the App
```bash
npm run dev
```

### Step 4: Open Browser
Navigate to: `http://localhost:5173`

**That's it!** The app is now running with full mock data. You can:
- ✅ Browse all pages
- ✅ Create products, receipts, deliveries, etc.
- ✅ Test all workflows
- ✅ See realistic data throughout the app

## 🎯 What You Can Test

### Dashboard
- View KPIs (Total Stock, Low Stock, Pending Receipts, etc.)
- See recent stock moves
- View low stock alerts
- Use filters

### Products
- View product list (5 sample products)
- Create new products
- Edit products
- View product details with stock by location
- Delete products

### Receipts
- View receipt list (3 sample receipts)
- Create new receipts
- Add product lines
- Receive stock with variance tracking
- Edit and delete receipts

### Deliveries
- View delivery list (2 sample deliveries)
- Create new deliveries
- Pick items
- Validate deliveries
- Edit and delete deliveries

### Transfers
- View transfer list
- Create transfers between locations
- Validate transfers
- Edit and delete transfers

### Adjustments
- View adjustment list
- Create adjustments with system/counted quantities
- See variance calculations
- Edit and delete adjustments

### Stock History
- View all stock movements
- Filter by type, product, warehouse, date range
- See color-coded quantities

### Settings
- View warehouses (2 sample warehouses)
- Create new warehouses
- View locations (3 sample locations)
- Create new locations

## 🔄 Switching to Real API

When your backend is ready:

1. Update `.env`:
```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

2. Restart the dev server:
```bash
npm run dev
```

The app will automatically switch to using the real API!

## 📝 Notes

- **Mock data persists during session** - Changes you make will be visible until you refresh
- **Data resets on refresh** - Refreshing the page resets to initial mock data
- **All features work** - Every feature is fully functional with mock data
- **Exact API match** - Mock responses match the real API structure exactly

## 🎉 Enjoy Testing!

The entire application is ready to use with realistic mock data. Perfect for:
- UI/UX development
- Feature testing
- Stakeholder demos
- Frontend development before backend is ready

