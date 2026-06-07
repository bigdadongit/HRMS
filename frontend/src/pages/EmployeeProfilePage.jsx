import React, { useState, useEffect } from 'react'
import { User, Calendar, Briefcase, Mail, Phone, MapPin } from 'lucide-react'
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
      <div className="flex h-screen bg-gray-100">
  <Sidebar />
  <div className="flex-1 ml-64 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
  <Sidebar />
      
  <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your personal information</p>
          </div>

          {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
          {success && <SuccessAlert message={success} onDismiss={() => setSuccess(null)} />}

          {profile && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <User size={48} className="text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {profile.first_name} {profile.last_name}
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">{profile.designation}</p>
                    <div className="mt-4 w-full border-t border-gray-200 pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{profile.role}</div>
                        <div className="text-xs text-gray-600">Role</div>
                      </div>
                    </div>
                    <div className="mt-4 w-full">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        profile.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {profile.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {isEditing ? (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              First Name
                            </label>
                            <input
                              type="text"
                              value={formData.first_name}
                              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Last Name
                            </label>
                            <input
                              type="text"
                              value={formData.last_name}
                              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Department
                          </label>
                          <input
                            type="text"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Designation
                          </label>
                          <input
                            type="text"
                            value={formData.designation}
                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="flex gap-3 pt-4">
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-6">
                        {/* Contact Information */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4">Contact Information</h4>
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <Mail size={20} className="text-gray-400" />
                              <div>
                                <div className="text-sm text-gray-600">Email</div>
                                <div className="font-medium text-gray-900">{profile.email}</div>
                              </div>
                            </div>
                            {profile.phone && (
                              <div className="flex items-center gap-3">
                                <Phone size={20} className="text-gray-400" />
                                <div>
                                  <div className="text-sm text-gray-600">Phone</div>
                                  <div className="font-medium text-gray-900">{profile.phone}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Professional Information */}
                        <div className="border-t border-gray-200 pt-6">
                          <h4 className="font-semibold text-gray-900 mb-4">Professional Information</h4>
                          <div className="space-y-4">
                            {profile.department && (
                              <div className="flex items-center gap-3">
                                <Briefcase size={20} className="text-gray-400" />
                                <div>
                                  <div className="text-sm text-gray-600">Department</div>
                                  <div className="font-medium text-gray-900">{profile.department}</div>
                                </div>
                              </div>
                            )}
                            {profile.designation && (
                              <div className="flex items-center gap-3">
                                <Briefcase size={20} className="text-gray-400" />
                                <div>
                                  <div className="text-sm text-gray-600">Designation</div>
                                  <div className="font-medium text-gray-900">{profile.designation}</div>
                                </div>
                              </div>
                            )}
                            {profile.joining_date && (
                              <div className="flex items-center gap-3">
                                <Calendar size={20} className="text-gray-400" />
                                <div>
                                  <div className="text-sm text-gray-600">Joining Date</div>
                                  <div className="font-medium text-gray-900">
                                    {new Date(profile.joining_date).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Account Information */}
                        <div className="border-t border-gray-200 pt-6">
                          <h4 className="font-semibold text-gray-900 mb-4">Account Information</h4>
                          <div className="space-y-4">
                            <div>
                              <div className="text-sm text-gray-600">Created</div>
                              <div className="font-medium text-gray-900">
                                {new Date(profile.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Last Updated</div>
                              <div className="font-medium text-gray-900">
                                {new Date(profile.updated_at).toLocaleDateString()}
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

export default EmployeeProfilePage
