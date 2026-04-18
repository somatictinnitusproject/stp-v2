'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PublicShell from '@/components/shells/PublicShell'
import { createClient } from '@/lib/supabase/client'

const inputClass =
  'w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-body focus:outline-none focus:border-primary focus:shadow-input-focus'

export default function ResetPasswordConfirmPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // PKCE flow: /auth/callback already exchanged the code — check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true)
    })

    // Fallback: implicit flow fires PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setSessionReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError('Could not update password. The reset link may have expired.')
      return
    }

    router.push('/login?verified=true')
  }

  if (!sessionReady) {
    return (
      <PublicShell>
        <div className="max-w-[400px] mx-auto py-12 text-center">
          <p className="text-[16px] text-text-muted">Verifying reset link...</p>
        </div>
      </PublicShell>
    )
  }

  return (
    <PublicShell>
      <div className="max-w-[400px] mx-auto py-12">
        <h1 className="text-[36px] font-bold text-text-heading leading-tight mb-2">
          Set new password
        </h1>
        <p className="text-[16px] text-text-muted mb-8">
          Choose a new password for your account.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-text-body" htmlFor="password">
              New password
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
              Confirm new password
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
            {loading ? 'Updating...' : 'Set new password'}
          </button>
        </form>

        <p className="text-[13px] text-text-muted mt-6 text-center">
          <Link href="/login" className="text-primary hover:text-primary-hover font-medium">
            Back to log in
          </Link>
        </p>
      </div>
    </PublicShell>
  )
}
