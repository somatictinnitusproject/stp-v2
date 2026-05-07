'use client'

import { useState } from 'react'

interface Props {
  initialValue: boolean | null
}

export default function ResearchConsentToggle({ initialValue }: Props) {
  const [enabled, setEnabled] = useState(initialValue ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleToggle() {
    const next = !enabled
    setSaving(true)
    setError(null)

    const res = await fetch('/api/profile/research-consent', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ research_consent: next }),
    })

    setSaving(false)

    if (!res.ok) {
      setError('Could not save. Please try again.')
      return
    }

    setEnabled(next)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[14px] font-medium text-text-body">
            {enabled ? 'Consented' : 'Withdrawn'}
          </p>
          {!enabled && (
            <p className="text-[12px] text-text-muted mt-0.5">
              Your data will not be included in anonymised research.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={saving}
          aria-pressed={enabled}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
            enabled ? 'bg-primary' : 'bg-border'
          } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      {error && (
        <p className="text-[12px] text-error mt-2">{error}</p>
      )}
    </div>
  )
}
