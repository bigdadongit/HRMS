import React, { useState, useEffect } from 'react'
import { Calendar, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import apiClient from '../services/api'
import { DashboardCard, Sidebar, LoadingSpinner, ErrorAlert } from '../components/shared'
import { useAuth } from '../hooks/useAuth'

export const AttendancePage = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [report, setReport] = useState(null)
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    fetchAttendanceData()
  }, [month, year])

  const fetchAttendanceData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const profileRes = await apiClient.get('/employees/profile')
      const employeeId = profileRes.data.data.id

      const reportRes = await apiClient.get(
        `/attendance/monthly-report/${employeeId}?month=${month}&year=${year}`
      )
      setReport(reportRes.data.data)

      const summaryRes = await apiClient.get(`/attendance/summary/${employeeId}`)
      setSummary(summaryRes.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch attendance data')
    } finally {
      setLoading(false)
    }
  }

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 90) return { color: 'emerald', label: 'Excellent' }
    if (percentage >= 75) return { color: 'amber', label: 'Good' }
    return { color: 'rose', label: 'Needs Improvement' }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle size={16} />
      case 'absent': return <XCircle size={16} />
      case 'leave': return <Clock size={16} />
      case 'half_day': return <AlertCircle size={16} />
      default: return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-emerald-50 text-emerald-600 border-emerald-200'
      case 'absent': return 'bg-rose-50 text-rose-600 border-rose-200'
      case 'leave': return 'bg-sky-50 text-sky-600 border-sky-200'
      case 'half_day': return 'bg-amber-50 text-amber-600 border-amber-200'
      default: return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[rgba(59, 130, 246, 0.15)] rounded-xl flex items-center justify-center">
                <Calendar className="text-[var(--info)]" size={20} />
              </div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">Attendance</h1>
            </div>
            <p className="text-[var(--text-secondary)] ml-13">Track and view your attendance records</p>
          </div>

          {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <DashboardCard 
                    title="Total Records" 
                    value={summary.total_records} 
                    color="blue"
                    description="All attendance entries"
                  />
                  <DashboardCard 
                    title="Present Days" 
                    value={summary.present} 
                    color="emerald"
                    description="Days marked present"
                  />
                  <DashboardCard 
                    title="Absent Days" 
                    value={summary.absent} 
                    color="rose"
                    description="Days marked absent"
                  />
                  <DashboardCard 
                    title="Leave Days" 
                    value={summary.leave} 
                    color="sky"
                    description="Days on leave"
                  />
                </div>
              )}

              {summary && (
                <div className="card card-glass mb-8">
                  <div className="card-body">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[rgba(59, 130, 246, 0.15)] rounded-xl flex items-center justify-center">
                          <TrendingUp className="text-[var(--info)]" size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Overall Attendance</h3>
                          <p className="text-sm text-[var(--text-muted)]">Your attendance performance</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold text-[var(--text-primary)]">
                          {summary.attendance_percentage}%
                        </div>
                        <div className={`text-sm font-semibold ${
                          getAttendanceStatus(summary.attendance_percentage).color === 'emerald' ? 'text-[var(--primary)]' : 
                          getAttendanceStatus(summary.attendance_percentage).color === 'amber' ? 'text-[var(--warning)]' : 
                          'text-[var(--danger)]'
                        }`}>
                          {getAttendanceStatus(summary.attendance_percentage).label}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          summary.attendance_percentage >= 90 ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]' :
                          summary.attendance_percentage >= 75 ? 'bg-gradient-to-r from-[var(--warning)] to-amber-500' :
                          'bg-gradient-to-r from-[var(--danger)] to-red-500'
                        }`}
                        style={{ width: `${Math.min(summary.attendance_percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {report && (
                <div className="card card-glass">
                  <div className="card-header">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="text-[var(--info)]" size={24} />
                        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                          Monthly Report - {new Date(year, month - 1).toLocaleDateString('en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </h2>
                      </div>
                      <div className="flex gap-3">
                        <select
                          value={month}
                          onChange={(e) => setMonth(Number(e.target.value))}
                          className="input select w-auto"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                            <option key={m} value={m}>
                              {new Date(2024, m - 1).toLocaleDateString('en-US', { month: 'long' })}
                            </option>
                          ))}
                        </select>
                        <select
                          value={year}
                          onChange={(e) => setYear(Number(e.target.value))}
                          className="input select w-auto"
                        >
                          {[2023, 2024, 2025, 2026].map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      <div className="p-4 bg-[rgba(16, 185, 129, 0.15)] rounded-xl border border-[rgba(16, 185, 129, 0.3)]">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="text-[var(--primary)]" size={20} />
                          <span className="text-sm font-medium text-[var(--text-secondary)]">Present</span>
                        </div>
                        <div className="text-3xl font-bold text-[var(--primary)]">{report.present}</div>
                      </div>
                      <div className="p-4 bg-[rgba(239, 68, 68, 0.15)] rounded-xl border border-[rgba(239, 68, 68, 0.3)]">
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="text-[var(--danger)]" size={20} />
                          <span className="text-sm font-medium text-[var(--text-secondary)]">Absent</span>
                        </div>
                        <div className="text-3xl font-bold text-[var(--danger)]">{report.absent}</div>
                      </div>
                      <div className="p-4 bg-[rgba(14, 165, 233, 0.15)] rounded-xl border border-[rgba(14, 165, 233, 0.3)]">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="text-sky-400" size={20} />
                          <span className="text-sm font-medium text-[var(--text-secondary)]">Leave</span>
                        </div>
                        <div className="text-3xl font-bold text-sky-400">{report.leave}</div>
                      </div>
                      <div className="p-4 bg-[rgba(245, 158, 11, 0.15)] rounded-xl border border-[rgba(245, 158, 11, 0.3)]">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="text-[var(--warning)]" size={20} />
                          <span className="text-sm font-medium text-[var(--text-secondary)]">Half Day</span>
                        </div>
                        <div className="text-3xl font-bold text-[var(--warning)]">{report.half_day}</div>
                      </div>
                    </div>

                    <div className="p-6 bg-[rgba(59, 130, 246, 0.15)] rounded-xl border border-[rgba(59, 130, 246, 0.3)] mb-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">Monthly Attendance Rate</p>
                          <p className="text-xs text-[var(--text-muted)]">Based on {report.total_days} working days</p>
                        </div>
                        <div className="text-4xl font-bold text-[var(--info)]">{report.attendance_percentage}%</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Daily Calendar View</h3>
                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div key={day} className="text-center text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide py-2">
                            {day}
                          </div>
                        ))}
                        {report.daily_records.length > 0 ? (
                          report.daily_records.map((record) => {
                            const dateObj = new Date(record.date)
                            const dayOfWeek = dateObj.getDay()
                            const dayOfMonth = dateObj.getDate()
                            
                            return (
                              <div
                                key={record.id}
                                className={`p-3 rounded-xl text-center border cursor-pointer hover:scale-105 transition-transform ${
                                  record.status === 'present' ? 'bg-[rgba(16, 185, 129, 0.15)] text-[var(--primary)] border-[rgba(16, 185, 129, 0.3)]' :
                                  record.status === 'absent' ? 'bg-[rgba(239, 68, 68, 0.15)] text-[var(--danger)] border-[rgba(239, 68, 68, 0.3)]' :
                                  record.status === 'leave' ? 'bg-[rgba(14, 165, 233, 0.15)] text-sky-400 border-[rgba(14, 165, 233, 0.3)]' :
                                  record.status === 'half_day' ? 'bg-[rgba(245, 158, 11, 0.15)] text-[var(--warning)] border-[rgba(245, 158, 11, 0.3)]' :
                                  'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border-[var(--border)]'
                                }`}
                                title={`${dayOfMonth} - ${record.status}`}
                              >
                                <div className="flex justify-center mb-1">
                                  {getStatusIcon(record.status)}
                                </div>
                                <div className="text-sm font-semibold">{dayOfMonth}</div>
                              </div>
                            )
                          })
                        ) : (
                          <div className="col-span-7 text-center text-[var(--text-muted)] py-8 bg-[var(--bg-tertiary)] rounded-xl">
                            No records for this month
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
