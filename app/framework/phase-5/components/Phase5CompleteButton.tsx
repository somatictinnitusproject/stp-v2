'use client'

import { useState } from 'react'
import { markPhase5Complete } from '../actions'

interface Props {
  phase5CompletedAt: string | null
}

export default function Phase5CompleteButton({ phase5CompletedAt }: Props) {
  const [completedAt, setCompletedAt] = useState<string | null>(phase5CompletedAt)
  const [acknowledged, setAcknowledged] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  if (completedAt) {
    const formatted = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    }).format(new Date(completedAt))
    return (
      <p className="text-[14px] text-text-muted text-center mt-8 pt-6 border-t border-border">
        Framework completed {formatted}
      </p>
    )
  }

  if (acknowledged) {
    return (
      <div className="mt-8 pt-6 border-t border-border text-center">
        <p className="text-[15px] font-semibold text-text-heading mb-1">
          Congratulations on completing the framework.
        </p>
        <p className="text-[14px] text-text-muted">Your data helps future members.</p>
      </div>
    )
  }

  async function handleClick() {
    setLoading(true)
    setError(false)
    try {
      await markPhase5Complete()
      const now = new Date().toISOString()
      setCompletedAt(now)
      setAcknowledged(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <p className="text-[13px] text-text-muted mb-4 text-center">
        You can mark the framework complete when you're ready — you don't need to finish every session.
      </p>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full h-12 rounded-lg bg-surface border border-border text-[15px] font-medium text-text-heading hover:border-text-heading transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving…' : "I've finished the framework"}
      </button>
      {error && (
        <p className="text-[13px] text-error text-center mt-2">
          Could not save. Please try again.
        </p>
      )}
    </div>
  )
}
