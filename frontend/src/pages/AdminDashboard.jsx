import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar, DashboardCard, LoadingSpinner } from '../components/shared'
import { useAuth } from '../hooks/useAuth'
import { dashboardService } from '../services/authService'
import { Users, Briefcase, TrendingUp, Calendar, ArrowRight, CheckCircle, Server, Database, Zap } from 'lucide-react'

export function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
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

  if (loading) return <LoadingSpinner />

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-64">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Admin Dashboard</h1>
            <p className="text-sm text-[var(--text-secondary)]">Welcome back, {user?.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <DashboardCard
              title="Total Employees"
              value={dashboardData?.total_employees || 0}
              icon={Users}
              color="emerald"
              description="All registered employees"
            />
            <DashboardCard
              title="Active Employees"
              value={dashboardData?.active_employees || 0}
              icon={Briefcase}
              color="blue"
              description="Currently active"
            />
            <DashboardCard
              title="Attendance Rate"
              value={`${dashboardData?.attendance_rate || 0}%`}
              icon={TrendingUp}
              color="sky"
              description="Overall attendance"
            />
            <DashboardCard
              title="Pending Leaves"
              value={dashboardData?.pending_leaves || 0}
              icon={Calendar}
              color="amber"
              description="Awaiting approval"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card card-glass">
              <div className="card-header">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Quick Actions</h2>
              </div>
              <div className="card-body space-y-2">
                <button 
                  onClick={() => navigate('/employees')}
                  className="w-full btn btn-secondary flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Users size={16} />
                    View All Employees
                  </span>
                  <ArrowRight size={16} />
                </button>
                <button 
                  onClick={() => navigate('/leaves')}
                  className="w-full btn btn-secondary flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Calendar size={16} />
                    Manage Leave Requests
                  </span>
                  <ArrowRight size={16} />
                </button>
                <button 
                  onClick={() => navigate('/attendance')}
                  className="w-full btn btn-secondary flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp size={16} />
                    View Attendance Reports
                  </span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="card card-glass">
              <div className="card-header">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">System Status</h2>
              </div>
              <div className="card-body space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database size={16} className="text-[var(--text-muted)]" />
                    <span className="text-sm text-[var(--text-primary)]">Database</span>
                  </div>
                  <span className="badge badge-success">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server size={16} className="text-[var(--text-muted)]" />
                    <span className="text-sm text-[var(--text-primary)]">API Server</span>
                  </div>
                  <span className="badge badge-success">Running</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-[var(--text-muted)]" />
                    <span className="text-sm text-[var(--text-primary)]">Cache</span>
                  </div>
                  <span className="badge badge-success">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
