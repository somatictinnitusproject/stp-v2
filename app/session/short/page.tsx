// /app/session/short/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Server component. /session/short — the shorter daily practice option.
// Per M13i locked decisions: fixed per-profile exercise list, no rotation.
// Reuses SessionClient from /app/session/ with isShorterSession={true}.
//
// Known limitation: session_in_progress does not differentiate shorter from
// full sessions. A member who starts a shorter session and then navigates to
// /session (full) will see their shorter-session SIP completed_exercises in
// the full session list. This edge case is documented and accepted in M13i.
// The realistic flow is: member completes shorter session (writes session_logs
// with is_shorter_session=true), or abandons it (SIP stale-cleared next day).
// ─────────────────────────────────────────────────────────────────────────────

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AuthShell from '@/components/shells/AuthShell'
import { buildShorterSessionExerciseList, getShorterSessionDuration } from '@/lib/session/build-shorter-session'
import { getSessionState } from '@/lib/session/get-session-state'
import { getExerciseById } from '@/content/exercises/_lookup'
import { getTodayStatus } from '@/lib/session/get-today-status'
import SessionClient from '../session-client'
import type { FrameworkProgressRow, Phase1AssessmentRow } from '@/lib/scoring/types'

export default async function ShortSessionPage() {
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

  if (!assessmentRaw) redirect('/dashboard')

  const framework = frameworkRaw as unknown as FrameworkProgressRow
  const assessment = assessmentRaw as unknown as Phase1AssessmentRow
  const today = new Date().toISOString().split('T')[0]

  // Stale-clear: same logic as /session
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

  // Build shorter list and apply E5 duration override
  const exerciseIds = buildShorterSessionExerciseList(framework, assessment)
  const exerciseList = exerciseIds.map(id => {
    const exercise = getExerciseById(id)
    return {
      ...exercise,
      estimatedMinutes: getShorterSessionDuration(id, exercise.estimatedMinutes ?? 0),
    }
  })

  const state = getSessionState(framework, exerciseList, today)

  const todayStatus = getTodayStatus({
    sessionInProgress: framework.session_in_progress as Record<string, unknown> | null,
    todaysSessionLog,
    totalExerciseCount: exerciseList.length,
    today,
  })

  return (
    <AuthShell>
      <SessionClient
        exerciseList={exerciseList}
        phase1={assessment}
        initialCompletedIds={state.completedIds}
        initialState={state.kind}
        exercisesViewed={framework.exercises_viewed ?? {}}
        showCompleteState={todayStatus.kind === 'done'}
        isShorterSession={true}
      />
    </AuthShell>
  )
}
