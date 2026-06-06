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
              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">WorkForce Pro</h1>
              <p className="text-[var(--text-secondary)]">Welcome Back</p>
              <p className="text-[var(--text-muted)] text-sm mt-1">Sign in to your account</p>
            </div>

            {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}
            {success && <SuccessAlert message={success} onDismiss={() => setSuccess('')} />}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="flex items-center bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-xl overflow-hidden">
                  <div className="px-4 py-3 text-[var(--text-muted)]">
                    <Mail size={20} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="flex-1 bg-transparent px-4 py-4 placeholder:text-[var(--text-muted)] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="flex items-center bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-xl overflow-hidden">
                  <div className="px-4 py-3 text-[var(--text-muted)]">
                    <Lock size={20} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="flex-1 bg-transparent px-4 py-4 placeholder:text-[var(--text-muted)] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl text-lg font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="spinner w-5 h-5 border-2 border-white"></div>
                    Signing in...
                  </span>
                ) : (
                  <div className="flex items-center justify-between">
                    <span>Sign In</span>
                    <ArrowRight size={20} />
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-[var(--text-muted)] text-sm mt-6">
          Secure login powered by WorkForce Pro Enterprise Platform
        </p>
      </div>
    </div>
  )
}
