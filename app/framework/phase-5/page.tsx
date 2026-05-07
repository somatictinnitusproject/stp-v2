// app/framework/phase-5/page.tsx
// ─────────────────────────────────────────────────────────────────
// Server component. Static route — shadows [phase]/page.tsx for
// /framework/phase-5.
//
// Access gate: phase3_completed_at must be non-null. Members who
// have not completed Phase 3 are redirected to /dashboard.
// advancePhase3ToPhase5 sets both phase3_completed_at and
// current_phase = 5 atomically, so this gate is sufficient.
//
// TFI Phase 5 card shown at top when: current_phase = 5,
// intake TFI submitted, phase5_completion not yet submitted
// or dismissed. Per errata entry 2026-05-07 (Doc 13 §5.1 revision).
// ─────────────────────────────────────────────────────────────────

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AuthShell from '@/components/shells/AuthShell'
import { PHASE_NAMES } from '@/content/framework-manifest'
import { PHASE_5_READINGS } from '@/content/framework/phase-5'
import type { Phase5OutcomeType } from '@/content/framework/phase-5/types'
import type { Phase1AssessmentRow } from '@/lib/scoring/types'
import Phase5ReadingList from './components/Phase5ReadingList'
import Phase5TfiCard from './components/Phase5TfiCard'
import Phase5CompleteButton from './components/Phase5CompleteButton'

export default async function Phase5OverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: progress }, { data: phase1 }, { data: tfiResponses }] = await Promise.all([
    supabase
      .from('framework_progress')
      .select('phase3_completed_at, exercises_viewed, phase5_outcome_type, current_phase, phase5_completed_at, tfi_dismissals')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('phase1_assessment')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('tfi_responses')
      .select('capture_point')
      .eq('user_id', user.id),
  ])

  // Access gate — Phase 5 requires Phase 3 completion.
  if (!progress?.phase3_completed_at) redirect('/dashboard')

  // TFI Phase 5 card: show when in Phase 5, intake submitted, not yet submitted/dismissed.
  const tfiSubmitted = new Set(
    (tfiResponses ?? []).map((r: { capture_point: string }) => r.capture_point),
  )
  const tfiDismissals = (progress?.tfi_dismissals ?? {}) as Record<string, string>
  const showPhase5TfiCard =
    progress?.current_phase === 5 &&
    tfiSubmitted.has('intake') &&
    !tfiSubmitted.has('phase5_completion') &&
    !tfiDismissals['phase5_completion']

  const exercisesViewed = (progress?.exercises_viewed ?? {}) as Record<string, boolean>

  const readings = PHASE_5_READINGS.map((section) => ({
    section,
    isRead: !!exercisesViewed[section.id],
    minutes: section.estimatedMinutes,
  }))

  return (
    <AuthShell>
      <div className="max-w-[720px] mx-auto py-8">
        <Phase5TfiCard show={showPhase5TfiCard} />

        <p className="text-[12px] font-medium text-primary uppercase tracking-wide mb-1">Phase 5</p>
        <h1 className="text-[28px] md:text-[36px] font-bold text-text-heading mb-6">
          {PHASE_NAMES[5]}
        </h1>

        <div className="bg-surface border border-border rounded-[12px] p-5 mb-6">
          <p className="text-[14px] font-semibold text-text-heading mb-3">Phase 5 reading</p>
          <Phase5ReadingList
            readings={readings}
            phase5OutcomeType={(progress?.phase5_outcome_type as Phase5OutcomeType | null) ?? null}
            phase1={phase1 as Phase1AssessmentRow | null}
          />
        </div>

        <Phase5CompleteButton
          phase5CompletedAt={progress?.phase5_completed_at ?? null}
        />
      </div>
    </AuthShell>
  )
}
