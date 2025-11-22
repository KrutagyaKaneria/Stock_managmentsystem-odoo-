export default function LoadingSkeleton({ type = 'table' }) {
  if (type === 'table') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="animate-pulse">
          {/* Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-4 bg-gray-300 rounded w-24"></div>
              ))}
            </div>
          </div>
          {/* Rows */}
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="border-b border-gray-200 px-6 py-4">
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map(j => (
                  <div key={j} className="h-4 bg-gray-200 rounded w-24"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'card') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    )
  }

  // Default spinner
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  )
}
