import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authService } from '../services/authService'
import { ErrorAlert, SuccessAlert } from '../components/shared'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await authService.login(email, password)
      if (response.success) {
        const { access_token, user } = response.data
        const employee = response.data.employee || null

        login(user, access_token, employee)
        setSuccess('Login successful! Redirecting...')

        // Redirect based on role
        setTimeout(() => {
          if (user.role === 'admin') {
            navigate('/admin/dashboard')
          } else if (user.role === 'hr') {
            navigate('/hr/dashboard')
          } else if (user.role === 'manager') {
            navigate('/manager/dashboard')
          } else {
            navigate('/employee/dashboard')
          }
        }, 1500)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">HRMS</h1>
            <p className="text-gray-600 mt-2">Human Resource Management System</p>
          </div>

          {error && <ErrorAlert message={error} onClose={() => setError('')} />}
          {success && <SuccessAlert message={success} onClose={() => setSuccess('')} />}

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 font-semibold mb-2">Demo Credentials:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>Admin: admin@hrms.com / admin123</li>
              <li>HR: hr@hrms.com / hr123</li>
              <li>Manager: manager@hrms.com / manager123</li>
              <li>Employee: employee@hrms.com / employee123</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
