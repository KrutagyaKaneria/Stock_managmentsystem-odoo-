import { Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import { TooltipProvider } from "@radix-ui/react-tooltip"
import { Toaster } from "sonner"
import { Sidebar } from "@/components/Sidebar"
import { Header } from "@/components/Header"
import { MockModeIndicator } from "@/components/MockModeIndicator"

// Pages
import Dashboard from "@/pages/Dashboard"
import { ProductsList } from "@/pages/ProductsList"
import { ProductForm } from "@/pages/ProductForm"
import { ProductDetails } from "@/pages/ProductDetails"
import { ReceiptsList } from "@/pages/ReceiptsList"
import { ReceiptForm } from "@/pages/ReceiptForm"
import { ReceiptDetails } from "@/pages/ReceiptDetails"
import { ReceiptEdit } from "@/pages/ReceiptEdit"
import { ReceiveStock } from "@/pages/ReceiveStock"
import { DeliveriesList } from "@/pages/DeliveriesList"
import { DeliveryForm } from "@/pages/DeliveryForm"
import { DeliveryDetails } from "@/pages/DeliveryDetails"
import { DeliveryEdit } from "@/pages/DeliveryEdit"
import { PickDelivery } from "@/pages/PickDelivery"
import { ValidateDelivery } from "@/pages/ValidateDelivery"
import { TransfersList } from "@/pages/TransfersList"
import { TransferForm } from "@/pages/TransferForm"
import { TransferDetails } from "@/pages/TransferDetails"
import { TransferEdit } from "@/pages/TransferEdit"
import { ValidateTransfer } from "@/pages/ValidateTransfer"
import { AdjustmentsList } from "@/pages/AdjustmentsList"
import { AdjustmentForm } from "@/pages/AdjustmentForm"
import { AdjustmentDetails } from "@/pages/AdjustmentDetails"
import { AdjustmentEdit } from "@/pages/AdjustmentEdit"
import { StockHistoryPage } from "@/pages/StockHistory"
import { SettingsPage } from "@/pages/Settings"
import { Profile } from "@/pages/Profile"

function App() {
  return (
    <ThemeProvider defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <div className="relative flex min-h-screen bg-background">
          <Sidebar />
          <div className="flex-1">
            <Header />
            <main className="p-4 pt-20 sm:p-6 md:p-8 lg:pt-24 transition-all duration-300">
              <div className="mx-auto max-w-7xl">
                <Routes>
                  {/* Redirect root to /inventory */}
                  <Route path="/" element={<Navigate to="/inventory" replace />} />
                  
                  {/* Main inventory routes with /inventory prefix */}
                  <Route path="/inventory">
                    <Route index element={<Dashboard />} />
                    
                    {/* Products */}
                    <Route path="products">
                      <Route index element={<ProductsList />} />
                      <Route path="create" element={<ProductForm />} />
                      <Route path=":id" element={<ProductDetails />} />
                      <Route path=":id/edit" element={<ProductForm />} />
                    </Route>
                    
                    {/* Categories */}
                    <Route path="categories">
                      <Route index element={<CategoriesList />} />
                      <Route path="create" element={<CategoryForm />} />
                      <Route path=":id" element={<CategoryDetails />} />
                      <Route path=":id/edit" element={<CategoryForm />} />
                    </Route>
                    
                    {/* Receipts */}
                    <Route path="receipts">
                      <Route index element={<ReceiptsList />} />
                      <Route path="create" element={<ReceiptForm />} />
                      <Route path=":id" element={<ReceiptDetails />} />
                      <Route path=":id/edit" element={<ReceiptEdit />} />
                    </Route>
                    
                    <Route path="receive-stock" element={<ReceiveStock />} />
                    
                    {/* Deliveries */}
                    <Route path="deliveries">
                      <Route index element={<DeliveriesList />} />
                      <Route path="create" element={<DeliveryForm />} />
                      <Route path=":id" element={<DeliveryDetails />} />
                      <Route path=":id/edit" element={<DeliveryEdit />} />
                      <Route path="pick" element={<PickDelivery />} />
                      <Route path="validate" element={<ValidateDelivery />} />
                    </Route>
                    
                    {/* Transfers */}
                    <Route path="transfers">
                      <Route index element={<TransfersList />} />
                      <Route path="create" element={<TransferForm />} />
                      <Route path=":id" element={<TransferDetails />} />
                      <Route path=":id/edit" element={<TransferEdit />} />
                      <Route path="validate" element={<ValidateTransfer />} />
                    </Route>
                    
                    {/* Adjustments */}
                    <Route path="adjustments">
                      <Route index element={<AdjustmentsList />} />
                      <Route path="create" element={<AdjustmentForm />} />
                      <Route path=":id" element={<AdjustmentDetails />} />
                      <Route path=":id/edit" element={<AdjustmentEdit />} />
                    </Route>
                    
                    <Route path="stock-history" element={<StockHistoryPage />} />
                  </Route>
                  
                  {/* Redirect old routes to their new /inventory prefixed versions */}
                  <Route path="/products" element={<Navigate to="/inventory/products" replace />} />
                  <Route path="/categories" element={<Navigate to="/inventory/categories" replace />} />
                  <Route path="/receipts" element={<Navigate to="/inventory/receipts" replace />} />
                  <Route path="/deliveries" element={<Navigate to="/inventory/deliveries" replace />} />
                  <Route path="/transfers" element={<Navigate to="/inventory/transfers" replace />} />
                  <Route path="/adjustments" element={<Navigate to="/inventory/adjustments" replace />} />
                  
                  {/* Non-inventory routes */}
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/profile" element={<Profile />} />
                  
                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/inventory" replace />} />
                </Routes>
              </div>
            </main>
          </div>
          <Toaster position="top-right" richColors closeButton />
          <MockModeIndicator />
        </div>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App