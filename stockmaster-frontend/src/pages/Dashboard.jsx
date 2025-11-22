import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Package, Warehouse, TrendingUp, AlertTriangle } from 'lucide-react'
import api from '../services/api'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [recentMoves, setRecentMoves] = useState([])
  const [warehouseSummary, setWarehouseSummary] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [statsRes, lowRes, movesRes, whRes] = await Promise.all([
        api.getDashboardStats(),
        api.getLowStock(),
        api.getRecentMoves(),
        api.getWarehouseSummary()
      ])
      
      setStats(statsRes.data.data)
      setLowStock(lowRes.data.data || [])
      setRecentMoves(movesRes.data.data || [])
      setWarehouseSummary(whRes.data.data || [])
    } catch (error) {
      console.error('Dashboard load error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="animate-pulse">Loading...</div>

  const kpis = [
    { label: 'Total Products', value: stats?.total_products || 0, icon: Package, color: 'bg-blue-500' },
    { label: 'Warehouses', value: stats?.total_warehouses || 0, icon: Warehouse, color: 'bg-green-500' },
    { label: 'Stock Units', value: stats?.total_stock_units || 0, icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Low Stock', value: lowStock.length || 0, icon: AlertTriangle, color: 'bg-red-500' }
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{kpi.label}</p>
                <p className="text-3xl font-bold mt-2">{kpi.value}</p>
              </div>
              <div className={`${kpi.color} p-3 rounded-lg text-white`}>
                <kpi.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Warehouse Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Stock by Warehouse</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={warehouseSummary}
                dataKey="total_stock_units"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {warehouseSummary.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Movements</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {recentMoves.slice(0, 10).map(move => (
              <div key={move.id} className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">{move.product_name}</p>
                  <p className="text-sm text-gray-600">{move.type} - {move.reference}</p>
                </div>
                <span className="text-sm font-semibold">{move.quantity} {move.uom}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Table */}
      {lowStock.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">⚠️ Low Stock Alert</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lowStock.map(item => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-600 font-semibold">{item.current_stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.reorder_level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}