import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle responses globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    // Redirect on unauthorized / forbidden
    if (status === 401) {
      // token invalid or missing
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else if (status === 403) {
      window.location.href = '/unauthorized'
    }
    return Promise.reject(error)
  }
)

export default apiClient
