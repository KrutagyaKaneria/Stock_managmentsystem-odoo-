import { Bell, User } from 'lucide-react'

export default function Topbar() {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex-1">
        <input
          type="search"
          placeholder="Search products, SKU..."
          className="px-4 py-2 border border-gray-300 rounded-lg w-96 focus:outline-none focus:border-blue-500"
        />
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
            <User className="w-4 h-4" />
          </div>
          <span className="font-medium">Admin</span>
        </button>
      </div>
    </div>
  )
}