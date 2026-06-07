import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogin = () => {
    navigate('/login')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="w-full bg-white border-b border-[var(--border)] p-4 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl flex items-center justify-center shadow">
            <span className="text-white font-bold">H</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold">WorkForce Pro</h2>
            <p className="text-xs text-[var(--text-muted)]">People operations, simplified</p>
          </div>
        </Link>
      </div>

      <div>
        {!user && (
          <button onClick={handleLogin} className="btn btn-primary">
            Login
          </button>
        )}
        {user && (
          <button onClick={handleLogout} className="btn btn-ghost">
            Logout
          </button>
        )}
      </div>
    </header>
  )
}
