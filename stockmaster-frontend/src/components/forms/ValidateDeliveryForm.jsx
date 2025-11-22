import { useState } from 'react'

export default function ValidateDeliveryForm({ delivery, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    deliveredBy: 'Admin',
    notes: '',
    lines: (delivery.lines || []).map(l => ({
      product_id: l.product_id || l.productId,
      qtyDelivered: l.qty_demanded || l.qtyDemanded || l.qtyOrdered || 0,
      uom: l.uom || 'pcs'
    }))
  })

  function updateLine(index, qty) {
    const newLines = [...formData.lines]
    newLines[index].qtyDelivered = Number(qty)
    setFormData({ ...formData, lines: newLines })
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Delivery:</strong> {delivery.reference}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Delivered By</label>
        <input
          type="text"
          value={formData.deliveredBy}
          onChange={(e) => setFormData({ ...formData, deliveredBy: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Products to Deliver</label>
        <div className="space-y-2">
          {formData.lines.map((line, index) => {
            const deliveryLine = delivery.lines[index]
            return (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{deliveryLine.product_name || 'Product'}</p>
                  <p className="text-xs text-gray-600">Demanded: {deliveryLine.qty_demanded}</p>
                </div>
                <input
                  type="number"
                  min="0"
                  required
                  value={line.qtyDelivered}
                  onChange={(e) => updateLine(index, e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                />
                <span className="text-sm text-gray-600">{line.uom}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          rows="3"
          placeholder="Any notes about this delivery..."
        />
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
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Validate & Complete
        </button>
      </div>
    </form>
  )
}
