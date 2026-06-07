import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar, DashboardCard, LoadingSpinner } from '../components/shared'
import { useAuth } from '../hooks/useAuth'
import { dashboardService } from '../services/authService'
import { Users, TrendingUp, Calendar, Award, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react'

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


  if (loading) return <LoadingSpinner />

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-64">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Manager Dashboard</h1>
            <p className="text-sm text-[var(--text-secondary)]">Welcome, {user?.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <DashboardCard
              title="Team Size"
              value={dashboardData?.team_size || 0}
              icon={Users}
              color="emerald"
              description="Team members"
            />
            <DashboardCard
              title="Team Attendance"
              value={`${dashboardData?.team_attendance || 0}%`}
              icon={Calendar}
              color="blue"
              description="Today's attendance"
            />
            <DashboardCard
              title="Team Performance"
              value={dashboardData?.team_performance || 'N/A'}
              icon={TrendingUp}
              color="sky"
              description="Overall score"
            />
            <DashboardCard
              title="Pending Leaves"
              value={dashboardData?.team_leaves_pending || 0}
              icon={Award}
              color="amber"
              description="Awaiting approval"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card card-glass">
              <div className="card-header">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Team Management</h2>
              </div>
              <div className="card-body space-y-2">
                <button className="w-full btn btn-secondary flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Users size={16} />
                    View Team Members
                  </span>
                  <ArrowRight size={16} />
                </button>
                <button 
                  onClick={() => navigate('/attendance')}
                  className="w-full btn btn-secondary flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Calendar size={16} />
                    Attendance Records
                  </span>
                  <ArrowRight size={16} />
                </button>
                <button 
                  onClick={() => navigate('/leaves')}
                  className="w-full btn btn-secondary flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Award size={16} />
                    Approve Leave Requests
                  </span>
                  <ArrowRight size={16} />
                </button>
                <button className="w-full btn btn-secondary flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <TrendingUp size={16} />
                    Performance Reviews
                  </span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="card card-glass">
              <div className="card-header">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Team Overview</h2>
              </div>
              <div className="card-body space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[var(--text-muted)]">Team Attendance Today</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{Math.round((dashboardData?.team_attendance || 0) / 20)}/5</span>
                  </div>
                  <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2">
                    <div
                      className="bg-[var(--primary)] h-2 rounded-full"
                      style={{ width: `${dashboardData?.team_attendance || 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-[var(--text-muted)]" />
                    <span className="text-sm text-[var(--text-primary)]">Team Status</span>
                  </div>
                  <span className="badge badge-success">On Track</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-[var(--text-muted)]" />
                    <span className="text-sm text-[var(--text-primary)]">Pending Approvals</span>
                  </div>
                  <span className="badge badge-warning">
                    {dashboardData?.team_leaves_pending || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="card card-glass">
              <div className="card-header">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Team Members</h2>
              </div>
              <div className="card-body">
                {dashboardData?.team_members && dashboardData.team_members.length > 0 ? (
                  <ul className="space-y-2">
                    {dashboardData.team_members.map((m) => (
                      <li key={m.id} className="flex items-center justify-between p-2 bg-[var(--bg-secondary)] rounded">
                        <div>
                          <div className="text-sm font-medium text-[var(--text-primary)]">{m.first_name} {m.last_name}</div>
                          <div className="text-xs text-[var(--text-muted)]">{m.email} · {m.department || '—'} · {m.designation || '—'}</div>
                        </div>
                        <div>
                          <button onClick={() => navigate(`/employees/${m.id}`)} className="btn btn-sm btn-outline">Profile</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-[var(--text-muted)]">No team members found.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboard
