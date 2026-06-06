import React, { useState, useEffect } from 'react'
import { Calendar, Check, X, Clock, FileText, Send, CalendarDays, Briefcase, Heart } from 'lucide-react'
import apiClient from '../services/api'
import { DashboardCard, Sidebar, LoadingSpinner, ErrorAlert, SuccessAlert } from '../components/shared'
import { useAuth } from '../hooks/useAuth'

export const LeaveManagementPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('apply')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [leaves, setLeaves] = useState([])
  const [balance, setBalance] = useState(null)
  const [pendingLeaves, setPendingLeaves] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [employeeId, setEmployeeId] = useState(null)

  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    leave_type: 'casual_leave',
    reason: ''
  })

  useEffect(() => {
    const init = async () => {
      try {
        const profileRes = await apiClient.get('/employees/profile')
        setEmployeeId(profileRes.data.data.id)
      } catch (err) {
        setError('Failed to load employee profile')
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (employeeId) {
      if (activeTab === 'apply') {
        fetchBalance()
      } else if (activeTab === 'history') {
        fetchLeaveHistory()
      } else if (activeTab === 'pending' && user?.role === 'hr') {
        fetchPendingLeaves()
      }
    }
  }, [activeTab, employeeId, currentPage])

  const fetchBalance = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get(`/leaves/balance/${employeeId}`)
      setBalance(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leave balance')
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaveHistory = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get(`/leaves/history/${employeeId}?page=${currentPage}&per_page=10`)
      setLeaves(res.data.data.data)
      setTotalPages(res.data.data.pages)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leave history')
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingLeaves = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get(`/leaves/pending?page=${currentPage}&per_page=10`)
      setPendingLeaves(res.data.data.data)
      setTotalPages(res.data.data.pages)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pending leaves')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitLeave = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      await apiClient.post('/leaves/apply', formData)
      setSuccess('Leave request submitted successfully')
      setFormData({
        start_date: '',
        end_date: '',
        leave_type: 'casual_leave',
        reason: ''
      })
      fetchBalance()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request')
    }
  }

  const handleApprove = async (leaveId) => {
    try {
      await apiClient.post(`/leaves/${leaveId}/approve`)
      setSuccess('Leave approved successfully')
      fetchPendingLeaves()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve leave')
    }
  }

  const handleReject = async (leaveId) => {
    try {
      await apiClient.post(`/leaves/${leaveId}/reject`)
      setSuccess('Leave rejected successfully')
      fetchPendingLeaves()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject leave')
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { class: 'badge-warning', icon: Clock },
      'approved': { class: 'badge-success', icon: Check },
      'rejected': { class: 'badge-danger', icon: X },
      'cancelled': { class: 'badge-info', icon: X }
    }
    const config = statusConfig[status] || statusConfig.cancelled
    const Icon = config.icon
    return (
      <span className={`badge ${config.class} flex items-center gap-1`}>
        <Icon size={12} />
        {status}
      </span>
    )
  }

  const getLeaveTypeIcon = (type) => {
    switch (type) {
      case 'casual_leave': return <Briefcase size={16} />
      case 'sick_leave': return <Heart size={16} />
      case 'earned_leave': return <CalendarDays size={16} />
      default: return <FileText size={16} />
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
                <FileText className="text-[var(--info)]" size={20} />
              </div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">Leave Management</h1>
            </div>
            <p className="text-[var(--text-secondary)] ml-13">Manage your leave requests and approvals</p>
          </div>

          {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
          {success && <SuccessAlert message={success} onDismiss={() => setSuccess(null)} />}

          <div className="flex gap-2 mb-8 bg-[var(--bg-secondary)] rounded-xl p-2 border border-[var(--border)] w-fit">
            <button
              onClick={() => { setActiveTab('apply'); setCurrentPage(1) }}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'apply'
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
              }`}
            >
              Apply Leave
            </button>
            <button
              onClick={() => { setActiveTab('history'); setCurrentPage(1) }}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
              }`}
            >
              History
            </button>
            {user?.role === 'hr' && (
              <button
                onClick={() => { setActiveTab('pending'); setCurrentPage(1) }}
                className={`px-6 py-3 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'pending'
                    ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white shadow-md'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                }`}
              >
                Pending Requests
              </button>
            )}
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {activeTab === 'apply' && (
                <div className="card card-glass">
                  <div className="card-body">
                    {balance && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <DashboardCard 
                          title="Casual Leave" 
                          value={balance.casual_leave_balance} 
                          color="blue"
                          description="Days available"
                        />
                        <DashboardCard 
                          title="Sick Leave" 
                          value={balance.sick_leave_balance} 
                          color="emerald"
                          description="Days available"
                        />
                        <DashboardCard 
                          title="Earned Leave" 
                          value={balance.earned_leave_balance} 
                          color="sky"
                          description="Days available"
                        />
                      </div>
                    )}

                    <form onSubmit={handleSubmitLeave} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                          <label className="form-label">Start Date</label>
                          <input
                            type="date"
                            required
                            value={formData.start_date}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            className="input"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">End Date</label>
                          <input
                            type="date"
                            required
                            value={formData.end_date}
                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            className="input"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Leave Type</label>
                        <select
                          required
                          value={formData.leave_type}
                          onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                          className="input select"
                        >
                          <option value="casual_leave">Casual Leave</option>
                          <option value="sick_leave">Sick Leave</option>
                          <option value="earned_leave">Earned Leave</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Reason</label>
                        <textarea
                          required
                          rows="4"
                          value={formData.reason}
                          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                          placeholder="Please provide reason for your leave..."
                          className="input textarea"
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary w-full btn-lg"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Send size={18} />
                          Submit Leave Request
                        </span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="card card-glass">
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Date Range</th>
                          <th>Type</th>
                          <th>Reason</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaves.map((leave) => (
                          <tr key={leave.id}>
                            <td>
                              <div className="flex flex-col">
                                <span className="font-medium text-[var(--text-primary)]">{new Date(leave.start_date).toLocaleDateString()}</span>
                                <span className="text-sm text-[var(--text-muted)]">to {new Date(leave.end_date).toLocaleDateString()}</span>
                              </div>
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                {getLeaveTypeIcon(leave.leave_type)}
                                <span className="text-sm text-[var(--text-secondary)]">{leave.leave_type.replace('_', ' ')}</span>
                              </div>
                            </td>
                            <td className="text-sm text-[var(--text-secondary)] max-w-xs truncate">{leave.reason}</td>
                            <td>{getStatusBadge(leave.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'pending' && user?.role === 'hr' && (
                <div className="card card-glass">
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Employee</th>
                          <th>Date Range</th>
                          <th>Type</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingLeaves.map((leave) => (
                          <tr key={leave.id}>
                            <td>
                              <span className="text-sm font-medium text-[var(--text-primary)]">Employee {leave.employee_id.slice(0, 8)}</span>
                            </td>
                            <td>
                              <div className="flex flex-col">
                                <span className="font-medium text-[var(--text-primary)]">{new Date(leave.start_date).toLocaleDateString()}</span>
                                <span className="text-sm text-[var(--text-muted)]">to {new Date(leave.end_date).toLocaleDateString()}</span>
                              </div>
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                {getLeaveTypeIcon(leave.leave_type)}
                                <span className="text-sm text-[var(--text-secondary)]">{leave.leave_type.replace('_', ' ')}</span>
                              </div>
                            </td>
                            <td>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprove(leave.id)}
                                  className="btn btn-sm btn-secondary text-[var(--primary)] hover:text-emerald-400 hover:border-emerald-400"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={() => handleReject(leave.id)}
                                  className="btn btn-sm btn-secondary text-[var(--danger)] hover:text-red-500 hover:border-red-500"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
