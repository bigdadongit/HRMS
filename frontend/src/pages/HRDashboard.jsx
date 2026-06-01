import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar, DashboardCard, LoadingSpinner } from '../components/shared'
import { useAuth } from '../hooks/useAuth'
import { dashboardService } from '../services/authService'
import { Users, FileText, TrendingUp, Calendar } from 'lucide-react'

export function HRDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardService.getHRDashboard()
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
      <Sidebar role="hr" onLogout={handleLogout} />

      <div className="ml-64 flex-1 min-h-screen bg-gray-100">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">HR Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome, {user?.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Employee Count"
              value={dashboardData?.employee_count || 0}
              icon={Users}
              color="blue"
            />
            <DashboardCard
              title="Pending Leaves"
              value={dashboardData?.pending_leaves || 0}
              icon={Calendar}
              color="orange"
            />
            <DashboardCard
              title="Recruitment Pipeline"
              value={dashboardData?.recruitment_pipeline || 0}
              icon={FileText}
              color="purple"
            />
            <DashboardCard
              title="Monthly Hires"
              value="5"
              icon={TrendingUp}
              color="green"
            />
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="dashboard-card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">HR Functions</h2>
              <div className="space-y-3">
                <button className="w-full btn-primary text-left">Manage Employees</button>
                <button className="w-full btn-secondary text-left">Process Leave Requests</button>
                <button className="w-full btn-secondary text-left">View Recruitment</button>
                <button className="w-full btn-secondary text-left">Generate HR Reports</button>
              </div>
            </div>

            <div className="dashboard-card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Actions</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                  <span className="text-gray-700">Leave Requests to Review</span>
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {dashboardData?.pending_leaves || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span className="text-gray-700">Candidates in Pipeline</span>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {dashboardData?.recruitment_pipeline || 0}
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
