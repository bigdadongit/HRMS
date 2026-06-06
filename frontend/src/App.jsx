import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { UnauthorizedPage } from './pages/UnauthorizedPage'
import { AdminDashboard } from './pages/AdminDashboard'
import { HRDashboard } from './pages/HRDashboard'
import { ManagerDashboard } from './pages/ManagerDashboard'
import { EmployeeDashboard } from './pages/EmployeeDashboard'
import { EmployeeManagement } from './pages/EmployeeManagement'
import { AttendancePage } from './pages/AttendancePage'
import { LeaveManagementPage } from './pages/LeaveManagementPage'
import { EmployeeProfilePage } from './pages/EmployeeProfilePage'
import { ResumeScreeningPage } from './pages/ResumeScreeningPage'
import { InterviewRoomPage } from './pages/InterviewRoomPage'
import { InterviewResultsPage } from './pages/InterviewResultsPage'
import { InterviewAnalyticsPage } from './pages/InterviewAnalyticsPage'
import { HRCopilotPage } from './pages/HRCopilotPage'
import './index.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* HR Routes */}
          <Route
            path="/hr/dashboard"
            element={
              <ProtectedRoute requiredRoles={['hr']}>
                <HRDashboard />
              </ProtectedRoute>
            }
          />

          {/* Manager Routes */}
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute requiredRoles={['manager']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Employee Routes */}
          <Route
            path="/employee/dashboard"
            element={
              <ProtectedRoute requiredRoles={['employee']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          {/* Shared Routes - Employee Management */}
          <Route
            path="/employees"
            element={
              <ProtectedRoute requiredRoles={['admin', 'hr']}>
                <EmployeeManagement />
              </ProtectedRoute>
            }
          />

          {/* Attendance Routes */}
          <Route
            path="/attendance"
            element={
              <ProtectedRoute requiredRoles={['employee', 'admin', 'hr', 'manager']}>
                <AttendancePage />
              </ProtectedRoute>
            }
          />

          {/* Leave Management Routes */}
          <Route
            path="/leaves"
            element={
              <ProtectedRoute requiredRoles={['employee', 'admin', 'hr', 'manager']}>
                <LeaveManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Profile Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute requiredRoles={['employee', 'admin', 'hr', 'manager']}>
                <EmployeeProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Resume Screening Routes */}
          <Route
            path="/resume-screening"
            element={
              <ProtectedRoute requiredRoles={['admin', 'hr']}>
                <ResumeScreeningPage />
              </ProtectedRoute>
            }
          />

          {/* Interview Routes */}
          <Route
            path="/interview-room"
            element={
              <ProtectedRoute requiredRoles={['admin', 'hr']}>
                <InterviewRoomPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview-results"
            element={
              <ProtectedRoute requiredRoles={['admin', 'hr']}>
                <InterviewResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview-analytics"
            element={
              <ProtectedRoute requiredRoles={['admin', 'hr']}>
                <InterviewAnalyticsPage />
              </ProtectedRoute>
            }
          />

          {/* HR Copilot Routes */}
          <Route
            path="/hr-copilot"
            element={
              <ProtectedRoute requiredRoles={['admin', 'hr']}>
                <HRCopilotPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
