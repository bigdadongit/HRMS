import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar, LoadingSpinner } from '../components/shared'
import { useAuth } from '../hooks/useAuth'
import { BarChart3, TrendingUp, Users, Award, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export function InterviewAnalyticsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'
  
  const [stats, setStats] = useState(null)
  const [topCandidates, setTopCandidates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'hr') {
      navigate('/dashboard')
    }
    fetchData()
  }, [user, navigate])

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // Fetch statistics
      const statsRes = await fetch(`${API_BASE}/interview/statistics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const statsData = await statsRes.json()
      if (statsData.success) {
        setStats(statsData.data)
      }

      // Fetch top candidates
      const topRes = await fetch(`${API_BASE}/interview/top-candidates?limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const topData = await topRes.json()
      if (topData.success) {
        setTopCandidates(topData.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
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
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Interview Analytics</h1>
            <p className="text-sm text-[var(--text-secondary)]">Comprehensive interview performance metrics</p>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="card card-glass">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[var(--text-muted)] mb-1">Total Interviews</div>
                      <div className="text-xl font-semibold text-[var(--text-primary)]">{stats.total_interviews}</div>
                    </div>
                    <div className="w-10 h-10 bg-[rgba(59, 130, 246, 0.15)] rounded-xl flex items-center justify-center">
                      <Users size={20} className="text-[var(--info)]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card card-glass">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[var(--text-muted)] mb-1">Completed</div>
                      <div className="text-xl font-semibold text-[var(--text-primary)]">{stats.completed_interviews}</div>
                    </div>
                    <div className="w-10 h-10 bg-[rgba(16, 185, 129, 0.15)] rounded-xl flex items-center justify-center">
                      <CheckCircle size={20} className="text-[var(--primary)]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card card-glass">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[var(--text-muted)] mb-1">Avg Score</div>
                      <div className="text-xl font-semibold text-[var(--text-primary)]">{stats.average_score}</div>
                    </div>
                    <div className="w-10 h-10 bg-[rgba(14, 165, 233, 0.15)] rounded-xl flex items-center justify-center">
                      <TrendingUp size={20} className="text-sky-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card card-glass">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[var(--text-muted)] mb-1">Proceed Rate</div>
                      <div className="text-xl font-semibold text-[var(--text-primary)]">
                        {stats.completed_interviews > 0 ? Math.round((stats.proceed_count / stats.completed_interviews) * 100) : 0}%
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-[rgba(245, 158, 11, 0.15)] rounded-xl flex items-center justify-center">
                      <Award size={20} className="text-[var(--warning)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recommendation Distribution */}
          {stats && (
            <div className="card card-glass mb-6">
              <div className="card-header">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Recommendation Distribution</h2>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-[rgba(16, 185, 129, 0.15)] rounded-xl border border-[rgba(16, 185, 129, 0.3)]">
                    <div className="w-12 h-12 bg-[rgba(16, 185, 129, 0.25)] rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle size={24} className="text-[var(--primary)]" />
                    </div>
                    <div className="text-2xl font-semibold text-[var(--text-primary)] mb-1">{stats.proceed_count}</div>
                    <div className="text-xs text-[var(--text-secondary)]">Proceed</div>
                  </div>
                  <div className="text-center p-4 bg-[rgba(245, 158, 11, 0.15)] rounded-xl border border-[rgba(245, 158, 11, 0.3)]">
                    <div className="w-12 h-12 bg-[rgba(245, 158, 11, 0.25)] rounded-full flex items-center justify-center mx-auto mb-2">
                      <AlertCircle size={24} className="text-[var(--warning)]" />
                    </div>
                    <div className="text-2xl font-semibold text-[var(--text-primary)] mb-1">{stats.maybe_count}</div>
                    <div className="text-xs text-[var(--text-secondary)]">Maybe</div>
                  </div>
                  <div className="text-center p-4 bg-[rgba(239, 68, 68, 0.15)] rounded-xl border border-[rgba(239, 68, 68, 0.3)]">
                    <div className="w-12 h-12 bg-[rgba(239, 68, 68, 0.25)] rounded-full flex items-center justify-center mx-auto mb-2">
                      <XCircle size={24} className="text-[var(--danger)]" />
                    </div>
                    <div className="text-2xl font-semibold text-[var(--text-primary)] mb-1">{stats.reject_count}</div>
                    <div className="text-xs text-[var(--text-secondary)]">Reject</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top Candidates Leaderboard */}
          <div className="card card-glass">
            <div className="card-header">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Top Candidates Leaderboard</h2>
            </div>
            <div className="card-body">
              {topCandidates.length > 0 ? (
                <div className="space-y-2">
                  {topCandidates.map((candidate, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-xl hover:bg-[var(--bg-elevated)] transition-colors border border-[var(--border)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          index === 0 ? 'bg-[var(--warning)] text-[var(--bg-primary)]' :
                          index === 1 ? 'bg-[var(--text-muted)] text-[var(--bg-primary)]' :
                          index === 2 ? 'bg-amber-700 text-[var(--bg-primary)]' :
                          'bg-[var(--border)] text-[var(--text-secondary)]'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[var(--text-primary)]">{candidate.candidate_name}</div>
                          <div className="text-xs text-[var(--text-muted)]">{candidate.role_applied}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-lg font-semibold text-[var(--text-primary)]">{candidate.overall_score}</div>
                          <span className={`badge ${
                            candidate.recommendation === 'Proceed' ? 'badge-success' :
                            candidate.recommendation === 'Maybe' ? 'badge-warning' :
                            'badge-danger'
                          }`}>
                            {candidate.recommendation}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--text-secondary)] text-center py-8 text-sm">No completed interviews yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InterviewAnalyticsPage
