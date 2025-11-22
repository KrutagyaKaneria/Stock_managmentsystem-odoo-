import { useState } from 'react'
import { Plus, Trash2, ArrowRight } from 'lucide-react'

export default function TransferForm({ products, warehouses, locations, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    reference: `TRN-${Date.now()}`,
    fromWarehouseId: '',
    toWarehouseId: '',
    fromLocationId: '',
    toLocationId: '',
    lines: [{ product_id: '', qty: 1, uom: 'pcs' }]
  })

  const sourceLocations = locations.filter(
    l => l.warehouseId === formData.fromWarehouseId || Number(l.warehouse_id) === Number(formData.fromWarehouseId)
  )

  const destLocations = locations.filter(
    l => l.warehouseId === formData.toWarehouseId || Number(l.warehouse_id) === Number(formData.toWarehouseId)
  )

  function addLine() {
    setFormData({
      ...formData,
      lines: [...formData.lines, { product_id: '', qty: 1, uom: 'pcs' }]
    })
  }

  function removeLine(index) {
    setFormData({
      ...formData,
      lines: formData.lines.filter((_, i) => i !== index)
    })
  }

  function updateLine(index, field, value) {
    const newLines = [...formData.lines]
    newLines[index][field] = value
    setFormData({ ...formData, lines: newLines })
  }

  function handleSubmit(e) {
    e.preventDefault()
    
    if (!formData.fromWarehouseId || !formData.toWarehouseId) {
      alert('Please select source and destination warehouses')
      return
    }
    
    if (formData.fromWarehouseId === formData.toWarehouseId) {
      alert('Source and destination warehouses cannot be the same')
      return
    }

    if (formData.lines.length === 0 || formData.lines.some(l => !l.product_id)) {
      alert('Please add at least one product')
      return
    }
    
    onSubmit({
      ...formData,
      fromWarehouseId: Number(formData.fromWarehouseId),
      toWarehouseId: Number(formData.toWarehouseId),
      fromLocationId: formData.fromLocationId ? Number(formData.fromLocationId) : null,
      toLocationId: formData.toLocationId ? Number(formData.toLocationId) : null
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
        <input
          type="text"
          value={formData.reference}
          onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
        />
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="grid grid-cols-5 gap-3 items-center">
          {/* Source Warehouse */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">From Warehouse *</label>
            <select
              required
              value={formData.fromWarehouseId}
              onChange={(e) => setFormData({ ...formData, fromWarehouseId: Number(e.target.value), fromLocationId: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
            >
              <option value="">Select</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          {/* Source Location */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">From Location</label>
            <select
              value={formData.fromLocationId}
              onChange={(e) => setFormData({ ...formData, fromLocationId: Number(e.target.value) || '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
              disabled={!formData.fromWarehouseId}
            >
              <option value="">Optional</option>
              {sourceLocations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Arrow Icon */}
          <div className="flex justify-center pt-6">
            <ArrowRight className="w-5 h-5 text-purple-600" />
          </div>

          {/* Destination Warehouse */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">To Warehouse *</label>
            <select
              required
              value={formData.toWarehouseId}
              onChange={(e) => setFormData({ ...formData, toWarehouseId: Number(e.target.value), toLocationId: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
            >
              <option value="">Select</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          {/* Destination Location */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">To Location</label>
            <select
              value={formData.toLocationId}
              onChange={(e) => setFormData({ ...formData, toLocationId: Number(e.target.value) || '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
              disabled={!formData.toWarehouseId}
            >
              <option value="">Optional</option>
              {destLocations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Transfer Lines</label>
          <button
            type="button"
            onClick={addLine}
            className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
          >
            <Plus className="w-4 h-4" /> Add Line
          </button>
        </div>

        <div className="space-y-2">
          {formData.lines.map((line, index) => (
            <div key={index} className="flex gap-2 items-center">
              <select
                required
                value={line.product_id}
                onChange={(e) => updateLine(index, 'product_id', Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              >
                <option value="">Select product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                required
                value={line.qty}
                onChange={(e) => updateLine(index, 'qty', Number(e.target.value))}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                placeholder="Qty"
              />
              <input
                type="text"
                value={line.uom}
                onChange={(e) => updateLine(index, 'uom', e.target.value)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                placeholder="UOM"
              />
              {formData.lines.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLine(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Create Transfer
        </button>
      </div>
    </form>
  )
}
