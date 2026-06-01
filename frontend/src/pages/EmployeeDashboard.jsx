import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar, DashboardCard, LoadingSpinner } from '../components/shared'
import { useAuth } from '../hooks/useAuth'
import { dashboardService } from '../services/authService'
import { Calendar, Trophy, TrendingUp, Clock } from 'lucide-react'

export function EmployeeDashboard() {
  const navigate = useNavigate()
  const { user, employee, logout } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardService.getEmployeeDashboard()
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
      <Sidebar role="employee" onLogout={handleLogout} />

      <div className="ml-64 flex-1 min-h-screen bg-gray-100">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Welcome, {employee?.first_name}</h1>
            <p className="text-gray-600 mt-2">
              {employee?.designation} • {employee?.department}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Attendance Rate"
              value={`${Math.round(dashboardData?.attendance || 0)}%`}
              icon={Calendar}
              color="blue"
            />
            <DashboardCard
              title="Leave Balance"
              value={dashboardData?.leave_balance || 0}
              icon={Clock}
              color="purple"
            />
            <DashboardCard
              title="Performance Score"
              value={dashboardData?.performance_score || 'N/A'}
              icon={Trophy}
              color="green"
            />
            <DashboardCard
              title="Days Until Leave"
              value="45"
              icon={TrendingUp}
              color="orange"
            />
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="dashboard-card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full btn-primary text-left">View My Attendance</button>
                <button className="w-full btn-secondary text-left">Request Leave</button>
                <button className="w-full btn-secondary text-left">My Profile</button>
              </div>
            </div>

            <div className="dashboard-card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">My Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="font-semibold">{employee?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone</span>
                  <span className="font-semibold">{employee?.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Department</span>
                  <span className="font-semibold">{employee?.department || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Designation</span>
                  <span className="font-semibold">{employee?.designation || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 dashboard-card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Attendance This Month</h2>
            <div className="flex items-end justify-around h-32">
              {[85, 92, 88, 95, 90].map((value, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-8 bg-blue-600 rounded-t"
                    style={{ height: `${value}%` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">W{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
