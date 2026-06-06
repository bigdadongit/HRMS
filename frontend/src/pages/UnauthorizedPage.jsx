import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'

export function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
      <div className="max-w-md w-full card card-glass p-8 text-center">
        <div className="w-20 h-20 bg-[rgba(239, 68, 68, 0.15)] rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock size={40} className="text-[var(--danger)]" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Access Denied</h1>
        <p className="text-[var(--text-secondary)] mb-8">
          You do not have permission to access this resource. Please contact your administrator.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-primary w-full"
        >
          Go Back
        </button>
      </div>
    </div>
  )
}
