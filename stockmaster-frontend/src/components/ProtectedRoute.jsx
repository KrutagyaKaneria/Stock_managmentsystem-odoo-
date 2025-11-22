import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSkeleton from '../components/common/LoadingSkeleton'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <LoadingSkeleton rows={10} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
