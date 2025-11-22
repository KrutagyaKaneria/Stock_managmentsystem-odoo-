import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, MapPin } from 'lucide-react'
import api from '../services/api'
import Modal from '../components/common/Modal'
import LocationForm from '../components/forms/LocationForm'
import { showToast } from '../utils/toast'

export default function Locations() {
  const [locations, setLocations] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [selectedWarehouse, setSelectedWarehouse] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [locRes, whRes] = await Promise.all([
        api.getLocations(),
        api.getWarehouses()
      ])
      setLocations(locRes.data.data || locRes.data)
      setWarehouses(whRes.data.data || whRes.data)
      setLoading(false)
    } catch (error) {
      showToast('Failed to load data', 'error')
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this location?')) return
    try {
      await api.deleteLocation(id)
      showToast('Location deleted', 'success')
      loadData()
    } catch (error) {
      showToast('Failed to delete', 'error')
    }
  }

  async function handleSubmit(data) {
    try {
      if (editing) {
        await api.updateLocation(editing.id, data)
        showToast('Location updated', 'success')
      } else {
        await api.createLocation(data)
        showToast('Location created', 'success')
      }
      setShowModal(false)
      loadData()
    } catch (error) {
      showToast('Operation failed', 'error')
    }
  }

  const filteredLocations = selectedWarehouse
    ? locations.filter(l => l.warehouse_id === Number(selectedWarehouse) || l.warehouseId === Number(selectedWarehouse))
    : locations

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Locations</h1>
          <p className="text-sm text-gray-600 mt-1">{filteredLocations.length} locations</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <select
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
        >
          <option value="">All Warehouses</option>
          {warehouses.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Warehouse</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Stock Items</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredLocations.map(loc => (
              <tr key={loc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">{loc.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{loc.code || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{loc.warehouse_name || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{loc.stock?.length || 0}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => { setEditing(loc); setShowModal(true); }}
                    className="text-purple-600 hover:text-purple-800 mr-3"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(loc.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal
          title={editing ? 'Edit Location' : 'Create Location'}
          onClose={() => setShowModal(false)}
        >
          <LocationForm
            location={editing}
            warehouses={warehouses}
            onSubmit={handleSubmit}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  )
}
