import apiClient from './api'

export const authService = {
  register: async (email, password, firstName, lastName, role = 'employee') => {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      role
    })
    return response.data
  },

  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password
    })
    return response.data
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout')
    return response.data
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me')
    return response.data
  }
}

export const dashboardService = {
  getAdminDashboard: async () => {
    const response = await apiClient.get('/dashboard/admin')
    return response.data
  },

  getHRDashboard: async () => {
    const response = await apiClient.get('/dashboard/hr')
    return response.data
  },

  getManagerDashboard: async () => {
    const response = await apiClient.get('/dashboard/manager')
    return response.data
  },

  getEmployeeDashboard: async () => {
    const response = await apiClient.get('/dashboard/employee')
    return response.data
  }
}

export const employeeService = {
  getAllEmployees: async () => {
    const response = await apiClient.get('/employees')
    return response.data
  },

  getEmployee: async (employeeId) => {
    const response = await apiClient.get(`/employees/${employeeId}`)
    return response.data
  },

  updateEmployee: async (employeeId, data) => {
    const response = await apiClient.put(`/employees/${employeeId}`, data)
    return response.data
  }
}
