import { useState, useCallback } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export const useApi = (apiCall) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { logout } = useAuth()

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiCall(...args)
        setData(response.data)
        return response.data
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred'
        setError(errorMessage)

        // Handle 401 - redirect to login
        if (err.response?.status === 401) {
          logout()
        }

        throw err
      } finally {
        setLoading(false)
      }
    },
    [apiCall, logout]
  )

  return { data, loading, error, execute }
}
