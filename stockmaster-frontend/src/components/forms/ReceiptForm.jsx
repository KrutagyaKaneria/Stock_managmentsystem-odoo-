import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

export default function ReceiptForm({ products, warehouses, locations, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    reference: `REC-${Date.now()}`,
    supplier_id: null,
    warehouse_id: '',
    location_id: '',
    lines: [{ product_id: '', qty_expected: 1, uom: 'pcs' }]
  })

  const filteredLocations = locations.filter(
    l => l.warehouse_id === formData.warehouse_id || l.warehouseId === formData.warehouse_id
  )

  function addLine() {
    setFormData({
      ...formData,
      lines: [...formData.lines, { product_id: '', qty_expected: 1, uom: 'pcs' }]
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
    onSubmit({
      ...formData,
      warehouse_id: Number(formData.warehouse_id),
      location_id: Number(formData.location_id)
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse *</label>
          <select
            required
            value={formData.warehouse_id}
            onChange={(e) => setFormData({ ...formData, warehouse_id: Number(e.target.value), location_id: '' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          >
            <option value="">Select warehouse</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
          <select
            required
            value={formData.location_id}
            onChange={(e) => setFormData({ ...formData, location_id: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            disabled={!formData.warehouse_id}
          >
            <option value="">Select location</option>
            {filteredLocations.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Receipt Lines</label>
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
                value={line.qty_expected}
                onChange={(e) => updateLine(index, 'qty_expected', Number(e.target.value))}
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
          Create Receipt
        </button>
      </div>
    </form>
  )
}