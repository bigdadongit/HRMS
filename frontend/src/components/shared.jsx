import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LogOut, Home, Users, Calendar, FileText, User, X, Check, AlertCircle, Loader2 } from 'lucide-react'

export function DashboardCard({ title, value, icon: Icon, color = 'emerald', trend = null, description = null }) {
  const colorClasses = {
    emerald: { bg: 'rgba(16, 185, 129, 0.15)', text: 'text-[var(--primary)]', border: 'rgba(16, 185, 129, 0.3)' },
    blue: { bg: 'rgba(59, 130, 246, 0.15)', text: 'text-[var(--info)]', border: 'rgba(59, 130, 246, 0.3)' },
    amber: { bg: 'rgba(245, 158, 11, 0.15)', text: 'text-[var(--warning)]', border: 'rgba(245, 158, 11, 0.3)' },
    rose: { bg: 'rgba(239, 68, 68, 0.15)', text: 'text-[var(--danger)]', border: 'rgba(239, 68, 68, 0.3)' },
    sky: { bg: 'rgba(14, 165, 233, 0.15)', text: 'text-sky-400', border: 'rgba(14, 165, 233, 0.3)' }
  }

  const colors = colorClasses[color] || colorClasses.emerald

  return (
    <div className="card card-glass">
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">{title}</p>
            <p className="text-3xl font-bold text-[var(--text-primary)]">
              {value}
            </p>
            {description && (
              <p className="text-sm text-[var(--text-secondary)] mt-1">{description}</p>
            )}
            {trend && (
              <p className={`text-xs font-medium mt-2 ${trend > 0 ? 'text-[var(--primary)]' : 'text-[var(--danger)]'}`}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
              </p>
            )}
          </div>
          {Icon && (
            <div className={`${colors.bg} ${colors.text} p-3 rounded-xl border ${colors.border}`}>
              <Icon size={24} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const dashboardPath = {
    admin: '/admin/dashboard',
    hr: '/hr/dashboard',
    manager: '/manager/dashboard',
    employee: '/employee/dashboard'
  }[user?.role] || '/login'

  const getMenuItems = () => {
    const baseItems = [
      { label: 'Dashboard', href: dashboardPath, icon: Home }
    ]

    const roleItems = {
      admin: [
        { label: 'Employees', href: '/employees', icon: Users },
        { label: 'Attendance', href: '/attendance', icon: Calendar },
        { label: 'Leaves', href: '/leaves', icon: FileText },
        { label: 'Resume Screening', href: '/resume-screening', icon: FileText },
        { label: 'Interview Analytics', href: '/interview-analytics', icon: FileText },
        { label: 'HR Copilot', href: '/hr-copilot', icon: FileText },
        { label: 'Reports', href: '/reports', icon: FileText },
        { label: 'Settings', href: '/settings', icon: FileText }
      ],
      hr: [
        { label: 'Employees', href: '/employees', icon: Users },
        { label: 'Attendance', href: '/attendance', icon: Calendar },
        { label: 'Leaves', href: '/leaves', icon: FileText },
        { label: 'Resume Screening', href: '/resume-screening', icon: FileText },
        { label: 'Interview Room', href: '/interview-room', icon: FileText },
        { label: 'HR Copilot', href: '/hr-copilot', icon: FileText }
      ],
      manager: [
        { label: 'Team', href: '/manager/dashboard', icon: Users },
        { label: 'Attendance', href: '/attendance', icon: Calendar },
        { label: 'Performance Reviews', href: '/performance', icon: FileText }
      ],
      employee: [
        { label: 'My Profile', href: '/profile', icon: User },
        { label: 'Attendance', href: '/attendance', icon: Calendar },
        { label: 'Leave Requests', href: '/leaves', icon: FileText },
        { label: 'Performance Reviews', href: '/performance', icon: FileText }
      ]
    }

    return [...baseItems, ...(roleItems[user?.role] || [])]
  }

  const menuItems = getMenuItems()

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 flex flex-col glass-strong border-r border-[var(--border)]">
      <div className="p-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">W</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">WorkForce Pro</h1>
            <p className="text-xs text-[var(--text-muted)]">Enterprise HR made elegant</p>
          </div>
        </div>
      </div>

  <nav className="flex-1 p-4">
        {menuItems.map((item) => {
          const IconComponent = item.icon
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white shadow-lg'
                  : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <IconComponent size={18} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border)]">
        <div className="mb-4 p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] shadow-sm">
          <p className="text-xs text-[var(--text-primary)] truncate mb-1">{user?.email}</p>
          <p className="text-xs font-medium text-[var(--primary)] capitalize">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-xl text-sm font-medium transition-all duration-200 border border-transparent hover:border-[var(--border)]"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  )
}

export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Loader2 className="spinner text-indigo-600" size={32} />
        </div>
        <p className="text-gray-600 font-medium">{text}</p>
      </div>
    </div>
  )
}

export function ErrorAlert({ message, onDismiss }) {
  return (
    <div className="alert alert-error">
      <AlertCircle size={20} />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="hover:bg-red-100 rounded p-1 transition-colors">
          <X size={18} />
        </button>
      )}
    </div>
  )
}

export function SuccessAlert({ message, onDismiss }) {
  return (
    <div className="alert alert-success">
      <Check size={20} />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="hover:bg-emerald-100 rounded p-1 transition-colors">
          <X size={18} />
        </button>
      )}
    </div>
  )
}

export function WarningAlert({ message, onDismiss }) {
  return (
    <div className="alert alert-warning">
      <AlertCircle size={20} />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="hover:bg-amber-100 rounded p-1 transition-colors">
          <X size={18} />
        </button>
      )}
    </div>
  )
}

export function InfoAlert({ message, onDismiss }) {
  return (
    <div className="alert alert-info">
      <AlertCircle size={20} />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="hover:bg-indigo-100 rounded p-1 transition-colors">
          <X size={18} />
        </button>
      )}
    </div>
  )
}

