'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Classification = 'A' | 'B' | 'C'

interface Props {
  preselected: Classification | null
}

const CLASSIFICATIONS: { value: Classification; label: string }[] = [
  { value: 'A', label: 'A: Likely somatic' },
  { value: 'B', label: 'B: Possibly somatic' },
  { value: 'C', label: 'C: Unlikely somatic' },
]

export default function TestResultClient({ preselected }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Classification | null>(preselected)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleContinue() {
    if (!selected || loading) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/onboarding/save-classification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classification: selected }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong. Please try again.')
      return
    }

    router.push('/onboarding/payment')
  }

  const subtitle = preselected !== null
    ? 'We carried your result from the test; confirm this is correct'
    : "We need your assessment result to personalise your framework. If you've already taken the test, select your result below. Otherwise, take it now; it takes around 5 minutes."

  return (
    <div className="max-w-[560px] mx-auto">
      <p className="text-[13px] font-medium text-text-muted uppercase tracking-wide mb-2">
        Step 3 of 5
      </p>
      <h1 className="text-[28px] font-bold text-text-heading leading-tight mb-2">
        Your assessment result
      </h1>
      <p className="text-[16px] text-text-muted mb-6">
        {subtitle}
      </p>

      {/* CASE B — show "Take the assessment" section when no param */}
      {preselected === null && (
        <>
          <div className="bg-surface border border-border rounded-xl p-5 mb-1">
            <h3 className="text-[17px] font-semibold text-text-heading mb-2">
              Take the assessment
            </h3>
            <p className="text-[15px] text-text-body leading-relaxed mb-4">
              The short assessment helps us identify which rehabilitation pathway is right for
              you. Complete it and you&apos;ll be returned here automatically.
            </p>
            <a
              href="https://www.somatictinnitusproject.com/noise-exposure"
              className="block w-full bg-primary text-white font-medium text-[15px] py-3 rounded-lg hover:bg-primary-hover active:bg-primary-active transition-colors duration-150 text-center"
            >
              Take the assessment →
            </a>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <span className="flex-1 h-px bg-border" />
            <span className="text-[13px] text-text-muted">or</span>
            <span className="flex-1 h-px bg-border" />
          </div>

          <div className="mb-1">
            <h3 className="text-[17px] font-semibold text-text-heading mb-2">
              Already taken the test
            </h3>
            <p className="text-[15px] text-text-body mb-3">Select your result:</p>
          </div>
        </>
      )}

      {/* Radio options — shown in both cases */}
      <div className="flex flex-col gap-2 mb-6">
        {CLASSIFICATIONS.map(({ value, label }) => (
          <label
            key={value}
            className={[
              'flex items-center gap-3 cursor-pointer rounded-xl px-4 py-4 border transition-colors',
              selected === value
                ? 'border-primary bg-surface'
                : 'border-border bg-surface hover:border-text-muted',
            ].join(' ')}
          >
            <input
              type="radio"
              name="classification"
              value={value}
              checked={selected === value}
              onChange={() => setSelected(value)}
              className="w-4 h-4 accent-primary flex-shrink-0"
            />
            <span className="text-[15px] font-medium text-text-heading">{label}</span>
          </label>
        ))}
      </div>

      {error && (
        <p className="text-[14px] text-error bg-error-tint rounded-lg px-4 py-3 mb-4">
          {error}
        </p>
      )}

      <button
        onClick={handleContinue}
        disabled={!selected || loading}
        className="w-full bg-primary text-white font-medium text-[15px] py-3 rounded-lg hover:bg-primary-hover active:bg-primary-active disabled:bg-primary-disabled disabled:cursor-not-allowed transition-colors duration-150"
      >
        {loading ? 'Saving...' : 'Continue'}
      </button>
    </div>
  )
}
