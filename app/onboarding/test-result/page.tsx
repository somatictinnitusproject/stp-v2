import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import OnboardingShell from '@/components/shells/OnboardingShell'
import TestResultActions from '@/components/onboarding/TestResultActions'
import Link from 'next/link'

const CLASSIFICATION_LABELS: Record<string, { label: string; description: string }> = {
  A: {
    label: 'Likely Somatic',
    description:
      'Your assessment strongly suggests a somatic driver. This means physical tension patterns — particularly in your jaw, neck, and upper body — are very likely contributing to your tinnitus.',
  },
  B: {
    label: 'Possibly Somatic',
    description:
      'Your assessment suggests somatic involvement is likely. Physical tension patterns appear to be a contributing factor to your tinnitus experience.',
  },
  C: {
    label: 'Less Likely Somatic',
    description:
      'Somatic patterns were less prominent in your assessment. You may still benefit from the programme — some members with a C classification see meaningful improvement.',
  },
}

export default async function OnboardingTestResultPage() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try { cookieStore.set(name, value, options) } catch {}
          })
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  // TODO Phase K: read ?result= URL parameter from V1 handoff, pre-populate classification
  // if present, show 'We carried your result from the test — confirm this is correct' message.
  const { data: userData } = await supabase
    .from('users')
    .select('classification, movement_score, symptom_score, total_score')
    .eq('id', user.id)
    .single()

  const classification = userData?.classification as string | null
  const result = classification ? CLASSIFICATION_LABELS[classification] : null

  // Edge case — no classification yet
  if (!result) {
    return (
      <OnboardingShell>
        <div className="max-w-[560px] mx-auto">
          <p className="text-[13px] font-medium text-text-muted uppercase tracking-wide mb-2">
            Step 3 of 5
          </p>
          <h1 className="text-[28px] font-bold text-text-heading leading-tight mb-2">
            Your assessment result
          </h1>
          <p className="text-[16px] text-text-muted mb-8">
            We couldn&apos;t find a completed assessment linked to your account.
          </p>

          <div className="bg-surface border border-border rounded-xl p-6 mb-8 text-[15px] text-text-body leading-relaxed">
            <p>
              The short assessment helps us personalise your rehabilitation framework
              and takes around five minutes. Complete it and then return to this page —
              your result will appear here automatically.
            </p>
          </div>

          <Link
            href="/test"
            target="_blank"
            className="block w-full bg-primary text-white font-medium text-[15px] py-3 rounded-lg hover:bg-primary-hover active:bg-primary-active transition-colors duration-150 text-center"
          >
            Take the assessment ↗
          </Link>
        </div>
      </OnboardingShell>
    )
  }

  return (
    <OnboardingShell>
      <div className="max-w-[560px] mx-auto">
        <p className="text-[13px] font-medium text-text-muted uppercase tracking-wide mb-2">
          Step 3 of 5
        </p>
        <h1 className="text-[28px] font-bold text-text-heading leading-tight mb-2">
          Your assessment result
        </h1>
        <p className="text-[16px] text-text-muted mb-8">
          This result has been imported into your account and will personalise your programme.
        </p>

        <div className="bg-surface border border-border rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-[18px] flex-shrink-0">
              {classification}
            </span>
            <div>
              <p className="text-[18px] font-semibold text-text-heading">{result.label}</p>
              <p className="text-[13px] text-text-muted">Classification {classification}</p>
            </div>
          </div>
          <p className="text-[15px] text-text-body leading-relaxed">{result.description}</p>
        </div>

        <TestResultActions />
      </div>
    </OnboardingShell>
  )
}
