# StockMaster Frontend - Quick Setup Guide

## Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)
- A running backend API (or mock API for development)

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```
   Replace with your actual backend API URL.

3. **Start development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173` (or the next available port).

4. **Build for production:**
   ```bash
   npm run build
   ```
   The production build will be in the `dist` folder.

## Project Structure Overview

```
Stock_master/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Base components (Button, Input, etc.)
│   │   ├── Sidebar.tsx   # Main navigation
│   │   ├── Header.tsx    # Top navigation bar
│   │   └── ...
│   ├── pages/            # Page components
│   │   ├── Dashboard.tsx
│   │   ├── ProductsList.tsx
│   │   └── ...
│   ├── services/         # API service layer
│   │   └── api.ts       # All API endpoints
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript types
│   ├── lib/             # Utilities
│   └── App.tsx          # Main app with routing
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Key Features Implemented

✅ **Complete UI Components**
- Sidebar navigation with collapsible menu
- Header with search and user menu
- Data tables with pagination
- Status badges
- KPI cards
- Forms with validation
- Modals
- Toast notifications

✅ **Pages**
- Dashboard with KPIs
- Products (List, Create, Edit)
- Receipts list
- Deliveries list
- Transfers list
- Adjustments list
- Stock history
- Settings (Warehouses, Locations)
- Profile

✅ **Features**
- Responsive design (mobile, tablet, desktop)
- Loading states with skeletons
- Error handling with toasts
- Empty states
- Search and filtering
- React Query for data fetching
- TypeScript for type safety

## API Integration

The frontend expects a REST API with the following endpoints:

- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/:id` - Get product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- Similar endpoints for receipts, deliveries, transfers, adjustments
- `GET /api/warehouses` - List warehouses
- `GET /api/locations` - List locations
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/stock-history` - Stock history

All API calls include authentication token from `localStorage.getItem('auth_token')`.

## Customization

### Colors
Edit `tailwind.config.js` to customize the color palette.

### API Base URL
Set `VITE_API_BASE_URL` in your `.env` file.

### Adding New Pages
1. Create a new component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation item in `src/components/Sidebar.tsx` if needed

## Development Tips

- Use React DevTools for debugging
- Check browser console for API errors
- Use React Query DevTools (optional) for query debugging
- All components are typed with TypeScript

## Troubleshooting

**Port already in use:**
- Vite will automatically use the next available port

**API connection errors:**
- Check `VITE_API_BASE_URL` in `.env`
- Ensure backend is running
- Check CORS settings on backend

**Build errors:**
- Run `npm install` again
- Clear `node_modules` and reinstall
- Check TypeScript errors with `npm run build`

## Next Steps

- Implement Receipt/Delivery/Transfer/Adjustment forms
- Add product detail view
- Implement advanced filtering
- Add export functionality
- Add charts to dashboard
- Implement authentication flow

