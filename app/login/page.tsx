'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import PublicShell from '@/components/shells/PublicShell'

const inputClass =
  'w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-body focus:outline-none focus:border-primary focus:shadow-input-focus'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setNotice('Email verified — you can now log in.')
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Something went wrong. Please try again.')
      return
    }

    router.push(data.redirectTo || '/dashboard')
    router.refresh()
  }

  return (
    <>
      {notice && (
        <div className="bg-wins-bg border border-wins-border rounded-lg px-4 py-3 mb-6">
          <p className="text-[14px] text-primary font-medium">{notice}</p>
        </div>
      )}

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

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-text-body" htmlFor="password">
              Password
            </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
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
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <Link
          href="/reset-password"
          className="text-[13px] text-primary hover:text-primary-hover text-center block"
        >
          Forgot password?
        </Link>
      </form>
    </>
  )
}

export default function LoginPage() {
  return (
    <PublicShell>
      <div className="max-w-[400px] mx-auto py-12">
        <h1 className="text-[36px] font-bold text-text-heading leading-tight mb-2">
          Sign in
        </h1>
        <p className="text-[16px] text-text-muted mb-8">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary hover:text-primary-hover font-medium">
            Create one
          </Link>
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </PublicShell>
  )
}
