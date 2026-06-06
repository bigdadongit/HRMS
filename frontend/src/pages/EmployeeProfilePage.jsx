import React, { useState, useEffect } from 'react'
import { User, Calendar, Briefcase, Mail, Phone, MapPin, Edit2, X, Building2 } from 'lucide-react'
import apiClient from '../services/api'
import { Sidebar, LoadingSpinner, ErrorAlert, SuccessAlert } from '../components/shared'
import { useAuth } from '../hooks/useAuth'

export const EmployeeProfilePage = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    department: '',
    designation: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/employees/profile')
      setProfile(res.data.data)
      setFormData({
        first_name: res.data.data.first_name,
        last_name: res.data.data.last_name,
        phone: res.data.data.phone || '',
        department: res.data.data.department || '',
        designation: res.data.data.designation || ''
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      const res = await apiClient.put(`/employees/${profile.id}`, formData)
      setProfile(res.data.data)
      setSuccess('Profile updated successfully')
      setIsEditing(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[rgba(59, 130, 246, 0.15)] rounded-xl flex items-center justify-center">
                <User className="text-[var(--info)]" size={20} />
              </div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">My Profile</h1>
            </div>
            <p className="text-[var(--text-secondary)] ml-13">Manage your personal information</p>
          </div>

          {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
          {success && <SuccessAlert message={success} onDismiss={() => setSuccess(null)} />}

          {profile && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="card card-glass sticky top-8">
                  <div className="card-body">
                    <div className="flex flex-col items-center">
                      <div className="w-28 h-28 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <span className="text-white font-bold text-3xl">
                          {profile.first_name[0]}{profile.last_name[0]}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-[var(--text-primary)]">
                        {profile.first_name} {profile.last_name}
                      </h2>
                      <p className="text-[var(--text-muted)] text-sm mt-1">{profile.designation || 'Employee'}</p>
                      
                      <div className="mt-6 w-full p-4 bg-[rgba(59, 130, 246, 0.15)] rounded-xl border border-[rgba(59, 130, 246, 0.3)]">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[var(--info)] capitalize">{profile.role}</div>
                          <div className="text-xs text-[var(--text-muted)] mt-1">Role</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 w-full">
                        <span className={`badge ${
                          profile.status === 'active' 
                            ? 'badge-success'
                            : 'badge-warning'
                        }`}>
                          {profile.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="card card-glass">
                  <div className="card-header flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">Personal Information</h3>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="btn btn-sm btn-secondary"
                      >
                        <span className="flex items-center gap-2">
                          <Edit2 size={16} />
                          Edit Profile
                        </span>
                      </button>
                    )}
                  </div>

                  <div className="card-body">
                    {isEditing ? (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="form-group">
                            <label className="form-label">First Name</label>
                            <input
                              type="text"
                              value={formData.first_name}
                              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                              className="input"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Last Name</label>
                            <input
                              type="text"
                              value={formData.last_name}
                              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                              className="input"
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Phone</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="input"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Department</label>
                          <input
                            type="text"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className="input"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Designation</label>
                          <input
                            type="text"
                            value={formData.designation}
                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                            className="input"
                          />
                        </div>

                        <div className="flex gap-3 pt-4">
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="btn btn-secondary flex-1"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary flex-1"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-8">
                        <div>
                          <h4 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-4">Contact Information</h4>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border)]">
                              <div className="w-10 h-10 bg-[rgba(59, 130, 246, 0.15)] rounded-lg flex items-center justify-center">
                                <Mail size={20} className="text-[var(--info)]" />
                              </div>
                              <div>
                                <div className="text-sm text-[var(--text-muted)]">Email</div>
                                <div className="font-medium text-[var(--text-primary)]">{profile.email}</div>
                              </div>
                            </div>
                            {profile.phone && (
                              <div className="flex items-center gap-4 p-4 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border)]">
                                <div className="w-10 h-10 bg-[rgba(16, 185, 129, 0.15)] rounded-lg flex items-center justify-center">
                                  <Phone size={20} className="text-[var(--primary)]" />
                                </div>
                                <div>
                                  <div className="text-sm text-[var(--text-muted)]">Phone</div>
                                  <div className="font-medium text-[var(--text-primary)]">{profile.phone}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="border-t border-[var(--border)] pt-8">
                          <h4 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-4">Professional Information</h4>
                          <div className="space-y-4">
                            {profile.department && (
                              <div className="flex items-center gap-4 p-4 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border)]">
                                <div className="w-10 h-10 bg-[rgba(14, 165, 233, 0.15)] rounded-lg flex items-center justify-center">
                                  <Building2 size={20} className="text-sky-400" />
                                </div>
                                <div>
                                  <div className="text-sm text-[var(--text-muted)]">Department</div>
                                  <div className="font-medium text-[var(--text-primary)]">{profile.department}</div>
                                </div>
                              </div>
                            )}
                            {profile.designation && (
                              <div className="flex items-center gap-4 p-4 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border)]">
                                <div className="w-10 h-10 bg-[rgba(245, 158, 11, 0.15)] rounded-lg flex items-center justify-center">
                                  <Briefcase size={20} className="text-[var(--warning)]" />
                                </div>
                                <div>
                                  <div className="text-sm text-[var(--text-muted)]">Designation</div>
                                  <div className="font-medium text-[var(--text-primary)]">{profile.designation}</div>
                                </div>
                              </div>
                            )}
                            {profile.joining_date && (
                              <div className="flex items-center gap-4 p-4 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border)]">
                                <div className="w-10 h-10 bg-[rgba(239, 68, 68, 0.15)] rounded-lg flex items-center justify-center">
                                  <Calendar size={20} className="text-[var(--danger)]" />
                                </div>
                                <div>
                                  <div className="text-sm text-[var(--text-muted)]">Joining Date</div>
                                  <div className="font-medium text-[var(--text-primary)]">
                                    {new Date(profile.joining_date).toLocaleDateString('en-US', { 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="border-t border-[var(--border)] pt-8">
                          <h4 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-4">Account Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border)]">
                              <div className="text-sm text-[var(--text-muted)] mb-1">Created</div>
                              <div className="font-medium text-[var(--text-primary)]">
                                {new Date(profile.created_at).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </div>
                            </div>
                            <div className="p-4 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border)]">
                              <div className="text-sm text-[var(--text-muted)] mb-1">Last Updated</div>
                              <div className="font-medium text-[var(--text-primary)]">
                                {new Date(profile.updated_at).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
