'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingShell from '@/components/shells/OnboardingShell'

export default function OnboardingConsentPage() {
  const router = useRouter()
  const [healthConsent, setHealthConsent] = useState(false)
  const [researchConsent, setResearchConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleContinue() {
    if (!healthConsent) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/onboarding/accept-consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ researchConsent }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong. Please try again.')
      return
    }

    router.push('/onboarding/test-result')
  }

  return (
    <OnboardingShell>
      <div className="max-w-[560px] mx-auto">
        <p className="text-[13px] font-medium text-text-muted uppercase tracking-wide mb-2">
          Step 2 of 5
        </p>
        <h1 className="text-[28px] font-bold text-text-heading leading-tight mb-2">
          Health data consent
        </h1>
        <p className="text-[16px] text-text-muted mb-8">
          To personalise your programme, we need to store your health data securely.
        </p>

        <div className="flex flex-col gap-4 mb-8">
          {/* Mandatory */}
          <label className="flex items-start gap-3 cursor-pointer bg-surface border border-border rounded-xl p-5">
            <input
              type="checkbox"
              checked={healthConsent}
              onChange={e => setHealthConsent(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-border accent-primary cursor-pointer flex-shrink-0"
            />
            <div>
              <p className="text-[15px] font-medium text-text-heading mb-1">
                Health data consent <span className="text-error">*</span>
              </p>
              <p className="text-[14px] text-text-body leading-relaxed">
                I consent to the Somatic Tinnitus Project storing and processing my
                health-related data (including assessment results and daily logs) to
                deliver and personalise my rehabilitation programme.
              </p>
            </div>
          </label>

          {/* Optional */}
          <label className="flex items-start gap-3 cursor-pointer bg-surface border border-border rounded-xl p-5">
            <input
              type="checkbox"
              checked={researchConsent}
              onChange={e => setResearchConsent(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-border accent-primary cursor-pointer flex-shrink-0"
            />
            <div>
              <p className="text-[15px] font-medium text-text-heading mb-1">
                Research consent{' '}
                <span className="text-[13px] font-normal text-text-muted">(optional)</span>
              </p>
              <p className="text-[14px] text-text-body leading-relaxed">
                I consent to my anonymised data being used to improve understanding
                of somatic tinnitus. You can withdraw this at any time in your account
                settings.
              </p>
            </div>
          </label>
        </div>

        {error && (
          <p className="text-[14px] text-error bg-error-tint rounded-lg px-4 py-3 mb-4">
            {error}
          </p>
        )}

        <button
          onClick={handleContinue}
          disabled={!healthConsent || loading}
          className="w-full bg-primary text-white font-medium text-[15px] py-3 rounded-lg hover:bg-primary-hover active:bg-primary-active disabled:bg-primary-disabled disabled:cursor-not-allowed transition-colors duration-150"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </OnboardingShell>
  )
}
