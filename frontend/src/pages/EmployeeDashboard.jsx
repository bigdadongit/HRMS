import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar, DashboardCard, LoadingSpinner } from '../components/shared'
import { useAuth } from '../hooks/useAuth'
import { dashboardService } from '../services/authService'
import { Calendar, Trophy, TrendingUp, Clock, ArrowRight, Mail, Building2, Briefcase } from 'lucide-react'

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


  if (loading) return <LoadingSpinner />

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-64">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Welcome, {employee?.first_name}</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {employee?.designation} • {employee?.department}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <DashboardCard
              title="Attendance Rate"
              value={`${Math.round(dashboardData?.attendance || 0)}%`}
              icon={Calendar}
              color="emerald"
              description="This month"
            />
            <DashboardCard
              title="Leave Balance"
              value={dashboardData?.leave_balance || 0}
              icon={Clock}
              color="sky"
              description="Days remaining"
            />
            <DashboardCard
              title="Performance Score"
              value={dashboardData?.performance_score || 'N/A'}
              icon={Trophy}
              color="blue"
              description="Overall rating"
            />
            <DashboardCard
              title="Days Until Leave"
              value="45"
              icon={TrendingUp}
              color="amber"
              description="Next vacation"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="card card-glass">
              <div className="card-header">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Quick Actions</h2>
              </div>
              <div className="card-body space-y-2">
                <button 
                  onClick={() => navigate('/attendance')}
                  className="w-full btn btn-secondary flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Calendar size={16} />
                    View My Attendance
                  </span>
                  <ArrowRight size={16} />
                </button>
                <button 
                  onClick={() => navigate('/leaves')}
                  className="w-full btn btn-secondary flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Clock size={16} />
                    Request Leave
                  </span>
                  <ArrowRight size={16} />
                </button>
                <button 
                  onClick={() => navigate('/profile')}
                  className="w-full btn btn-secondary flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Trophy size={16} />
                    My Profile
                  </span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="card card-glass">
              <div className="card-header">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">My Information</h2>
              </div>
              <div className="card-body space-y-3">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-[var(--text-muted)]" />
                  <div>
                    <div className="text-xs text-[var(--text-muted)]">Email</div>
                    <div className="text-sm text-[var(--text-primary)]">{employee?.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-[var(--text-muted)]" />
                  <div>
                    <div className="text-xs text-[var(--text-muted)]">Department</div>
                    <div className="text-sm text-[var(--text-primary)]">{employee?.department || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-[var(--text-muted)]" />
                  <div>
                    <div className="text-xs text-[var(--text-muted)]">Designation</div>
                    <div className="text-sm text-[var(--text-primary)]">{employee?.designation || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card card-glass">
            <div className="card-header">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Attendance This Month</h2>
            </div>
            <div className="card-body">
              <div className="flex items-end justify-around h-32 gap-4">
                {[85, 92, 88, 95, 90].map((value, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-gradient-to-t from-[var(--primary)] to-[var(--accent)] rounded-t"
                      style={{ height: `${value}%` }}
                    ></div>
                    <span className="text-xs text-[var(--text-muted)] mt-2">W{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
