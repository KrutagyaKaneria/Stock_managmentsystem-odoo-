# StockMaster - Inventory Management System Frontend

A modern, enterprise-grade React frontend for StockMaster Inventory Management System built with React, TypeScript, Tailwind CSS, and Shadcn UI components.

## 🚀 Quick Start with Mock Data

The frontend can run **completely standalone** with mock data - perfect for development and testing before the backend is ready!

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env` File
Create a `.env` file in the root directory:
```env
VITE_USE_MOCK_API=true
```

### 3. Start Development Server
```bash
npm run dev
```

The app will run at `http://localhost:5173` with **full mock data** - you can test all features!

## 🎯 Features

- **Modern UI/UX**: Clean, data-dense design inspired by Shopify Admin, Linear, and Notion
- **Responsive Design**: Fully responsive layout that works on desktop, tablet, and mobile
- **Complete Inventory Management**:
  - Product management (List, Create, Edit, Details)
  - Receipts tracking (Create, Receive Stock, Validate)
  - Deliveries management (Create, Pick, Validate)
  - Stock transfers (Create, Validate)
  - Inventory adjustments (Create with variance tracking)
  - Stock history with filters
- **Dashboard**: Real-time KPIs and statistics
- **Settings**: Warehouse and location management
- **User Profile**: Personal information and settings

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn UI** components (custom implementation)
- **React Router** for routing
- **React Query (TanStack Query)** for data fetching
- **Axios** for API calls
- **Lucide React** for icons

## 📦 Mock Data Mode

### Using Mock Data (Development)

Set in `.env`:
```env
VITE_USE_MOCK_API=true
```

**Benefits:**
- ✅ Test entire application without backend
- ✅ All features work with realistic dummy data
- ✅ Perfect for UI/UX development
- ✅ Demo-ready for stakeholders
- ✅ No API dependencies

### Using Real API (Production)

Set in `.env`:
```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base components (Button, Input, Card, etc.)
│   ├── Sidebar.tsx     # Main navigation
│   ├── Header.tsx       # Top navigation bar
│   ├── KPICard.tsx     # Dashboard KPI cards
│   ├── DataTable.tsx   # Reusable data table component
│   └── ...
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── ProductsList.tsx
│   ├── ProductForm.tsx
│   └── ...
├── services/           # API service layer
│   ├── api.ts         # API client (switches between mock/real)
│   ├── mockApi.ts     # Mock API implementation
│   └── mockData.ts    # Mock data
├── hooks/              # Custom React hooks
│   └── useToast.tsx   # Toast notification hook
├── types/              # TypeScript type definitions
│   └── index.ts
├── lib/                # Utility functions
│   └── utils.ts
└── App.tsx            # Main app component with routing
```

## 🎨 Design System

### Colors
- **Primary**: Indigo Blue (#4F46E5)
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Danger**: Red (#EF4444)
- **Neutral**: Slate Gray palette

### Typography
- Font: Inter (system font fallback)
- Clear hierarchy with large bold titles and readable body text

### Components
All components follow a consistent design pattern with:
- Soft, subtle shadows
- Consistent spacing (16px, 24px, 32px)
- Comfortable line heights
- Hover states and transitions

## 🔌 API Integration

### Mock Mode (Default)
When `VITE_USE_MOCK_API=true`, the app uses mock data that:
- Matches exact API response structures
- Supports all CRUD operations
- Includes realistic sample data
- Simulates network delays
- Persists changes during session

### Real API Mode
When backend is ready, set:
```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

The API service layer (`src/services/api.ts`) includes:
- Products API
- Warehouses API
- Locations API
- Receipts API
- Deliveries API
- Transfers API
- Adjustments API
- Stock History API
- Dashboard API

## 🧭 Routing

- `/` - Dashboard
- `/products` - Products list
- `/products/create` - Create product
- `/products/:id` - Product details
- `/products/:id/edit` - Edit product
- `/receipts` - Receipts list
- `/receipts/create` - Create receipt
- `/receipts/:id` - Receipt details
- `/receipts/:id/receive` - Receive stock
- `/deliveries` - Deliveries list
- `/deliveries/create` - Create delivery
- `/deliveries/:id/pick` - Pick items
- `/deliveries/:id/validate` - Validate delivery
- `/transfers` - Transfers list
- `/transfers/create` - Create transfer
- `/transfers/:id/validate` - Validate transfer
- `/adjustments` - Adjustments list
- `/adjustments/create` - Create adjustment
- `/stock-history` - Stock move history
- `/settings/warehouses` - Warehouse settings
- `/settings/locations` - Location settings
- `/profile` - User profile

## 🎯 Key Features

### Status Badges
- Draft (Gray)
- Waiting (Yellow/Amber)
- Ready (Blue)
- Done (Green)
- Canceled (Red)

### Data Tables
- Sortable columns
- Pagination
- Row actions (View, Edit, Delete)
- Loading states with skeletons
- Empty states

### Forms
- Two-column layout on desktop
- One-column on mobile
- Inline validation
- Required field indicators

### Modals
- Centered with backdrop blur
- Responsive max-width
- Close button

## 🔐 Authentication

The app expects an authentication token to be stored in `localStorage` with the key `auth_token`. The token is automatically included in API requests via Axios interceptors.

**Note:** In mock mode, authentication is bypassed.

## 📝 Development Notes

- All API calls use React Query for caching and state management
- Toast notifications are handled via a custom `useToast` hook
- The sidebar is collapsible on mobile devices
- All components are fully typed with TypeScript
- The codebase follows modern React patterns (hooks, functional components)
- Mock data mode allows full frontend development without backend

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📄 License

This project is part of the StockMaster Inventory Management System.
