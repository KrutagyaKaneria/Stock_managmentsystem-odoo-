import { useState, useEffect } from 'react'
import { Plus, CheckCircle, Trash2, Search, ArrowRight } from 'lucide-react'
import api from '../services/api'
import Modal from '../components/common/Modal'
import TransferForm from '../components/forms/TransferForm'
import { showToast } from '../utils/toast'

export default function Transfers() {
  const [transfers, setTransfers] = useState([])
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const res = await api.getTransfers()
      setTransfers(Array.isArray(res.data) ? res.data : (res.data?.data || []))
      
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
      await api.createTransfer(data)
      showToast('Transfer created', 'success')
      setShowCreateModal(false)
      loadData()
    } catch (error) {
      showToast('Failed to create transfer', 'error')
    }
  }

  async function handleValidate(id) {
    if (!confirm('Validate and complete this transfer?')) return
    try {
      await api.validateTransfer(id, {})
      showToast('Transfer validated', 'success')
      loadData()
    } catch (error) {
      showToast('Failed to validate transfer', 'error')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this transfer?')) return
    try {
      await api.deleteTransfer(id)
      showToast('Transfer deleted', 'success')
      loadData()
    } catch (error) {
      showToast('Failed to delete', 'error')
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      confirmed: 'bg-orange-100 text-orange-800',
      done: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || styles.draft}`}>
        {status?.toUpperCase() || 'DRAFT'}
      </span>
    )
  }

  const filteredTransfers = transfers.filter(t =>
    t.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id?.toString().includes(searchTerm)
  )

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Stock Transfers</h1>
          <p className="text-sm text-gray-600 mt-1">Warehouse to warehouse stock movements</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create Transfer
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">From Warehouse</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase w-12"></th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">To Warehouse</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Lines</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Created</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransfers.length > 0 ? (
                filteredTransfers.map(transfer => (
                  <tr key={transfer.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="font-medium text-purple-600">{transfer.reference}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="font-medium">{warehouses.find(w => w.id === transfer.source_warehouse_id)?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ArrowRight className="w-5 h-5 text-gray-400 inline" />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="font-medium">{warehouses.find(w => w.id === transfer.destination_warehouse_id)?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(transfer.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{transfer.lines?.length || 0} items</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(transfer.created_at || transfer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      {transfer.status === 'draft' && (
                        <>
                          <button
                            onClick={() => handleValidate(transfer.id)}
                            className="text-green-600 hover:text-green-800 inline-block"
                            title="Validate"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(transfer.id)}
                            className="text-red-600 hover:text-red-800 inline-block"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {transfer.status !== 'draft' && transfer.status !== 'done' && (
                        <button
                          onClick={() => handleValidate(transfer.id)}
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
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No transfers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <Modal title="Create Stock Transfer" onClose={() => setShowCreateModal(false)} size="lg">
          <TransferForm
            products={products}
            warehouses={warehouses}
            locations={locations}
            onSubmit={handleCreate}
            onCancel={() => setShowCreateModal(false)}
          />
        </Modal>
      )}
    </div>
  )
}
