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
// PHASE_5_READINGS is empty during M15a. Phase5ReadingList renders
// a placeholder message until content lands in M15c+.
// ─────────────────────────────────────────────────────────────────

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AuthShell from '@/components/shells/AuthShell'
import { PHASE_NAMES } from '@/content/framework-manifest'
import { PHASE_5_READINGS } from '@/content/framework/phase-5'
import type { Phase5OutcomeType } from '@/content/framework/phase-5/types'
import type { Phase1AssessmentRow } from '@/lib/scoring/types'
import Phase5ReadingList from './components/Phase5ReadingList'

export default async function Phase5OverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: progress } = await supabase
    .from('framework_progress')
    .select('phase3_completed_at, exercises_viewed, phase5_outcome_type')
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: phase1 } = await supabase
    .from('phase1_assessment')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  // Access gate — Phase 5 requires Phase 3 completion.
  if (!progress?.phase3_completed_at) redirect('/dashboard')

  const exercisesViewed = (progress?.exercises_viewed ?? {}) as Record<string, boolean>

  const readings = PHASE_5_READINGS.map((section) => ({
    section,
    isRead: !!exercisesViewed[section.id],
    minutes: section.estimatedMinutes,
  }))

  return (
    <AuthShell>
      <div className="max-w-[720px] mx-auto py-8">
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
      </div>
    </AuthShell>
  )
}
