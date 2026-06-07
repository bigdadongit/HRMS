import React, { createContext, useState, useCallback, useEffect } from 'react'
import { authService } from '../services/authService'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // Check if user is authenticated on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    // Debug: log stored values
    try {
      // eslint-disable-next-line no-console
      console.debug('AuthContext init - storedToken?', !!storedToken, 'storedUser?', !!storedUser)
      if (storedToken) {
        try {
          const p = JSON.parse(atob(storedToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
          // eslint-disable-next-line no-console
          console.debug('AuthContext init - token payload', p)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.debug('AuthContext init - token decode failed')
        }
      }
    } catch (e) {}

    const finalize = async () => {
      if (storedToken && storedUser) {
        setToken(storedToken)
        try {
          const parsed = JSON.parse(storedUser)
          if (parsed && parsed.role) parsed.role = parsed.role.toString().toLowerCase()
          setUser(parsed)
        } catch (e) {
          setUser(JSON.parse(storedUser))
        }
      } else if (storedToken && !storedUser) {
        // Token exists but user not stored - try fetching current user
        setToken(storedToken)
        try {
          const resp = await authService.getCurrentUser()
          if (resp && resp.success && resp.data && resp.data.user) {
            const u = resp.data.user
            if (u && u.role) u.role = u.role.toString().toLowerCase()
            setUser(u)
            setEmployee(resp.data.employee || null)
            // eslint-disable-next-line no-console
            console.debug('AuthContext: fetched current user from /auth/me', { user: u, employee: resp.data.employee || null })
            localStorage.setItem('user', JSON.stringify(u))
          }
        } catch (e) {
          // ignore - will be treated as unauthenticated
          console.warn('Failed to fetch current user from token')
        }
      }

      setLoading(false)
    }

    finalize()
  }, [])

  const login = useCallback((userData, accessToken, employeeData) => {
  // normalize role to lower-case to keep checks consistent
  const normalizedUser = { ...(userData || {}) }
  if (normalizedUser.role) normalizedUser.role = normalizedUser.role.toString().toLowerCase()
  setUser(normalizedUser)
    setEmployee(employeeData)
    setToken(accessToken)
  localStorage.setItem('token', accessToken)
  localStorage.setItem('user', JSON.stringify(normalizedUser))
    localStorage.setItem('employee', JSON.stringify(employeeData))
  // eslint-disable-next-line no-console
  console.debug('AuthContext login - stored', { token: accessToken ? '[REDACTED]' : null, user: normalizedUser, employee: employeeData })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setEmployee(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('employee')
  }, [])

  const value = {
    user,
    employee,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
