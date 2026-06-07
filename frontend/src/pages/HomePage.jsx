import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// The page will attempt to load an image at runtime from /assets/brand-illustration.png
// Place your image in the frontend's `public/assets/brand-illustration.png` so it's
// available at runtime. If the image isn't present, the component falls back to an
// inline SVG illustration.
export default function HomePage() {
  const [hasImage, setHasImage] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.onload = () => setHasImage(true)
    img.onerror = () => setHasImage(false)
    img.src = '/assets/brand-illustration.png'
  }, [])
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <main className="max-w-6xl mx-auto p-8">
        <div className="grid grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl font-extrabold mb-4 text-[var(--text-primary)]">WorkForce Pro</h1>
            <p className="text-lg text-[var(--text-secondary)] mb-6">A modern, reliable HR platform for people operations. Manage employees, attendance, and leaves with a clean and focused workflow designed for teams of any size.</p>
            <div className="flex items-center gap-4">
              <Link to="/login" className="btn btn-primary">Get Started</Link>
              <Link to="/employees" className="btn btn-secondary">Explore Employees</Link>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="bg-[var(--bg-secondary)] rounded-xl p-6 shadow-md" style={{ width: 420 }}>
              {hasImage ? (
                <img src="/assets/brand-illustration.png" alt="WorkForce Pro illustration" className="w-full h-auto rounded" />
              ) : (
                <svg width="380" height="240" viewBox="0 0 380 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0" y="0" width="380" height="240" rx="12" fill="#ffffff" />
                  <g transform="translate(18,18)">
                    <rect x="0" y="0" width="160" height="36" rx="8" fill="#f0f9ff" />
                    <rect x="0" y="56" width="340" height="14" rx="7" fill="#f8fafc" />
                    <rect x="0" y="84" width="240" height="14" rx="7" fill="#f8fafc" />
                    <circle cx="300" cy="98" r="32" fill="#eef2ff" />
                    <rect x="0" y="118" width="340" height="86" rx="10" fill="#ffffff" stroke="#eef2f6" />
                  </g>
                </svg>
              )}
            </div>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">What you can do with WorkForce Pro</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold mb-2">Employee Directory</h3>
              <p className="text-sm text-[var(--text-muted)]">Centralized employee profiles with quick search, filters, and role-based visibility.</p>
            </div>
            <div className="card p-6">
              <h3 className="font-semibold mb-2">Attendance & Time</h3>
              <p className="text-sm text-[var(--text-muted)]">Daily attendance tracking, monthly reports, and percentage summaries for managers.</p>
            </div>
            <div className="card p-6">
              <h3 className="font-semibold mb-2">Leave Management</h3>
              <p className="text-sm text-[var(--text-muted)]">Submit, approve, and track leave balances with clear audit trails.</p>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Trusted by teams</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-4 bg-[var(--bg-secondary)] rounded shadow-sm">
              <p className="font-medium">"WorkForce Pro streamlined our HR workflows and saved hours every week."</p>
              <p className="text-sm text-[var(--text-muted)] mt-2">— Ops Lead, Acme Corp</p>
            </div>
            <div className="p-4 bg-[var(--bg-secondary)] rounded shadow-sm">
              <p className="font-medium">"The attendance reports are clear and helpful for our managers."</p>
              <p className="text-sm text-[var(--text-muted)] mt-2">— HR Manager, Beta LLC</p>
            </div>
            <div className="p-4 bg-[var(--bg-secondary)] rounded shadow-sm">
              <p className="font-medium">"Simple, fast, and reliable. Exactly what we needed."</p>
              <p className="text-sm text-[var(--text-muted)] mt-2">— CTO, Gamma Studios</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto p-6 flex items-center justify-between text-sm text-[var(--text-muted)]">
          <div>© {new Date().getFullYear()} WorkForce Pro</div>
          <div>Built for modern teams • Privacy-first</div>
        </div>
      </footer>
    </div>
  )
}
