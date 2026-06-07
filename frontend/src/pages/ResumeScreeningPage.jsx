import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar, LoadingSpinner } from '../components/shared'
import { useAuth } from '../hooks/useAuth'
import { Upload, FileText, Sparkles, CheckCircle, XCircle, AlertCircle, TrendingUp, Award, Users, BarChart3 } from 'lucide-react'

export function ResumeScreeningPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('upload') // upload, results, leaderboard
  
  // Upload state
  const [candidateName, setCandidateName] = useState('')
  const [file, setFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [uploading, setUploading] = useState(false)
  const [screening, setScreening] = useState(false)
  
  // Results state
  const [screeningResult, setScreeningResult] = useState(null)
  const [uploadedResumeId, setUploadedResumeId] = useState(null)
  
  // Leaderboard state
  const [topCandidates, setTopCandidates] = useState([])
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false)
  
  // Statistics state
  const [stats, setStats] = useState(null)
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'hr') {
      navigate('/dashboard')
    }
    fetchStatistics()
    fetchTopCandidates()
  }, [user, navigate])

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/resume/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const fetchTopCandidates = async () => {
    setLoadingLeaderboard(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/resume/top-candidates?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setTopCandidates(data.data)
      }
    } catch (error) {
      console.error('Error fetching top candidates:', error)
    } finally {
      setLoadingLeaderboard(false)
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!validTypes.includes(selectedFile.type)) {
        alert('Please upload a PDF or DOCX file')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!candidateName || !file) {
      alert('Please provide candidate name and upload a resume')
      return
    }

    setUploading(true)
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', file)
      formData.append('candidate_name', candidateName)

      const response = await fetch(`${API_BASE}/resume/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()
      if (data.success) {
        setUploadedResumeId(data.data.id)
        alert('Resume uploaded successfully!')
        fetchStatistics()
      } else {
        alert(data.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Error uploading resume:', error)
      alert('Error uploading resume')
    } finally {
      setUploading(false)
    }
  }

  const handleScreen = async () => {
    if (!uploadedResumeId || !jobDescription) {
      alert('Please upload a resume and provide job description')
      return
    }

    if (!apiKey) {
      alert('Please provide Gemini API key')
      return
    }

    setScreening(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/resume/screen`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resume_id: uploadedResumeId,
          jd_text: jobDescription,
          api_key: apiKey
        })
      })

      const data = await response.json()
      if (data.success) {
        setScreeningResult(data.data)
        setActiveTab('results')
        fetchStatistics()
        fetchTopCandidates()
      } else {
        alert(data.message || 'Screening failed')
      }
    } catch (error) {
      console.error('Error screening resume:', error)
      alert('Error screening resume')
    } finally {
      setScreening(false)
    }
  }

  const getRecommendationColor = (recommendation) => {
    if (recommendation === 'Proceed to Interview') return 'badge-success'
    if (recommendation === 'Maybe Consider') return 'badge-warning'
    return 'badge-danger'
  }

  const getRecommendationIcon = (recommendation) => {
    if (recommendation === 'Proceed to Interview') return <CheckCircle size={20} />
    if (recommendation === 'Maybe Consider') return <AlertCircle size={20} />
    return <XCircle size={20} />
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-64">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">AI Resume Screening</h1>
            <p className="text-sm text-[var(--text-secondary)]">Upload resumes and analyze them against job descriptions using AI</p>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="card card-glass">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[var(--text-muted)] mb-1">Total Resumes</div>
                      <div className="text-xl font-semibold text-[var(--text-primary)]">{stats.total_resumes}</div>
                    </div>
                    <div className="w-10 h-10 bg-[rgba(59, 130, 246, 0.15)] rounded-xl flex items-center justify-center">
                      <FileText size={20} className="text-[var(--info)]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card card-glass">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[var(--text-muted)] mb-1">Screenings</div>
                      <div className="text-xl font-semibold text-[var(--text-primary)]">{stats.total_screenings}</div>
                    </div>
                    <div className="w-10 h-10 bg-[rgba(14, 165, 233, 0.15)] rounded-xl flex items-center justify-center">
                      <Sparkles size={20} className="text-sky-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card card-glass">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[var(--text-muted)] mb-1">Avg Match Score</div>
                      <div className="text-xl font-semibold text-[var(--text-primary)]">{stats.average_match_score}%</div>
                    </div>
                    <div className="w-10 h-10 bg-[rgba(16, 185, 129, 0.15)] rounded-xl flex items-center justify-center">
                      <TrendingUp size={20} className="text-[var(--primary)]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card card-glass">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[var(--text-muted)] mb-1">Proceed Rate</div>
                      <div className="text-xl font-semibold text-[var(--text-primary)]">
                        {stats.total_screenings > 0 ? Math.round((stats.proceed_count / stats.total_screenings) * 100) : 0}%
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-[rgba(245, 158, 11, 0.15)] rounded-xl flex items-center justify-center">
                      <Award size={20} className="text-[var(--warning)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-[var(--border)]">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Upload & Screen
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'results'
                  ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Screening Results
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'leaderboard'
                  ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Leaderboard
            </button>
          </div>

          {/* Upload & Screen Tab */}
          {activeTab === 'upload' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Upload Section */}
              <div className="card card-glass">
                <div className="card-header">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">Upload Resume</h2>
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
                    <label className="form-label">Resume File (PDF/DOCX)</label>
                    <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-4 text-center hover:border-[var(--primary)] transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload size={24} className="mx-auto text-[var(--text-muted)] mb-2" />
                        <p className="text-sm text-[var(--text-secondary)]">
                          {file ? file.name : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">PDF or DOCX files only</p>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="btn btn-primary w-full text-sm"
                  >
                    {uploading ? 'Uploading...' : 'Upload Resume'}
                  </button>
                </div>
              </div>

              {/* Screening Section */}
              <div className="card card-glass">
                <div className="card-header">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">Screen Resume</h2>
                </div>
                <div className="card-body space-y-3">
                  <div className="form-group">
                    <label className="form-label">Job Description</label>
                    <textarea
                      className="input textarea"
                      rows={6}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description here..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gemini API Key</label>
                    <input
                      type="password"
                      className="input"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your Gemini API key"
                    />
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Get your API key from{' '}
                      <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">
                        Google AI Studio
                      </a>
                    </p>
                  </div>

                  <button
                    onClick={handleScreen}
                    disabled={screening || !uploadedResumeId}
                    className="btn btn-primary w-full text-sm"
                  >
                    {screening ? 'Screening...' : 'Screen Resume'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && screeningResult && (
            <div className="space-y-4">
              {/* Match Score */}
              <div className="card card-glass">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Match Score</h3>
                    <span className={`badge ${getRecommendationColor(screeningResult.recommendation)} flex items-center gap-1`}>
                      {getRecommendationIcon(screeningResult.recommendation)}
                      {screeningResult.recommendation}
                    </span>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="relative w-40 h-40">
                      <svg className="w-40 h-40 transform -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="72"
                          stroke="var(--border)"
                          strokeWidth="10"
                          fill="none"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="72"
                          stroke={screeningResult.match_score >= 80 ? 'var(--primary)' : screeningResult.match_score >= 60 ? 'var(--warning)' : 'var(--danger)'}
                          strokeWidth="10"
                          fill="none"
                          strokeDasharray={`${screeningResult.match_score * 4.52} 452`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl font-semibold text-[var(--text-primary)]">{screeningResult.match_score}%</div>
                          <div className="text-xs text-[var(--text-muted)]">Match</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  {screeningResult.score_breakdown && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="text-center p-3 bg-[var(--bg-tertiary)] rounded-xl">
                        <div className="text-xs text-[var(--text-muted)] mb-1">Skills</div>
                        <div className="text-lg font-semibold text-[var(--info)]">{screeningResult.score_breakdown.skills_score}%</div>
                      </div>
                      <div className="text-center p-3 bg-[var(--bg-tertiary)] rounded-xl">
                        <div className="text-xs text-[var(--text-muted)] mb-1">Experience</div>
                        <div className="text-lg font-semibold text-sky-400">{screeningResult.score_breakdown.experience_score}%</div>
                      </div>
                      <div className="text-center p-3 bg-[var(--bg-tertiary)] rounded-xl">
                        <div className="text-xs text-[var(--text-muted)] mb-1">Education</div>
                        <div className="text-lg font-semibold text-[var(--primary)]">{screeningResult.score_breakdown.education_score}%</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="card card-glass">
                  <div className="card-header">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Matched Skills</h3>
                  </div>
                  <div className="card-body">
                    <div className="flex flex-wrap gap-2">
                      {screeningResult.skills_found && screeningResult.skills_found.length > 0 ? (
                        screeningResult.skills_found.map((skill, index) => (
                          <span key={index} className="badge badge-success">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-[var(--text-secondary)] text-sm">No skills found</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="card card-glass">
                  <div className="card-header">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Missing Skills</h3>
                  </div>
                  <div className="card-body">
                    <div className="flex flex-wrap gap-2">
                      {screeningResult.missing_skills && screeningResult.missing_skills.length > 0 ? (
                        screeningResult.missing_skills.map((skill, index) => (
                          <span key={index} className="badge badge-danger">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-[var(--text-secondary)] text-sm">No missing skills</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Experience Summary */}
              <div className="card card-glass">
                <div className="card-header">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Experience Summary</h3>
                </div>
                <div className="card-body">
                  <p className="text-sm text-[var(--text-secondary)]">{screeningResult.experience_summary || 'No experience summary available'}</p>
                </div>
              </div>

              {/* Strengths */}
              <div className="card card-glass">
                <div className="card-header">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Strengths</h3>
                </div>
                <div className="card-body">
                  <ul className="space-y-2">
                    {screeningResult.strengths && screeningResult.strengths.length > 0 ? (
                      screeningResult.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle size={14} className="text-[var(--primary)] mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-[var(--text-secondary)]">{strength}</span>
                        </li>
                      ))
                    ) : (
                      <p className="text-[var(--text-secondary)] text-sm">No strengths identified</p>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="card card-glass">
              <div className="card-header">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Top Candidates</h2>
              </div>
              <div className="card-body">
                {loadingLeaderboard ? (
                  <LoadingSpinner />
                ) : topCandidates.length > 0 ? (
                  <div className="space-y-2">
                    {topCandidates.map((candidate, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-xl hover:bg-[var(--bg-elevated)] transition-colors border border-[var(--border)]"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-semibold ${
                            index === 0 ? 'bg-[var(--warning)] text-[var(--bg-primary)]' :
                            index === 1 ? 'bg-[var(--text-muted)] text-[var(--bg-primary)]' :
                            index === 2 ? 'bg-amber-700 text-[var(--bg-primary)]' :
                            'bg-[var(--border)] text-[var(--text-secondary)]'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[var(--text-primary)]">{candidate.candidate_name}</div>
                            <div className="text-xs text-[var(--text-muted)]">
                              Screened on {new Date(candidate.screened_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-lg font-semibold text-[var(--text-primary)]">{candidate.match_score}%</div>
                            <span className={`badge ${getRecommendationColor(candidate.recommendation)}`}>
                              {candidate.recommendation}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--text-secondary)] text-center py-8 text-sm">No screenings yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResumeScreeningPage
