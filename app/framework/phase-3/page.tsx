// app/framework/phase-3/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Server component. Static route — shadows [phase]/page.tsx for /framework/phase-3.
// Phases 1, 2, 4, 5 continue to be served by the dynamic [phase] route.
//
// Renders:
//   - Phase 3 header (eyebrow + h1)
//   - StateSummary card (release-since, resistance state, day count)
//   - Phase3ReadingList (TMJ members only — expandable inline readings, M13l.2)
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
import { getReadingSectionById } from '@/content/framework/phase-3/_lookup'
import type { Phase1AssessmentRow } from '@/lib/scoring/types'
import StateSummary from './components/StateSummary'
import Phase3CompletionBlock from './components/Phase3CompletionBlock'
import Phase3ReadingList from './components/Phase3ReadingList'
import ResistancePhaseCard from './components/ResistancePhaseCard'
import CervSequentialStartCard from './components/CervSequentialStartCard'
import CervSequentialResistanceCard from './components/CervSequentialResistanceCard'
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
    .select('current_phase, phase2_completed_at, phase3_completed_at, resistance_phase_start, exercises_viewed, protocol_option, cerv_sequential_phase_start, cerv_sequential_resistance_start')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) console.error('[phase-3 overview] fetch error:', error)

  if (!progress || !progress.phase2_completed_at || (progress.current_phase ?? 1) < 3) {
    redirect('/dashboard')
  }

  // Member has already advanced past Phase 3
  if (progress.phase3_completed_at) redirect('/framework/phase-5')

  // Fetch full phase1_assessment row — needed for ReadingView profile modifiers (M13l.2)
  const { data: assessmentRaw } = await supabase
    .from('phase1_assessment')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  const assessment = assessmentRaw as Phase1AssessmentRow | null
  const tmjAssigned = assessment?.tmj_protocol_assigned === true
  const cervAssigned = assessment?.cerv_protocol_assigned === true
  // Sequential dual-driver: both protocols assigned, Option 1 chosen
  const isSequentialDual = progress.protocol_option === 1 && tmjAssigned && cervAssigned
  const exercisesViewed = (progress.exercises_viewed ?? {}) as Record<string, boolean>

  const phase2CompletedAt = new Date(progress.phase2_completed_at)
  const now = new Date()

  // D.13 appears in the reading card only once acknowledged — re-readable inline expand.
  const showD13 = !!exercisesViewed['D13_resistance_intro']

  const readingRowDefs = [
    { id: 'D1_phase3_opening', minutes: 5 },
    { id: 'D2_forewarning', minutes: 4 },
    { id: 'D3_release_intro', minutes: 4 },
    ...(showD13 ? [{ id: 'D13_resistance_intro', minutes: 4 }] : []),
  ]

  const readings = readingRowDefs.map(({ id, minutes }) => ({
    section: getReadingSectionById(id),
    isRead: !!exercisesViewed[id],
    minutes,
  }))

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

        {/* Resistance phase entry point — TMJ members only (D.13). */}
        {tmjAssigned && assessment && (
          <ResistancePhaseCard
            resistancePhaseStart={progress.resistance_phase_start ?? null}
            phase2CompletedAt={progress.phase2_completed_at}
            phase1={assessment}
            protocolOption={progress.protocol_option ?? null}
          />
        )}

        {/* Sequential dual-driver cervical cards — Option 1, both protocols assigned.
            Each card manages its own started/not-started state, same as ResistancePhaseCard.
            CervSequentialStartCard: visible once jaw resistance is active.
            CervSequentialResistanceCard: visible once cervical release is active. */}
        {isSequentialDual && progress.resistance_phase_start && (
          <CervSequentialStartCard
            cervSequentialPhaseStart={progress.cerv_sequential_phase_start ?? null}
          />
        )}
        {isSequentialDual && progress.cerv_sequential_phase_start && (
          <CervSequentialResistanceCard
            cervSequentialPhaseStart={progress.cerv_sequential_phase_start}
            cervSequentialResistanceStart={progress.cerv_sequential_resistance_start ?? null}
          />
        )}

        {/* Phase 3 reading — TMJ members only (M13l.2). Cervical readings land M13r. */}
        {tmjAssigned && assessment && (
          <div className="bg-surface border border-border rounded-[12px] p-5 mb-6">
            <p className="text-[14px] font-semibold text-text-heading mb-3">Phase 3 reading</p>
            <Phase3ReadingList
              readings={readings}
              phase1={assessment}
              protocolOption={progress.protocol_option ?? null}
            />
          </div>
        )}

        <Phase3CompletionBlock
          buttonActive={buttonActive}
          inactiveMessage={inactiveMessage}
          advanceAction={advancePhase3ToPhase5}
        />

      </div>
    </AuthShell>
  )
}
