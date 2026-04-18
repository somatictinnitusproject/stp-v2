'use client'
import { useState } from 'react'
import Link from 'next/link'
import PublicShell from '@/components/shells/PublicShell'

const inputClass =
  'w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-body focus:outline-none focus:border-primary focus:shadow-input-focus'

export default function SignupPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!/^[a-zA-Z0-9_]{2,30}$/.test(username.trim())) {
      setError('Username must be 2–30 characters and contain only letters, numbers, and underscores.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), email, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Something went wrong. Please try again.')
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <PublicShell>
        <div className="max-w-[400px] mx-auto py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-wins-bg flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A9B8E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h1 className="text-[24px] font-semibold text-text-heading mb-3">
            Check your email
          </h1>
          <p className="text-[16px] text-text-body mb-2">
            We sent a verification link to <strong>{email}</strong>.
          </p>
          <p className="text-[14px] text-text-muted">
            Click the link in the email to activate your account, then{' '}
            <Link href="/login" className="text-primary hover:text-primary-hover font-medium">
              sign in
            </Link>
            .
          </p>
        </div>
      </PublicShell>
    )
  }

  return (
    <PublicShell>
      <div className="max-w-[400px] mx-auto py-12">
        <h1 className="text-[36px] font-bold text-text-heading leading-tight mb-2">
          Create your account
        </h1>
        <p className="text-[16px] text-text-muted mb-8">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:text-primary-hover font-medium">
            Sign in
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-text-body" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className={inputClass}
              placeholder="e.g. john_smith"
            />
            <span className="text-[13px] text-text-muted">
              Letters, numbers, and underscores only. 2–30 characters.
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-text-body" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputClass}
            />
            <span className="text-[13px] text-text-muted">
              If you joined our waitlist, use the same email address you signed up with to claim your free founding member access.
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-text-body" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={inputClass}
            />
            <span className="text-[13px] text-text-muted">Minimum 8 characters</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-text-body" htmlFor="confirmPassword">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-[14px] text-error bg-error-tint rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-medium text-[15px] py-3 rounded-lg hover:bg-primary-hover active:bg-primary-active disabled:bg-primary-disabled disabled:cursor-not-allowed transition-colors duration-150 mt-2"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-[13px] text-text-muted mt-6 text-center">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="text-primary hover:text-primary-hover">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:text-primary-hover">
            Privacy Policy
          </Link>
        </p>
      </div>
    </PublicShell>
  )
}
