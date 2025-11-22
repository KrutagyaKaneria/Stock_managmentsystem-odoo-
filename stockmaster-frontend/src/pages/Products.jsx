import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Download } from 'lucide-react'
import api from '../services/api'
import Modal from '../components/common/Modal'
import ProductForm from '../components/forms/ProductForm'
import { showToast } from '../utils/toast'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      const res = await api.getProducts()
      setProducts(res.data.data || res.data)
      setLoading(false)
    } catch (error) {
      showToast('Failed to load products', 'error')
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    try {
      await api.deleteProduct(id)
      showToast('Product deleted', 'success')
      loadProducts()
    } catch (error) {
      showToast('Failed to delete product', 'error')
    }
  }

  function handleEdit(product) {
    setEditingProduct(product)
    setShowModal(true)
  }

  function handleCreate() {
    setEditingProduct(null)
    setShowModal(true)
  }

  async function handleSubmit(data) {
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, data)
        showToast('Product updated', 'success')
      } else {
        await api.createProduct(data)
        showToast('Product created', 'success')
      }
      setShowModal(false)
      loadProducts()
    } catch (error) {
      showToast('Operation failed', 'error')
    }
  }

  const exportCSV = () => {
    const csv = [
      ['ID', 'SKU', 'Name', 'UOM', 'Reorder Level', 'Current Stock'],
      ...filteredProducts.map(p => [
        p.id,
        p.sku,
        p.name,
        p.uom,
        p.reorderLevel || 0,
        calculateStock(p)
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'products.csv'
    a.click()
  }

  function calculateStock(product) {
    if (!product.stockRecords) return 0
    return product.stockRecords.reduce((sum, rec) => sum + Number(rec.quantity), 0)
  }

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>

  return (
    <div className="space-y-4">
      {/* Odoo-style Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-600 mt-1">{filteredProducts.length} products</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create
        </button>
      </div>

      {/* Odoo-style Control Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          />
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Odoo-style Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">UOM</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reorder Level</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map(product => {
              const stock = calculateStock(product)
              const isLowStock = product.reorderLevel && stock < product.reorderLevel
              
              return (
                <tr key={product.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{product.sku}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    {product.category && (
                      <div className="text-xs text-gray-500">{product.category.name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.uom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.reorderLevel || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-semibold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                      {stock} {product.uom}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-purple-600 hover:text-purple-800 mr-3"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          title={editingProduct ? 'Edit Product' : 'Create Product'}
          onClose={() => setShowModal(false)}
        >
          <ProductForm
            product={editingProduct}
            onSubmit={handleSubmit}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  )
}