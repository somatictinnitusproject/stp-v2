// app/framework/phase-4/page.tsx
// ─────────────────────────────────────────────────────────────────
// Server component. Static route — shadows [phase]/page.tsx for
// /framework/phase-4. Phase 4 is accessible from current_phase >= 2
// per Doc 12 §6.3 — gated below with redirect to current phase.
//
// M14b.0 wires the reading list shell in place. PHASE_4_READINGS is
// empty during M14b.0 so the list does not visibly render — F.1
// content lands in M14b.1, F.2 in M14b.2.
// ─────────────────────────────────────────────────────────────────

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AuthShell from '@/components/shells/AuthShell'
import { PHASE_NAMES } from '@/content/framework-manifest'
import { PHASE_4_READINGS } from '@/content/framework/phase-4'
import type { Phase1AssessmentRow } from '@/lib/scoring/types'
import Phase4ReadingList from './components/Phase4ReadingList'
import { markPhase4FirstAccessed } from './actions'

export default async function Phase4OverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: progress } = await supabase
    .from('framework_progress')
    .select('current_phase, exercises_viewed')
    .eq('user_id', user.id)
    .maybeSingle()

  const currentPhase = progress?.current_phase ?? 1

  // Access control — Doc 12 §6.3: Phase 4 accessible from Phase 2
  // onwards. Redirect locked members to their current phase route.
  if (currentPhase < 2) redirect(`/framework/phase-${currentPhase}`)

  // Idempotent first-access timestamp write.
  await markPhase4FirstAccessed()

  // Fetch phase1_assessment for ReadingView dynamic blocks and
  // profile modifiers (F.* readings starting M14b.1).
  const { data: assessmentRaw } = await supabase
    .from('phase1_assessment')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  const assessment = assessmentRaw as Phase1AssessmentRow | null
  const exercisesViewed = (progress?.exercises_viewed ?? {}) as Record<string, boolean>

  // Reading rows hydrated from PHASE_4_READINGS registry. Empty in
  // M14b.0; populated in M14b.1 (F.1) and M14b.2 (F.2).
  const readings = PHASE_4_READINGS.map((section) => ({
    section,
    isRead: !!exercisesViewed[section.id],
    // estimatedMinutes is on the section itself per ReadingSection
    // contract; surfaced as `minutes` in the row props for the list
    // component's display copy.
    minutes: section.estimatedMinutes,
  }))

  return (
    <AuthShell>
      <div className="max-w-[720px] mx-auto py-8">
        <p className="text-[12px] font-medium text-primary uppercase tracking-wide mb-1">Phase 4</p>
        <h1 className="text-[28px] md:text-[36px] font-bold text-text-heading mb-6">
          {PHASE_NAMES[4]}
        </h1>

        {/* Reading list — conditional on non-empty registry. M14b.0
            ships with empty registry so this block does not render. */}
        {readings.length > 0 && assessment && (
          <div className="bg-surface border border-border rounded-[12px] p-5 mb-6">
            <p className="text-[14px] font-semibold text-text-heading mb-3">Phase 4 reading</p>
            <Phase4ReadingList readings={readings} phase1={assessment} />
          </div>
        )}
      </div>
    </AuthShell>
  )
}
