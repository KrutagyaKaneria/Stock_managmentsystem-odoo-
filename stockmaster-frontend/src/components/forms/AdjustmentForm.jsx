import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

export default function AdjustmentForm({ products, warehouses, locations, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    reference: `ADJ-${Date.now()}`,
    warehouseId: '',
    locationId: '',
    reason: 'other',
    description: '',
    lines: [{ product_id: '', qtyCounted: 0, reason_code: 'inventory_loss' }]
  })

  const filteredLocations = locations.filter(
    l => l.warehouseId === formData.warehouseId || Number(l.warehouse_id) === Number(formData.warehouseId)
  )

  const reasonOptions = [
    { value: 'inventory_loss', label: 'Inventory Loss' },
    { value: 'damage', label: 'Damage' },
    { value: 'obsolete', label: 'Obsolete' },
    { value: 'correction', label: 'Correction' },
    { value: 'counting_discrepancy', label: 'Counting Discrepancy' },
    { value: 'other', label: 'Other' }
  ]

  function addLine() {
    setFormData({
      ...formData,
      lines: [...formData.lines, { product_id: '', qtyCounted: 0, reason_code: 'inventory_loss' }]
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
    
    if (!formData.warehouseId) {
      alert('Please select a warehouse')
      return
    }

    if (formData.lines.length === 0 || formData.lines.some(l => !l.product_id)) {
      alert('Please add at least one product')
      return
    }

    if (formData.lines.some(l => l.qtyCounted === 0)) {
      alert('Please enter non-zero quantities for all products')
      return
    }
    
    onSubmit({
      ...formData,
      warehouseId: Number(formData.warehouseId),
      locationId: formData.locationId ? Number(formData.locationId) : null
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
            value={formData.warehouseId}
            onChange={(e) => setFormData({ ...formData, warehouseId: Number(e.target.value), locationId: '' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          >
            <option value="">Select warehouse</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <select
            value={formData.locationId}
            onChange={(e) => setFormData({ ...formData, locationId: Number(e.target.value) || '' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            disabled={!formData.warehouseId}
          >
            <option value="">Select location (optional)</option>
            {filteredLocations.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
          <select
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          >
            {reasonOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            placeholder="Additional details..."
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Adjustment Lines</label>
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
                required
                value={line.qtyCounted}
                onChange={(e) => updateLine(index, 'qtyCounted', Number(e.target.value))}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                placeholder="Change"
              />
              <select
                value={line.reason_code}
                onChange={(e) => updateLine(index, 'reason_code', e.target.value)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
              >
                {reasonOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
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

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-xs text-amber-800">
          <strong>Note:</strong> Positive values increase stock, negative values decrease stock.
        </p>
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
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          Create Adjustment
        </button>
      </div>
    </form>
  )
}
