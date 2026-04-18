'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingShell from '@/components/shells/OnboardingShell'
import Link from 'next/link'

export default function OnboardingTermsPage() {
  const router = useRouter()
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleContinue() {
    if (!accepted) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/onboarding/accept-terms', { method: 'POST' })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong. Please try again.')
      return
    }

    router.push('/onboarding/consent')
  }

  return (
    <OnboardingShell>
      <div className="max-w-[560px] mx-auto">
        <p className="text-[13px] font-medium text-text-muted uppercase tracking-wide mb-2">
          Step 1 of 5
        </p>
        <h1 className="text-[28px] font-bold text-text-heading leading-tight mb-2">
          Terms &amp; privacy
        </h1>
        <p className="text-[16px] text-text-muted mb-8">
          Please read and accept the following before continuing.
        </p>

        <div className="bg-surface border border-border rounded-xl p-6 mb-6 flex flex-col gap-4 text-[15px] text-text-body leading-relaxed">
          <p>
            By using the Somatic Tinnitus Project, you agree to our{' '}
            <Link href="/terms" target="_blank" className="text-primary hover:text-primary-hover font-medium underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" target="_blank" className="text-primary hover:text-primary-hover font-medium underline">
              Privacy Policy
            </Link>.
          </p>
          <p>
            This programme is for informational and self-help purposes only. It is not a
            substitute for professional medical advice, diagnosis, or treatment. Always seek
            the guidance of a qualified health provider with any questions you have regarding
            your condition.
          </p>
          <p>
            Your data is stored securely and will never be sold to third parties. You may
            delete your account at any time.
          </p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer mb-8">
          <input
            type="checkbox"
            checked={accepted}
            onChange={e => setAccepted(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-border accent-primary cursor-pointer flex-shrink-0"
          />
          <span className="text-[15px] text-text-body">
            I have read and agree to the Terms of Service and Privacy Policy.
          </span>
        </label>

        {error && (
          <p className="text-[14px] text-error bg-error-tint rounded-lg px-4 py-3 mb-4">
            {error}
          </p>
        )}

        <button
          onClick={handleContinue}
          disabled={!accepted || loading}
          className="w-full bg-primary text-white font-medium text-[15px] py-3 rounded-lg hover:bg-primary-hover active:bg-primary-active disabled:bg-primary-disabled disabled:cursor-not-allowed transition-colors duration-150"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </OnboardingShell>
  )
}
