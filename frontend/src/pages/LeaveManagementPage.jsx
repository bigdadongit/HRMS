import React, { useState, useEffect } from 'react'
import { Calendar, Check, X, Clock } from 'lucide-react'
import apiClient from '../services/api'
import { DashboardCard, Sidebar, LoadingSpinner, ErrorAlert, SuccessAlert } from '../components/shared'
import { useAuth } from '../hooks/useAuth'

export const LeaveManagementPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('apply') // apply, history, pending
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
    const statusClass = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    }[status] || 'bg-gray-100 text-gray-800'
    
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}>{status}</span>
  }

  return (
    <div className="flex h-screen bg-gray-100">
  <Sidebar />
      
  <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Leave Management</h1>
            <p className="text-gray-600">Manage your leave requests and approvals</p>
          </div>

          {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
          {success && <SuccessAlert message={success} onDismiss={() => setSuccess(null)} />}

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => { setActiveTab('apply'); setCurrentPage(1) }}
              className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                activeTab === 'apply'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              Apply Leave
            </button>
            <button
              onClick={() => { setActiveTab('history'); setCurrentPage(1) }}
              className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              History
            </button>
            {user?.role === 'hr' && (
              <button
                onClick={() => { setActiveTab('pending'); setCurrentPage(1) }}
                className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                  activeTab === 'pending'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
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
              {/* Apply Leave Tab */}
              {activeTab === 'apply' && (
                <div className="bg-white rounded-lg shadow p-6">
                  {balance && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <DashboardCard title="Casual Leave" value={balance.casual_leave_balance} />
                      <DashboardCard title="Sick Leave" value={balance.sick_leave_balance} />
                      <DashboardCard title="Earned Leave" value={balance.earned_leave_balance} />
                    </div>
                  )}

                  <form onSubmit={handleSubmitLeave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                          type="date"
                          required
                          value={formData.start_date}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                          type="date"
                          required
                          value={formData.end_date}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                      <select
                        required
                        value={formData.leave_type}
                        onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="casual_leave">Casual Leave</option>
                        <option value="sick_leave">Sick Leave</option>
                        <option value="earned_leave">Earned Leave</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                      <textarea
                        required
                        rows="4"
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        placeholder="Please provide reason for your leave..."
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
                    >
                      Submit Leave Request
                    </button>
                  </form>
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Start Date</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">End Date</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Type</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Reason</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaves.map((leave) => (
                        <tr key={leave.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-4">{new Date(leave.start_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4">{new Date(leave.end_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm">{leave.leave_type.replace('_', ' ')}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{leave.reason}</td>
                          <td className="px-6 py-4">{getStatusBadge(leave.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pending Requests Tab */}
              {activeTab === 'pending' && user?.role === 'hr' && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Employee</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Start Date</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">End Date</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Type</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingLeaves.map((leave) => (
                        <tr key={leave.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm">Employee {leave.employee_id.slice(0, 8)}</td>
                          <td className="px-6 py-4 text-sm">{new Date(leave.start_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm">{new Date(leave.end_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm">{leave.leave_type.replace('_', ' ')}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(leave.id)}
                                className="text-green-600 hover:text-green-800 p-1"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() => handleReject(leave.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeaveManagementPage
