import { useState, useEffect } from 'react'
import { Plus, CheckCircle, Trash2, Search } from 'lucide-react'
import api from '../services/api'
import Modal from '../components/common/Modal'
import DeliveryForm from '../components/forms/DeliveryForm'
import ValidateDeliveryForm from '../components/forms/ValidateDeliveryForm'
import { showToast } from '../utils/toast'

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([])
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showValidateModal, setShowValidateModal] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const res = await api.getDeliveries()
      setDeliveries(Array.isArray(res.data) ? res.data : (res.data?.data || []))
      
      const prodRes = await api.getProducts()
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data?.data || []))
      
      const whRes = await api.getWarehouses()
      setWarehouses(Array.isArray(whRes.data) ? whRes.data : (whRes.data?.data || []))
      
      const locRes = await api.getLocations()
      setLocations(Array.isArray(locRes.data) ? locRes.data : (locRes.data?.data || []))
      
      setLoading(false)
    } catch (error) {
      console.error('API Error:', error)
      showToast('Failed to load data', 'error')
      setLoading(false)
    }
  }

  async function handleCreate(data) {
    try {
      await api.createDelivery(data)
      showToast('Delivery created', 'success')
      setShowCreateModal(false)
      loadData()
    } catch (error) {
      showToast('Failed to create delivery', 'error')
    }
  }

  async function handleValidate(data) {
    try {
      await api.validateDelivery(selectedDelivery.id, data)
      showToast('Delivery validated successfully', 'success')
      setShowValidateModal(false)
      loadData()
    } catch (error) {
      showToast('Failed to validate delivery', 'error')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this delivery?')) return
    try {
      await api.deleteDelivery(id)
      showToast('Delivery deleted', 'success')
      loadData()
    } catch (error) {
      showToast('Failed to delete', 'error')
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      confirmed: 'bg-blue-100 text-blue-800',
      done: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || styles.draft}`}>
        {status?.toUpperCase() || 'DRAFT'}
      </span>
    )
  }

  const filteredDeliveries = deliveries.filter(d =>
    d.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id?.toString().includes(searchTerm)
  )

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Deliveries</h1>
          <p className="text-sm text-gray-600 mt-1">Outgoing goods to customers</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create Delivery
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Warehouse</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Lines</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Created</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDeliveries.length > 0 ? (
              filteredDeliveries.map(delivery => (
                <tr key={delivery.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <span className="font-medium text-blue-600">{delivery.reference}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {warehouses.find(w => w.id === delivery.warehouse_id)?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(delivery.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{delivery.lines?.length || 0} items</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(delivery.created_at || delivery.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    {delivery.status === 'draft' && (
                      <>
                        <button
                          onClick={() => { setSelectedDelivery(delivery); setShowValidateModal(true); }}
                          className="text-blue-600 hover:text-blue-800 inline-block"
                          title="Validate"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(delivery.id)}
                          className="text-red-600 hover:text-red-800 inline-block"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {delivery.status !== 'draft' && delivery.status !== 'done' && (
                      <button
                        onClick={() => { setSelectedDelivery(delivery); setShowValidateModal(true); }}
                        className="text-green-600 hover:text-green-800 inline-block"
                        title="Complete"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No deliveries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <Modal title="Create Delivery" onClose={() => setShowCreateModal(false)} size="lg">
          <DeliveryForm
            products={products}
            warehouses={warehouses}
            locations={locations}
            onSubmit={handleCreate}
            onCancel={() => setShowCreateModal(false)}
          />
        </Modal>
      )}

      {showValidateModal && selectedDelivery && (
        <Modal title={`Validate: ${selectedDelivery.reference}`} onClose={() => setShowValidateModal(false)} size="lg">
          <ValidateDeliveryForm
            delivery={selectedDelivery}
            onSubmit={handleValidate}
            onCancel={() => setShowValidateModal(false)}
          />
        </Modal>
      )}
    </div>
  )
}
