import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar, DashboardCard, LoadingSpinner } from '../components/shared'
import { useAuth } from '../hooks/useAuth'
import { dashboardService } from '../services/authService'
import { Users, Briefcase, TrendingUp, Calendar } from 'lucide-react'

export function AdminDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardService.getAdminDashboard()
      if (response.success) {
        setDashboardData(response.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="flex">
      <Sidebar role="admin" onLogout={handleLogout} />

      <div className="ml-64 flex-1 min-h-screen bg-gray-100">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Total Employees"
              value={dashboardData?.total_employees || 0}
              icon={Users}
              color="blue"
            />
            <DashboardCard
              title="Active Employees"
              value={dashboardData?.active_employees || 0}
              icon={Briefcase}
              color="green"
            />
            <DashboardCard
              title="Attendance Rate"
              value={`${dashboardData?.attendance_rate || 0}%`}
              icon={TrendingUp}
              color="purple"
            />
            <DashboardCard
              title="Pending Leaves"
              value={dashboardData?.pending_leaves || 0}
              icon={Calendar}
              color="orange"
            />
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="dashboard-card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full btn-primary text-left">View All Employees</button>
                <button className="w-full btn-secondary text-left">Manage Leave Requests</button>
                <button className="w-full btn-secondary text-left">Generate Reports</button>
              </div>
            </div>

            <div className="dashboard-card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Database</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Connected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">API Server</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Running</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Cache</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
