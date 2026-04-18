'use client'
import { useState } from 'react'
import Link from 'next/link'
import PublicShell from '@/components/shells/PublicShell'

const inputClass =
  'w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-body focus:outline-none focus:border-primary focus:shadow-input-focus'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    // Always show success — never reveal whether email is registered
    setLoading(false)
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
          <p className="text-[16px] text-text-body mb-6">
            If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
          </p>
          <Link href="/login" className="text-[14px] text-primary hover:text-primary-hover font-medium">
            Back to log in
          </Link>
        </div>
      </PublicShell>
    )
  }

  return (
    <PublicShell>
      <div className="max-w-[400px] mx-auto py-12">
        <h1 className="text-[36px] font-bold text-text-heading leading-tight mb-2">
          Reset your password
        </h1>
        <p className="text-[16px] text-text-muted mb-8">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-medium text-[15px] py-3 rounded-lg hover:bg-primary-hover active:bg-primary-active disabled:bg-primary-disabled disabled:cursor-not-allowed transition-colors duration-150 mt-2"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <p className="text-[13px] text-text-muted mt-6 text-center">
          Remembered it?{' '}
          <Link href="/login" className="text-primary hover:text-primary-hover font-medium">
            Back to log in
          </Link>
        </p>
      </div>
    </PublicShell>
  )
}
