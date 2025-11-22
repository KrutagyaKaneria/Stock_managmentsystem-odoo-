import { useState } from 'react'

export default function ReceiveForm({ receipt, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    received_by: 'Admin',
    notes: '',
    lines: (receipt.lines || []).map(l => ({
      product_id: l.product_id || l.productId,
      qty_received: l.qty_expected || l.qtyExpected || 0,
      uom: l.uom || 'pcs'
    }))
  })

  function updateLine(index, qty) {
    const newLines = [...formData.lines]
    newLines[index].qty_received = Number(qty)
    setFormData({ ...formData, lines: newLines })
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-800">
          <strong>Receipt:</strong> {receipt.reference}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Received By</label>
        <input
          type="text"
          value={formData.received_by}
          onChange={(e) => setFormData({ ...formData, received_by: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Products to Receive</label>
        <div className="space-y-2">
          {formData.lines.map((line, index) => {
            const receiptLine = receipt.lines[index]
            return (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{receiptLine.product_name || 'Product'}</p>
                  <p className="text-xs text-gray-600">Expected: {receiptLine.qty_expected}</p>
                </div>
                <input
                  type="number"
                  min="0"
                  required
                  value={line.qty_received}
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
          placeholder="Any notes about this receipt..."
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
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Receive & Validate
        </button>
      </div>
    </form>
  )
}