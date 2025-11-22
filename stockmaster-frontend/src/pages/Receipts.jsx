import { useState, useEffect } from 'react'
import { Plus, CheckCircle, Trash2 } from 'lucide-react'
import api from '../services/api'
import Modal from '../components/common/Modal'
import ReceiptForm from '../components/forms/ReceiptForm'
import ReceiveForm from '../components/forms/ReceiveForm'
import { showToast } from '../utils/toast'

export default function Receipts() {
  const [receipts, setReceipts] = useState([])
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [recRes, prodRes, whRes, locRes] = await Promise.all([
        api.getReceipts(),
        api.getProducts(),
        api.getWarehouses(),
        api.getLocations()
      ])
      setReceipts(recRes.data.data || recRes.data)
      setProducts(prodRes.data.data || prodRes.data)
      setWarehouses(whRes.data.data || whRes.data)
      setLocations(locRes.data.data || locRes.data)
      setLoading(false)
    } catch (error) {
      showToast('Failed to load data', 'error')
      setLoading(false)
    }
  }

  async function handleCreate(data) {
    try {
      await api.createReceipt(data)
      showToast('Receipt created', 'success')
      setShowCreateModal(false)
      loadData()
    } catch (error) {
      showToast('Failed to create receipt', 'error')
    }
  }

  async function handleReceive(data) {
    try {
      await api.receiveReceipt(selectedReceipt.id, data)
      showToast('Receipt validated successfully', 'success')
      setShowReceiveModal(false)
      loadData()
    } catch (error) {
      showToast('Failed to receive', 'error')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this receipt?')) return
    try {
      await api.deleteReceipt(id)
      showToast('Receipt deleted', 'success')
      loadData()
    } catch (error) {
      showToast('Failed to delete', 'error')
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      done: 'bg-green-100 text-green-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || styles.draft}`}>
        {status?.toUpperCase()}
      </span>
    )
  }

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Receipts</h1>
          <p className="text-sm text-gray-600 mt-1">Incoming goods</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create Receipt
        </button>
      </div>

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
            {receipts.map(receipt => (
              <tr key={receipt.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <span className="font-medium text-purple-600">{receipt.reference}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {warehouses.find(w => w.id === receipt.warehouse_id)?.name || 'N/A'}
                </td>
                <td className="px-6 py-4">{getStatusBadge(receipt.status)}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{receipt.lines?.length || 0} items</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(receipt.created_at || receipt.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  {receipt.status === 'draft' && (
                    <button
                      onClick={() => { setSelectedReceipt(receipt); setShowReceiveModal(true); }}
                      className="text-green-600 hover:text-green-800 mr-3"
                      title="Receive"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                  {receipt.status === 'draft' && (
                    <button
                      onClick={() => handleDelete(receipt.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <Modal title="Create Receipt" onClose={() => setShowCreateModal(false)}>
          <ReceiptForm
            products={products}
            warehouses={warehouses}
            locations={locations}
            onSubmit={handleCreate}
            onCancel={() => setShowCreateModal(false)}
          />
        </Modal>
      )}

      {showReceiveModal && selectedReceipt && (
        <Modal title={`Receive: ${selectedReceipt.reference}`} onClose={() => setShowReceiveModal(false)}>
          <ReceiveForm
            receipt={selectedReceipt}
            onSubmit={handleReceive}
            onCancel={() => setShowReceiveModal(false)}
          />
        </Modal>
      )}
    </div>
  )
}