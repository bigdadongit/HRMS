import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar, LoadingSpinner } from '../components/shared'
import { useAuth } from '../hooks/useAuth'
import { MessageSquare, Send, Bot, User, Sparkles, Trash2, Lightbulb } from 'lucide-react'

export function HRCopilotPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'
  
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your HR Copilot. Ask me anything about employees, attendance, leaves, or interview results.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'hr') {
      navigate('/dashboard')
    }
    fetchSuggestions()
  }, [user, navigate])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchSuggestions = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/copilot/suggested-questions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setSuggestions(data.data.suggestions)
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    }
  }

  const handleSend = async (messageText = null) => {
    const text = messageText || input.trim()
    if (!text) return

    const userMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setShowSuggestions(false)
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/copilot/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: text })
      })
      const data = await response.json()
      if (data.success) {
        const assistantMessage = { role: 'assistant', content: data.data.response }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: 'Hello! I\'m your HR Copilot. Ask me anything about employees, attendance, leaves, or interview results.' }])
    setShowSuggestions(true)
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-64">
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[rgba(59, 130, 246, 0.15)] rounded-xl flex items-center justify-center">
                  <Bot size={20} className="text-[var(--info)]" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-[var(--text-primary)]">HR Copilot</h1>
                  <p className="text-xs text-[var(--text-muted)]">AI-powered HR assistant</p>
                </div>
              </div>
              <button
                onClick={clearChat}
                className="btn btn-secondary flex items-center gap-2 text-sm"
              >
                <Trash2 size={16} />
                Clear Chat
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-[var(--bg-primary)]">
            <div className="max-w-4xl mx-auto space-y-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-2 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' ? 'bg-[var(--primary)]' : 'bg-[var(--accent)]'
                    }`}>
                      {message.role === 'user' ? (
                        <User size={16} className="text-white" />
                      ) : (
                        <Bot size={16} className="text-white" />
                      )}
                    </div>
                    <div className={`p-3 rounded-xl text-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)]'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                      <Bot size={16} className="text-white" />
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {showSuggestions && suggestions.length > 0 && messages.length === 1 && (
              <div className="max-w-4xl mx-auto mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={16} className="text-[var(--warning)]" />
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Suggested Questions</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSend(suggestion)}
                      className="px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-full text-xs text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--primary)] transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border)]">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about HR data..."
                    rows={1}
                    className="input resize-none text-sm"
                    style={{ minHeight: '40px' }}
                  />
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  className="btn btn-primary p-2"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
                Powered by Google Gemini AI • Ask about employees, attendance, leaves, interviews, and more
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
