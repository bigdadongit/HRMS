import React from 'react'
import { Link } from 'react-router-dom'

export function DashboardCard({ title, value, icon: Icon, color = 'blue', trend = null }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600'
  }

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? '↑' : '↓'} {trend.percentage}% {trend.label}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`${colorClasses[color]} p-4 rounded-lg`}>
            <Icon size={32} />
          </div>
        )}
      </div>
    </div>
  )
}

export function Sidebar({ role, onLogout }) {
  const menuItems = {
    admin: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
      { label: 'Employees', href: '/admin/employees', icon: '👥' },
      { label: 'Attendance', href: '/admin/attendance', icon: '📅' },
      { label: 'Leave Requests', href: '/admin/leaves', icon: '📋' }
    ],
    hr: [
      { label: 'Dashboard', href: '/hr/dashboard', icon: '📊' },
      { label: 'Employees', href: '/hr/employees', icon: '👥' },
      { label: 'Leave Requests', href: '/hr/leaves', icon: '📋' },
      { label: 'Recruitment', href: '/hr/recruitment', icon: '💼' }
    ],
    manager: [
      { label: 'Dashboard', href: '/manager/dashboard', icon: '📊' },
      { label: 'Team', href: '/manager/team', icon: '👥' },
      { label: 'Attendance', href: '/manager/attendance', icon: '📅' }
    ],
    employee: [
      { label: 'Dashboard', href: '/employee/dashboard', icon: '📊' },
      { label: 'Attendance', href: '/employee/attendance', icon: '📅' },
      { label: 'Leave Requests', href: '/employee/leaves', icon: '📋' }
    ]
  }

  const items = menuItems[role] || []

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold">HRMS</h1>
        <p className="text-gray-400 text-sm mt-1">Human Resource Management</p>
      </div>

      <nav className="mt-8">
        {items.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="px-6 py-3 flex items-center text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <button
          onClick={onLogout}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

export function ErrorAlert({ message, onClose }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="text-red-700 hover:text-red-900">
          ✕
        </button>
      )}
    </div>
  )
}

export function SuccessAlert({ message, onClose }) {
  return (
    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex justify-between items-center">
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="text-green-700 hover:text-green-900">
          ✕
        </button>
      )}
    </div>
  )
}
