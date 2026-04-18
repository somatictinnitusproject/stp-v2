'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TestResultActions() {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleContinue() {
    setLoading(true)
    setError('')

    const res = await fetch('/api/onboarding/advance-to-payment', { method: 'POST' })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong. Please try again.')
      return
    }

    router.push('/onboarding/payment')
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {error && (
        <p className="w-full text-[14px] text-error bg-error-tint rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <button
        onClick={handleContinue}
        disabled={loading}
        className="w-full bg-primary text-white font-medium text-[15px] py-3 rounded-lg hover:bg-primary-hover active:bg-primary-active disabled:bg-primary-disabled disabled:cursor-not-allowed transition-colors duration-150"
      >
        {loading ? 'Saving...' : 'This is my result — continue'}
      </button>

      <button
        onClick={() => setExpanded(v => !v)}
        className="text-[14px] text-text-muted hover:text-text-body transition-colors duration-150"
      >
        This doesn&apos;t look right
      </button>

      {expanded && (
        <div className="w-full bg-surface border border-border rounded-xl p-5 flex flex-col gap-3">
          <Link
            href="/test"
            target="_blank"
            className="text-[14px] text-primary hover:text-primary-hover font-medium"
          >
            Retake the assessment ↗
          </Link>
          <a
            href="mailto:oliver@somatictinnitusproject.com"
            className="text-[14px] text-primary hover:text-primary-hover font-medium"
          >
            Contact us
          </a>
        </div>
      )}
    </div>
  )
}
