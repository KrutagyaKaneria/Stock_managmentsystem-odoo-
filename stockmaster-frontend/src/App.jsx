import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Warehouses from './pages/Warehouses'
import Locations from './pages/Locations'
import Receipts from './pages/Receipts'
import Deliveries from './pages/Deliveries'
import Transfers from './pages/Transfers'
import Adjustments from './pages/Adjustments'
import StockMoves from './pages/StockMoves'
import Login from './pages/Login'
import VerifyOTP from './pages/VerifyOTP'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="warehouses" element={<Warehouses />} />
            <Route path="locations" element={<Locations />} />
            <Route path="receipts" element={<Receipts />} />
            <Route path="deliveries" element={<Deliveries />} />
            <Route path="transfers" element={<Transfers />} />
            <Route path="adjustments" element={<Adjustments />} />
            <Route path="stock-moves" element={<StockMoves />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App