'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Tab = 'signin' | 'signup'

export default function AuthPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const endpoint = tab === 'signin' ? '/api/auth/signin' : '/api/auth/signup'
    try {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await r.json().catch(() => ({})) as { detail?: string }
      if (!r.ok) {
        setError(typeof data.detail === 'string' ? data.detail : 'Something went wrong')
        return
      }
      router.push('/')
    } catch {
      setError('Could not connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--brand-navy)' }}>
            Prelegal
          </h1>
          <p className="text-sm text-gray-500 mt-1">AI-assisted legal document drafting</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => { setTab('signin'); setError(null) }}
              className="flex-1 py-3 text-sm font-medium transition-colors"
              style={tab === 'signin' ? { color: 'var(--brand-navy)', borderBottom: '2px solid var(--brand-navy)' } : { color: '#888888' }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab('signup'); setError(null) }}
              className="flex-1 py-3 text-sm font-medium transition-colors"
              style={tab === 'signup' ? { color: 'var(--brand-navy)', borderBottom: '2px solid var(--brand-navy)' } : { color: '#888888' }}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-blue)' } as React.CSSProperties}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-blue)' } as React.CSSProperties}
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white text-sm font-medium py-2.5 rounded-lg transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--brand-purple)' }}
            >
              {loading ? (tab === 'signin' ? 'Signing in…' : 'Creating account…') : (tab === 'signin' ? 'Sign In' : 'Create Account')}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Documents are AI-generated drafts and subject to legal review.
        </p>
      </div>
    </div>
  )
}
