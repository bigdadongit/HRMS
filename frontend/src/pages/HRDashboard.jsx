import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar, DashboardCard, LoadingSpinner } from '../components/shared'
import { useAuth } from '../hooks/useAuth'
import { dashboardService } from '../services/authService'
import { Users, FileText, TrendingUp, Calendar, ArrowRight, AlertCircle, UserPlus, Sparkles, MessageSquare, Mic } from 'lucide-react'

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


  if (loading) return <LoadingSpinner />

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-64">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">HR Dashboard</h1>
            <p className="text-sm text-[var(--text-secondary)]">Welcome, {user?.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <DashboardCard
              title="Employee Count"
              value={dashboardData?.employee_count || 0}
              icon={Users}
              color="emerald"
              description="Total employees"
            />
            <DashboardCard
              title="Pending Leaves"
              value={dashboardData?.pending_leaves || 0}
              icon={Calendar}
              color="amber"
              description="Awaiting review"
            />
            <DashboardCard
              title="Total Interviews"
              value={dashboardData?.total_interviews || 0}
              icon={Mic}
              color="sky"
              description="Interviews conducted"
            />
            <DashboardCard
              title="Avg Interview Score"
              value={dashboardData?.average_interview_score || 0}
              icon={TrendingUp}
              color="blue"
              description="Candidate performance"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card card-glass">
              <div className="card-header">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">HR Functions</h2>
              </div>
              <div className="card-body space-y-2">
                <button 
                  onClick={() => navigate('/employees')}
                  className="w-full btn btn-secondary flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Users size={16} />
                    Manage Employees
                  </span>
                  <ArrowRight size={16} />
                </button>
                <button 
                  onClick={() => navigate('/leaves')}
                  className="w-full btn btn-secondary flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Calendar size={16} />
                    Process Leave Requests
                  </span>
                  <ArrowRight size={16} />
                </button>
                <button 
                  onClick={() => navigate('/resume-screening')}
                  className="w-full btn btn-secondary flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles size={16} />
                    AI Resume Screening
                  </span>
                  <ArrowRight size={16} />
                </button>
                <button 
                  onClick={() => navigate('/interview-room')}
                  className="w-full btn btn-secondary flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Mic size={16} />
                    AI Interview Bot
                  </span>
                  <ArrowRight size={16} />
                </button>
                <button 
                  onClick={() => navigate('/hr-copilot')}
                  className="w-full btn btn-secondary flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    HR Copilot
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
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Pending Actions</h2>
              </div>
              <div className="card-body space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-[var(--text-muted)]" />
                    <span className="text-sm text-[var(--text-primary)]">Leave Requests to Review</span>
                  </div>
                  <span className="badge badge-danger">
                    {dashboardData?.pending_leaves || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus size={16} className="text-[var(--text-muted)]" />
                    <span className="text-sm text-[var(--text-primary)]">Candidates in Pipeline</span>
                  </div>
                  <span className="badge badge-info">
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

export default HRDashboard
