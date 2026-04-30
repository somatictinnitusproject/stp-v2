// app/framework/phase-3/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Server component. Static route — shadows [phase]/page.tsx for /framework/phase-3.
// Phases 1, 2, 4, 5 continue to be served by the dynamic [phase] route.
//
// Renders:
//   - Phase 3 header (eyebrow + h1)
//   - StateSummary card (release-since, resistance state, day count)
//   - Phase3CompletionBlock (gate-enforced button + modal + permanent prompt)
//
// Gate logic (both required for button active):
//   1. PHASE3_MINIMUM_WEEKS elapsed since phase2_completed_at
//   2. resistance_phase_start IS NOT NULL
//
// If phase3_completed_at is already set, member has advanced — redirect to
// /framework/phase-5 (they have moved on).
// ─────────────────────────────────────────────────────────────────────────────

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AuthShell from '@/components/shells/AuthShell'
import { PHASE_NAMES } from '@/content/framework-manifest'
import { SCORING_THRESHOLDS } from '@/content/scoring-thresholds'
import StateSummary from './components/StateSummary'
import Phase3CompletionBlock from './components/Phase3CompletionBlock'
import { advancePhase3ToPhase5 } from './actions'

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function Phase3OverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: progress, error } = await supabase
    .from('framework_progress')
    .select('current_phase, phase2_completed_at, phase3_completed_at, resistance_phase_start')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) console.error('[phase-3 overview] fetch error:', error)

  if (!progress || !progress.phase2_completed_at || (progress.current_phase ?? 1) < 3) {
    redirect('/dashboard')
  }

  // Member has already advanced past Phase 3
  if (progress.phase3_completed_at) redirect('/framework/phase-5')

  const phase2CompletedAt = new Date(progress.phase2_completed_at)
  const now = new Date()

  const releasePhaseSince = formatDate(phase2CompletedAt)
  const resistanceStartDate = progress.resistance_phase_start
    ? new Date(progress.resistance_phase_start)
    : null
  const resistanceState = resistanceStartDate
    ? { startDate: formatDate(resistanceStartDate) }
    : null

  // floor((now - phase2_completed_at) / 1 day) + 1 — phase2_completed_at is day 1
  const daysIntoPhase3 = Math.floor(
    (now.getTime() - phase2CompletedAt.getTime()) / (24 * 60 * 60 * 1000)
  ) + 1

  const dateGateMs = SCORING_THRESHOLDS.PHASE3_MINIMUM_WEEKS * 7 * 24 * 60 * 60 * 1000
  const dateGateMet = now.getTime() - phase2CompletedAt.getTime() >= dateGateMs
  const resistanceGateMet = resistanceStartDate !== null
  const buttonActive = dateGateMet && resistanceGateMet

  const unlockDate = formatDate(new Date(phase2CompletedAt.getTime() + dateGateMs))

  // Inactive message — three variants per Locked Decision 2. Null when button active.
  let inactiveMessage: string | null = null
  if (!buttonActive) {
    if (!dateGateMet && !resistanceGateMet) {
      inactiveMessage = `Available from ${unlockDate}, and once the resistance phase has been acknowledged.`
    } else if (!resistanceGateMet) {
      inactiveMessage = 'Available once the resistance phase has been acknowledged.'
    } else {
      inactiveMessage = `Available from ${unlockDate}.`
    }
  }

  return (
    <AuthShell>
      <div className="max-w-[720px] mx-auto py-8">

        {/* Phase label + heading — matching visual treatment of [phase]/page.tsx */}
        <p className="text-[12px] font-medium text-primary uppercase tracking-wide mb-1">Phase 3</p>
        <h1 className="text-[28px] md:text-[36px] font-bold text-text-heading mb-6">
          {PHASE_NAMES[3]}
        </h1>

        <StateSummary
          releasePhaseSince={releasePhaseSince}
          resistanceState={resistanceState}
          daysIntoPhase3={daysIntoPhase3}
        />

        <Phase3CompletionBlock
          buttonActive={buttonActive}
          inactiveMessage={inactiveMessage}
          advanceAction={advancePhase3ToPhase5}
        />

      </div>
    </AuthShell>
  )
}
