import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar, LoadingSpinner } from '../components/shared'
import { useAuth } from '../hooks/useAuth'
import { Trophy, TrendingUp, CheckCircle, XCircle, AlertCircle, User, Award, BarChart3 } from 'lucide-react'

export function InterviewResultsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'
  
  const [interviews, setInterviews] = useState([])
  const [topCandidates, setTopCandidates] = useState([])
  const [stats, setStats] = useState(null)
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
      
      // Fetch interviews
      const interviewsRes = await fetch(`${API_BASE}/interview`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const interviewsData = await interviewsRes.json()
      if (interviewsData.success) {
        setInterviews(interviewsData.data.data || [])
      }

      // Fetch top candidates
      const topRes = await fetch(`${API_BASE}/interview/top-candidates?limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const topData = await topRes.json()
      if (topData.success) {
        setTopCandidates(topData.data)
      }

      // Fetch statistics
      const statsRes = await fetch(`${API_BASE}/interview/statistics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const statsData = await statsRes.json()
      if (statsData.success) {
        setStats(statsData.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRecommendationColor = (recommendation) => {
    if (recommendation === 'Proceed') return 'badge-success'
    if (recommendation === 'Maybe') return 'badge-warning'
    return 'badge-danger'
  }

  const getRecommendationIcon = (recommendation) => {
    if (recommendation === 'Proceed') return <CheckCircle size={20} />
    if (recommendation === 'Maybe') return <AlertCircle size={20} />
    return <XCircle size={20} />
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-64">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Interview Results</h1>
            <p className="text-sm text-[var(--text-secondary)]">View interview outcomes and candidate rankings</p>
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
                      <User size={20} className="text-[var(--info)]" />
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Candidates */}
            <div className="card card-glass">
              <div className="card-header">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Top Candidates</h2>
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
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-semibold ${
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
                            <span className={`badge ${getRecommendationColor(candidate.recommendation)}`}>
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

            {/* Recent Interviews */}
            <div className="card card-glass">
              <div className="card-header">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Recent Interviews</h2>
              </div>
              <div className="card-body">
                {interviews.length > 0 ? (
                  <div className="space-y-2">
                    {interviews.slice(0, 5).map((interview) => (
                      <div
                        key={interview.id}
                        className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-xl hover:bg-[var(--bg-elevated)] transition-colors border border-[var(--border)]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[rgba(59, 130, 246, 0.15)] rounded-xl flex items-center justify-center">
                            <User size={16} className="text-[var(--info)]" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[var(--text-primary)]">{interview.candidate_name}</div>
                            <div className="text-xs text-[var(--text-muted)]">{interview.role_applied}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`badge ${interview.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                            {interview.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--text-secondary)] text-center py-8 text-sm">No interviews yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
