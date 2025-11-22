import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, Warehouse, MapPin, TruckIcon, PackageCheck, Repeat, ClipboardList, History } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/warehouses', icon: Warehouse, label: 'Warehouses' },
  { to: '/locations', icon: MapPin, label: 'Locations' },
  { to: '/receipts', icon: TruckIcon, label: 'Receipts' },
  { to: '/deliveries', icon: PackageCheck, label: 'Deliveries' },
  { to: '/transfers', icon: Repeat, label: 'Transfers' },
  { to: '/adjustments', icon: ClipboardList, label: 'Adjustments' },
  { to: '/stock-moves', icon: History, label: 'Stock Ledger' }
]

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">StockMaster</h1>
        <p className="text-sm text-gray-400 mt-1">Inventory System</p>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}