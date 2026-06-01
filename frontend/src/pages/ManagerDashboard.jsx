import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar, DashboardCard, LoadingSpinner } from '../components/shared'
import { useAuth } from '../hooks/useAuth'
import { dashboardService } from '../services/authService'
import { Users, TrendingUp, Calendar, Award } from 'lucide-react'

export function ManagerDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardService.getManagerDashboard()
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
      <Sidebar role="manager" onLogout={handleLogout} />

      <div className="ml-64 flex-1 min-h-screen bg-gray-100">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Manager Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome, {user?.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Team Size"
              value={dashboardData?.team_size || 0}
              icon={Users}
              color="blue"
            />
            <DashboardCard
              title="Team Attendance"
              value={`${dashboardData?.team_attendance || 0}%`}
              icon={Calendar}
              color="green"
            />
            <DashboardCard
              title="Team Performance"
              value={dashboardData?.team_performance || 'N/A'}
              icon={TrendingUp}
              color="purple"
            />
            <DashboardCard
              title="Pending Leave Requests"
              value={dashboardData?.team_leaves_pending || 0}
              icon={Award}
              color="orange"
            />
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="dashboard-card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Team Management</h2>
              <div className="space-y-3">
                <button className="w-full btn-primary text-left">View Team Members</button>
                <button className="w-full btn-secondary text-left">Attendance Records</button>
                <button className="w-full btn-secondary text-left">Approve Leave Requests</button>
                <button className="w-full btn-secondary text-left">Performance Reviews</button>
              </div>
            </div>

            <div className="dashboard-card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Team Overview</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Present Today</span>
                  <span className="font-bold text-lg">{Math.round((dashboardData?.team_attendance || 0) / 20)}/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${dashboardData?.team_attendance || 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-gray-700">Pending Approvals</span>
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-bold">
                    {dashboardData?.team_leaves_pending || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
