import React, { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Users, Building, Briefcase, X } from 'lucide-react'
import apiClient from '../services/api'
import { DashboardCard, Sidebar, LoadingSpinner, ErrorAlert, SuccessAlert } from '../components/shared'

export const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalEmployees, setTotalEmployees] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    joining_date: '',
    status: 'active'
  })

  const perPage = 10

  useEffect(() => {
    fetchEmployees()
  }, [currentPage, searchQuery])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let url = `/employees?page=${currentPage}&per_page=${perPage}`
      if (searchQuery) {
        url += `&search=${searchQuery}`
      }
      
      const response = await apiClient.get(url)
      setEmployees(response.data.data.data)
      setTotalPages(response.data.data.pages)
      setTotalEmployees(response.data.data.total)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employees')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingId(null)
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      department: '',
      designation: '',
      joining_date: '',
      status: 'active'
    })
    setShowModal(true)
  }

  const handleEdit = (employee) => {
    setEditingId(employee.id)
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone: employee.phone || '',
      department: employee.department || '',
      designation: employee.designation || '',
      joining_date: employee.joining_date ? employee.joining_date.split('T')[0] : '',
      status: employee.status
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      
      if (editingId) {
        await apiClient.put(`/employees/${editingId}`, formData)
        setSuccess('Employee updated successfully')
      } else {
        await apiClient.post('/employees', formData)
        setSuccess('Employee created successfully')
      }
      
      setShowModal(false)
      fetchEmployees()
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await apiClient.delete(`/employees/${id}`)
        setSuccess('Employee deleted successfully')
        fetchEmployees()
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete employee')
      }
    }
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { class: 'badge-success', label: 'Active' },
      'inactive': { class: 'badge-warning', label: 'Inactive' },
      'terminated': { class: 'badge-danger', label: 'Terminated' }
    }
    const config = statusConfig[status] || statusConfig.inactive
    return <span className={`badge ${config.class}`}>{config.label}</span>
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[rgba(59, 130, 246, 0.15)] rounded-xl flex items-center justify-center">
                <Users className="text-[var(--info)]" size={20} />
              </div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">Employee Management</h1>
            </div>
            <p className="text-[var(--text-secondary)] ml-13">Manage employee information and records</p>
          </div>

          {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
          {success && <SuccessAlert message={success} onDismiss={() => setSuccess(null)} />}

          <div className="card card-glass">
            <div className="card-header">
              <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" size={20} />
                  <input
                    type="text"
                    placeholder="Search by name, email, or department..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="input pl-10"
                  />
                </div>
                <button
                  onClick={handleAdd}
                  className="btn btn-primary"
                >
                  <span className="flex items-center gap-2">
                    <Plus size={18} />
                    Add Employee
                  </span>
                </button>
              </div>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Designation</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((employee) => (
                        <tr key={employee.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center text-white font-semibold">
                                {employee.first_name[0]}{employee.last_name[0]}
                              </div>
                              <div>
                                <div className="font-medium text-[var(--text-primary)]">
                                  {employee.first_name} {employee.last_name}
                                </div>
                                <div className="text-sm text-[var(--text-muted)]">{employee.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <Building size={16} className="text-[var(--text-muted)]" />
                              <span className="text-sm text-[var(--text-secondary)]">{employee.department || '-'}</span>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <Briefcase size={16} className="text-[var(--text-muted)]" />
                              <span className="text-sm text-[var(--text-secondary)]">{employee.designation || '-'}</span>
                            </div>
                          </td>
                          <td>{getStatusBadge(employee.status)}</td>
                          <td className="text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleEdit(employee)}
                                className="btn btn-sm btn-secondary text-[var(--info)] hover:text-[var(--primary)] hover:border-[var(--primary)]"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(employee.id)}
                                className="btn btn-sm btn-secondary text-[var(--danger)] hover:text-red-500 hover:border-red-500"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="card-footer">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[var(--text-muted)]">
                      Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, totalEmployees)} of {totalEmployees} employees
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="btn btn-sm btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`btn btn-sm ${
                              currentPage === page
                                ? 'btn-primary'
                                : 'btn-secondary'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="btn btn-sm btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card card-glass w-full max-w-lg shadow-custom-lg">
            <div className="card-header flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                {editingId ? 'Edit Employee' : 'Add Employee'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="card-body space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    className="input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  placeholder="+1 234 567 890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  placeholder="Engineering"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Designation</label>
                <input
                  type="text"
                  placeholder="Software Engineer"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Joining Date</label>
                <input
                  type="date"
                  value={formData.joining_date}
                  onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input select"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
