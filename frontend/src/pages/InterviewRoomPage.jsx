import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar, LoadingSpinner } from '../components/shared'
import { useAuth } from '../hooks/useAuth'
import { MessageSquare, Send, CheckCircle, ArrowRight, Clock, User } from 'lucide-react'

export function InterviewRoomPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'
  
  // Interview creation state
  const [candidateName, setCandidateName] = useState('')
  const [roleApplied, setRoleApplied] = useState('')
  const [creating, setCreating] = useState(false)
  
  // Interview session state
  const [currentInterview, setCurrentInterview] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [submittingAnswer, setSubmittingAnswer] = useState(false)
  
  const [interviews, setInterviews] = useState([])
  const [loadingInterviews, setLoadingInterviews] = useState(true)

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'hr') {
      navigate('/dashboard')
    }
    fetchInterviews()
  }, [user, navigate])

  const fetchInterviews = async () => {
    setLoadingInterviews(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/interview`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setInterviews(data.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching interviews:', error)
    } finally {
      setLoadingInterviews(false)
    }
  }

  const createInterview = async () => {
    if (!candidateName || !roleApplied) {
      alert('Please provide candidate name and role')
      return
    }

    setCreating(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/interview/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ candidate_name: candidateName, role_applied: roleApplied })
      })
      const data = await response.json()
      if (data.success) {
        setCurrentInterview(data.data)
        setCurrentQuestionIndex(0)
        setCurrentAnswer('')
        setCandidateName('')
        setRoleApplied('')
        fetchInterviews()
      } else {
        alert(data.message || 'Failed to create interview')
      }
    } catch (error) {
      console.error('Error creating interview:', error)
      alert('Error creating interview')
    } finally {
      setCreating(false)
    }
  }

  const submitAnswer = async () => {
    if (!currentAnswer.trim()) {
      alert('Please provide an answer')
      return
    }

    setSubmittingAnswer(true)
    try {
      const token = localStorage.getItem('token')
      const currentQuestion = currentInterview.questions[currentQuestionIndex]
      
      const response = await fetch(`${API_BASE}/interview/answer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          interview_id: currentInterview.id,
          question_id: currentQuestion.id,
          answer: currentAnswer
        })
      })
      const data = await response.json()
      if (data.success) {
        setCurrentAnswer('')
        if (currentQuestionIndex < currentInterview.questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
        } else {
          // All questions answered, complete interview
          await completeInterview()
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      alert('Error submitting answer')
    } finally {
      setSubmittingAnswer(false)
    }
  }

  const completeInterview = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/interview/${currentInterview.id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })
      const data = await response.json()
      if (data.success) {
        alert('Interview completed successfully!')
        setCurrentInterview(null)
        setCurrentQuestionIndex(0)
        fetchInterviews()
        navigate('/interview-results')
      }
    } catch (error) {
      console.error('Error completing interview:', error)
      alert('Error completing interview')
    }
  }

  const loadInterview = async (interviewId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/interview/${interviewId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        const interview = data.data
        if (interview.status === 'completed') {
          alert('This interview is already completed')
          navigate('/interview-results')
          return
        }
        setCurrentInterview(interview)
        setCurrentQuestionIndex(interview.answers.length)
        setCurrentAnswer('')
      }
    } catch (error) {
      console.error('Error loading interview:', error)
    }
  }

  if (loadingInterviews) return <LoadingSpinner />

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-64">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">AI Interview Room</h1>
            <p className="text-sm text-[var(--text-secondary)]">Conduct AI-powered interviews with candidates</p>
          </div>

          {!currentInterview ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Create Interview */}
              <div className="card card-glass">
                <div className="card-header">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">Create New Interview</h2>
                </div>
                <div className="card-body space-y-3">
                  <div className="form-group">
                    <label className="form-label">Candidate Name</label>
                    <input
                      type="text"
                      className="input"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="Enter candidate name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role Applied For</label>
                    <input
                      type="text"
                      className="input"
                      value={roleApplied}
                      onChange={(e) => setRoleApplied(e.target.value)}
                      placeholder="e.g., Frontend Developer, Data Scientist"
                    />
                  </div>
                  <button
                    onClick={createInterview}
                    disabled={creating}
                    className="btn btn-primary w-full text-sm"
                  >
                    {creating ? 'Creating...' : 'Start Interview'}
                  </button>
                </div>
              </div>

              {/* Recent Interviews */}
              <div className="card card-glass">
                <div className="card-header">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">Recent Interviews</h2>
                </div>
                <div className="card-body">
                  {interviews.length > 0 ? (
                    <div className="space-y-2">
                      {interviews.slice(0, 5).map((interview) => (
                        <div
                          key={interview.id}
                          className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-xl hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer border border-[var(--border)]"
                          onClick={() => loadInterview(interview.id)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[rgba(59, 130, 246, 0.15)] rounded-xl flex items-center justify-center">
                              <User size={16} className="text-[var(--info)]" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-[var(--text-primary)]">{interview.candidate_name}</div>
                              <div className="text-xs text-[var(--text-muted)]">{interview.role_applied}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`badge ${interview.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                              {interview.status}
                            </span>
                            <ArrowRight size={16} className="text-[var(--text-muted)]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[var(--text-secondary)] text-center py-8 text-sm">No interviews yet</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Active Interview */
            <div className="max-w-4xl mx-auto">
              <div className="card card-glass">
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                        Interview: {currentInterview.candidate_name}
                      </h2>
                      <p className="text-xs text-[var(--text-muted)]">{currentInterview.role_applied}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-[var(--text-muted)]" />
                      <span className="text-xs text-[var(--text-secondary)]">
                        Question {currentQuestionIndex + 1} of {currentInterview.questions.length}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] h-1.5 rounded-full transition-all"
                        style={{
                          width: `${((currentQuestionIndex + 1) / currentInterview.questions.length) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Question */}
                  {currentInterview.questions[currentQuestionIndex] && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={16} className="text-[var(--primary)]" />
                        <span className="text-xs font-medium text-[var(--text-secondary)]">
                          {currentInterview.questions[currentQuestionIndex].difficulty.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                        {currentInterview.questions[currentQuestionIndex].question}
                      </h3>
                    </div>
                  )}

                  {/* Answer Input */}
                  <div className="form-group">
                    <label className="form-label">Your Answer</label>
                    <textarea
                      className="input textarea"
                      rows={6}
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={submitAnswer}
                      disabled={submittingAnswer}
                      className="btn btn-primary flex items-center gap-2 text-sm"
                    >
                      {submittingAnswer ? 'Submitting...' : (
                        <>
                          <Send size={16} />
                          Submit Answer
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setCurrentInterview(null)}
                      className="btn btn-secondary text-sm"
                    >
                      Cancel Interview
                    </button>
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

export default InterviewRoomPage
