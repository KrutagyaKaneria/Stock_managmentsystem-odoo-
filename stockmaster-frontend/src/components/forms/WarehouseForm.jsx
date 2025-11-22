import { useState } from 'react'

export default function WarehouseForm({ warehouse, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: warehouse?.name || '',
    location_code: warehouse?.locationCode || warehouse?.location_code || ''
  })

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Name *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          placeholder="e.g. Main Warehouse"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location Code</label>
        <input
          type="text"
          value={formData.location_code}
          onChange={(e) => setFormData({ ...formData, location_code: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          placeholder="e.g. WH-01"
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
          {warehouse ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}
