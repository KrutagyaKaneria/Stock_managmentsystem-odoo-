import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, MapPin } from 'lucide-react'
import api from '../services/api'
import Modal from '../components/common/Modal'
import WarehouseForm from '../components/forms/WarehouseForm'
import { showToast } from '../utils/toast'

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    loadWarehouses()
  }, [])

  async function loadWarehouses() {
    try {
      const res = await api.getWarehouses()
      setWarehouses(res.data.data || res.data)
      setLoading(false)
    } catch (error) {
      showToast('Failed to load warehouses', 'error')
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this warehouse?')) return
    try {
      await api.deleteWarehouse(id)
      showToast('Warehouse deleted', 'success')
      loadWarehouses()
    } catch (error) {
      showToast('Failed to delete', 'error')
    }
  }

  async function handleSubmit(data) {
    try {
      if (editing) {
        await api.updateWarehouse(editing.id, data)
        showToast('Warehouse updated', 'success')
      } else {
        await api.createWarehouse(data)
        showToast('Warehouse created', 'success')
      }
      setShowModal(false)
      loadWarehouses()
    } catch (error) {
      showToast('Operation failed', 'error')
    }
  }

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Warehouses</h1>
          <p className="text-sm text-gray-600 mt-1">{warehouses.length} locations</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouses.map(warehouse => (
          <div key={warehouse.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{warehouse.name}</h3>
                  <p className="text-xs text-gray-500">{warehouse.locationCode || warehouse.location_code || 'No code'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditing(warehouse); setShowModal(true); }}
                  className="text-purple-600 hover:text-purple-800"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(warehouse.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Locations:</span>
                <span className="font-semibold">{warehouse.locations?.length || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal
          title={editing ? 'Edit Warehouse' : 'Create Warehouse'}
          onClose={() => setShowModal(false)}
        >
          <WarehouseForm
            warehouse={editing}
            onSubmit={handleSubmit}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  )
}