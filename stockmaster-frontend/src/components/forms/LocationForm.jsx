import { useState } from 'react'

export default function LocationForm({ location, warehouses, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    warehouse_id: location?.warehouse_id || location?.warehouseId || '',
    name: location?.name || '',
    code: location?.code || ''
  })

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse *</label>
        <select
          required
          value={formData.warehouse_id}
          onChange={(e) => setFormData({ ...formData, warehouse_id: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
        >
          <option value="">Select warehouse</option>
          {warehouses.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location Name *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          placeholder="e.g. Rack A1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location Code</label>
        <input
          type="text"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          placeholder="e.g. LOC-A1"
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
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          {location ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}