import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authService } from '../services/authService'
import { ErrorAlert, SuccessAlert } from '../components/shared'
import { Lock, Mail, ArrowRight, Building2 } from 'lucide-react'

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
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="card card-glass">
          <div className="card-body p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-2xl mb-4 shadow-lg">
                <Building2 className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Welcome Back</h1>
              <p className="text-[var(--text-secondary)]">Sign in to your HRMS account</p>
            </div>

            {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}
            {success && <SuccessAlert message={success} onDismiss={() => setSuccess('')} />}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" size={20} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="input pl-10"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" size={20} />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input pl-10"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="spinner w-5 h-5 border-2"></div>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In
                    <ArrowRight size={18} />
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-[var(--text-muted)] text-sm mt-6">
          Secure login powered by HRMS Enterprise Platform
        </p>
      </div>
    </div>
  )
}
