import React, { useState, useEffect } from 'react'
import { Calendar, BarChart3 } from 'lucide-react'
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
      
      // Get employee ID from user profile
      const profileRes = await apiClient.get('/employees/profile')
      const employeeId = profileRes.data.data.id

      // Fetch monthly report
      const reportRes = await apiClient.get(
        `/attendance/monthly-report/${employeeId}?month=${month}&year=${year}`
      )
      setReport(reportRes.data.data)

      // Fetch summary
      const summaryRes = await apiClient.get(`/attendance/summary/${employeeId}`)
      setSummary(summaryRes.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch attendance data')
    } finally {
      setLoading(false)
    }
  }

  const getAttendancePercentageColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="flex h-screen bg-gray-100">
  <Sidebar />
      
  <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance</h1>
            <p className="text-gray-600">Track and view your attendance records</p>
          </div>

          {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {/* Summary Cards */}
              {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <DashboardCard title="Total Records" value={summary.total_records} />
                  <DashboardCard title="Present" value={summary.present} />
                  <DashboardCard title="Absent" value={summary.absent} />
                  <DashboardCard title="Leaves" value={summary.leave} />
                </div>
              )}

              {/* Attendance Percentage */}
              {summary && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Attendance</h3>
                      <p className="text-gray-600 text-sm">Your overall attendance percentage</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-5xl font-bold ${getAttendancePercentageColor(summary.attendance_percentage)}`}>
                        {summary.attendance_percentage}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        summary.attendance_percentage >= 90 ? 'bg-green-500' :
                        summary.attendance_percentage >= 75 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(summary.attendance_percentage, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Monthly Report */}
              {report && (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Calendar size={24} className="text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Monthly Report - {new Date(year, month - 1).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </h2>
                  </div>

                  {/* Month/Year Selector */}
                  <div className="flex gap-4 mb-6">
                    <select
                      value={month}
                      onChange={(e) => setMonth(Number(e.target.value))}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[2023, 2024, 2025, 2026].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{report.present}</div>
                      <div className="text-sm text-gray-600">Present</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{report.absent}</div>
                      <div className="text-sm text-gray-600">Absent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{report.leave}</div>
                      <div className="text-sm text-gray-600">Leave</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{report.half_day}</div>
                      <div className="text-sm text-gray-600">Half Day</div>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-blue-50 rounded mb-6">
                    <div className="text-3xl font-bold text-blue-600">{report.attendance_percentage}%</div>
                    <div className="text-sm text-gray-600">Attendance Percentage</div>
                  </div>

                  {/* Daily Records */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Records</h3>
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="text-center text-sm font-semibold text-gray-600 p-2">
                          {day}
                        </div>
                      ))}
                      {report.daily_records.length > 0 ? (
                        report.daily_records.map((record) => {
                          const dateObj = new Date(record.date)
                          const dayOfWeek = dateObj.getDay()
                          const dayOfMonth = dateObj.getDate()
                          
                          const statusColor = {
                            'present': 'bg-green-100 text-green-800',
                            'absent': 'bg-red-100 text-red-800',
                            'leave': 'bg-blue-100 text-blue-800',
                            'half_day': 'bg-yellow-100 text-yellow-800'
                          }[record.status] || 'bg-gray-100 text-gray-800'
                          
                          return (
                            <div
                              key={record.id}
                              className={`p-2 rounded text-center text-sm font-medium ${statusColor}`}
                              title={`${dayOfMonth} - ${record.status}`}
                            >
                              {dayOfMonth}
                            </div>
                          )
                        })
                      ) : (
                        <div className="col-span-7 text-center text-gray-600 py-4">
                          No records for this month
                        </div>
                      )}
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

export default AttendancePage
