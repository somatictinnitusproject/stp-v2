// /app/session/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Server component. /session — the daily practice view for Phase 3 members.
// Specified in Doc 12 §6.6; construction logic from Doc 13 §5.4–§5.9
// (subject to errata P3-12, P3-14, P3-15, P3-16, P3-17).
//
// Responsibilities:
//   1. Auth gate → /login
//   2. Phase gate → /dashboard (current_phase < 3)
//   3. Stale-clear: session_in_progress with a past date → NULL inline
//   4. session_logs check → showCompleteState (M13j, closes M13h.1 refresh gap)
//   5. Build orientation reading IDs (TMJ members, M13l) + exercise IDs
//   6. Resolve mixed IDs to (Exercise | ReadingSection)[] session list
//   7. Compute session state (pure fn from get-session-state.ts)
//   8. Render via AuthShell + SessionClient
//
// No data fetching in children — everything passed via props.
// ─────────────────────────────────────────────────────────────────────────────

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AuthShell from '@/components/shells/AuthShell'
import { buildSessionExerciseList, buildPhase3OrientationList } from '@/lib/session/build-session'
import { getSessionState } from '@/lib/session/get-session-state'
import { getExerciseById } from '@/content/exercises/_lookup'
import { getReadingSectionById } from '@/content/framework/phase-3/_lookup'
import { PHASE_3_READING_IDS } from '@/content/framework/phase-3'
import SessionClient from './session-client'
import type { FrameworkProgressRow, Phase1AssessmentRow } from '@/lib/scoring/types'
import { getTodayStatus } from '@/lib/session/get-today-status'

export default async function SessionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: frameworkRaw } = await supabase
    .from('framework_progress')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!frameworkRaw || frameworkRaw.current_phase < 3) redirect('/dashboard')

  const { data: assessmentRaw } = await supabase
    .from('phase1_assessment')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Shouldn't happen for a Phase 3 member but handle defensively
  if (!assessmentRaw) redirect('/dashboard')

  const framework = frameworkRaw as unknown as FrameworkProgressRow
  const assessment = assessmentRaw as unknown as Phase1AssessmentRow

  const today = new Date().toISOString().split('T')[0]  // YYYY-MM-DD UTC

  // Stale-clear: session_in_progress from a previous day is wiped before
  // computing state so the member starts fresh, not mid-yesterday's session.
  const sip = framework.session_in_progress as null | { session_date: string }
  if (sip && sip.session_date !== today) {
    await supabase
      .from('framework_progress')
      .update({ session_in_progress: null })
      .eq('user_id', user.id)
    framework.session_in_progress = null
  }

  const { data: todaysSessionLog } = await supabase
    .from('session_logs')
    .select('completed_at')
    .eq('user_id', user.id)
    .eq('session_date', today)
    .eq('phase', framework.current_phase)
    .maybeSingle()

  // Build orientation reading IDs for TMJ members (M13l). Cervical readings
  // (E.1–E.4) are M13r. Acknowledged readings (exercises_viewed[id] === true)
  // are excluded — they drop out of the session list permanently.
  const orientationIds = assessment.tmj_protocol_assigned
    ? buildPhase3OrientationList(framework.exercises_viewed ?? {})
    : []

  // Build exercise IDs from member state (pure fn, M13d)
  const exerciseIds = buildSessionExerciseList(framework, assessment)

  // Combined list: orientation readings first, then exercises
  const allIds = [...orientationIds, ...exerciseIds]

  // Map each ID to its full object — readings via reading lookup, exercises via exercise lookup
  const sessionList = allIds.map((id) =>
    PHASE_3_READING_IDS.has(id) ? getReadingSectionById(id) : getExerciseById(id),
  )

  const state = getSessionState(framework, sessionList, today)

  const todayStatus = getTodayStatus({
    sessionInProgress: framework.session_in_progress as Record<string, unknown> | null,
    todaysSessionLog,
    totalExerciseCount: sessionList.length,
    today,
  })

  return (
    <AuthShell>
      <SessionClient
        sessionList={sessionList}
        phase1={assessment}
        protocolOption={framework.protocol_option}
        initialCompletedIds={state.completedIds}
        initialState={state.kind}
        exercisesViewed={framework.exercises_viewed ?? {}}
        showCompleteState={todayStatus.kind === 'done'}
        isShorterSession={false}
      />
    </AuthShell>
  )
}
