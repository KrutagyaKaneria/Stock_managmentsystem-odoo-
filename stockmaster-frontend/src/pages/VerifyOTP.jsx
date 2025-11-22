import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Loader, ArrowLeft } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import Toast from '../components/common/Toast'

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')
  const inputRefs = useRef([])
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/dashboard')
    return null
  }

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('loginEmail')
    if (!storedEmail) {
      navigate('/login')
      return
    }
    setEmail(storedEmail)
  }, [navigate])

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Take only the last character

    setOtp(newOtp)

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate OTP
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits of your OTP')
      return
    }

    setLoading(true)

    try {
      const response = await api.verifyOTP(email, otpString)

      if (response.data.success || response.status === 200) {
        const { user, token } = response.data.data || response.data

        // Store auth data
        login(user, token)

        setToastMessage('Login successful!')
        setToastType('success')
        setShowToast(true)

        // Clear session data
        sessionStorage.removeItem('loginEmail')

        setTimeout(() => {
          navigate('/dashboard')
        }, 1000)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Invalid OTP. Please try again.'
      setError(errorMessage)
      setToastMessage(errorMessage)
      setToastType('error')
      setShowToast(true)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return

    setError('')
    setLoading(true)

    try {
      const response = await api.sendOTP(email)

      if (response.data.success || response.status === 200) {
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
        setResendCountdown(60)
        setToastMessage('OTP resent successfully!')
        setToastType('success')
        setShowToast(true)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to resend OTP'
      setError(errorMessage)
      setToastMessage(errorMessage)
      setToastType('error')
      setShowToast(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen  from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verify Your Identity</h1>
          <p className="text-gray-600 mt-2">Enter the 6-digit code sent to</p>
          <p className="text-indigo-600 font-semibold">{email}</p>
        </div>

        {/* OTP Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <div className="text-red-600 mt-0.5">⚠</div>
              <div>
                <p className="font-semibold text-red-800">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* OTP Input Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Enter OTP Code
              </label>
              <div className="flex gap-3 justify-between mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 transition"
                    disabled={loading}
                    autoComplete="off"
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm mb-3">Didn't receive the code?</p>
            <button
              onClick={handleResendOtp}
              disabled={resendCountdown > 0 || loading}
              className="text-indigo-600 hover:text-indigo-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend OTP'}
            </button>
          </div>

          {/* Change Email */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Change Email Address
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          © 2025 StockMaster. All rights reserved.
        </p>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  )
}

export default VerifyOTP
