// /app/api/session/finalise/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/session/finalise — last exercise + session closeout.
// Called only when the exercise being completed is the final one in the list.
// Writes a row to session_logs, then clears session_in_progress.
//
// Transaction strategy: Option B (sequential, no native transaction).
// INSERT session_logs first. If it succeeds, UPDATE framework_progress.
// If the UPDATE fails after a successful INSERT, session_logs row exists but
// session_in_progress is not cleared. On next /session load, stale-clear and
// the all-complete branch recover correctly (completed_exercises contains all
// IDs, so the session renders as complete until the next day).
// Logged loudly if this inconsistency occurs.
//
// If the INSERT fails: return 500, do NOT clear session_in_progress.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildNewSip } from '@/lib/session/build-new-sip'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'invalid_body' }, { status: 400 }) }

  const { exerciseId } = body as Record<string, unknown>
  if (typeof exerciseId !== 'string' || exerciseId.trim() === '') {
    return NextResponse.json({ error: 'invalid_exercise_id' }, { status: 400 })
  }

  const { data: frameworkRaw, error: fetchError } = await supabase
    .from('framework_progress')
    .select('current_phase, session_in_progress, exercises_viewed')
    .eq('user_id', user.id)
    .single()

  if (fetchError || !frameworkRaw) {
    return NextResponse.json({ error: 'not_found' }, { status: 403 })
  }

  const framework = frameworkRaw as {
    current_phase: number
    session_in_progress: Record<string, unknown> | null
    exercises_viewed: Record<string, boolean>
  }

  if (framework.current_phase < 3) {
    return NextResponse.json({ error: 'phase_gate' }, { status: 403 })
  }

  const today = new Date().toISOString().split('T')[0]
  const nowIso = new Date().toISOString()

  const { sip, wasInitialised } = buildNewSip(
    framework.session_in_progress,
    exerciseId,
    today,
    nowIso,
  )

  // Duration in seconds — null if this call also initialised the SIP
  // (edge case: member completes a single exercise without any prior /complete call)
  let sessionDurationSeconds: number | null = null
  if (!wasInitialised) {
    const startedAt = new Date(sip.started_at).getTime()
    const now = new Date(nowIso).getTime()
    sessionDurationSeconds = Math.round((now - startedAt) / 1000)
  }

  const mergedViewed = {
    ...(framework.exercises_viewed ?? {}),
    [exerciseId]: true,
  }

  // Step 1 — INSERT session_logs. If this fails, abort and return 500.
  const { error: logError } = await supabase
    .from('session_logs')
    .insert({
      user_id: user.id,
      session_date: today,
      phase: framework.current_phase,
      exercises_completed: sip.completed_exercises,
      session_duration_seconds: sessionDurationSeconds,
      completed_at: nowIso,
    })

  if (logError) {
    console.error('[finalise] session_logs insert failed:', logError.message, 'user:', user.id)
    return NextResponse.json({ error: 'log_failed' }, { status: 500 })
  }

  // Step 2 — UPDATE framework_progress: clear session_in_progress, merge exercises_viewed.
  // If this fails after a successful insert, log loudly. Recovery: on next /session load,
  // the stale-clear or all-complete branch renders correctly.
  const { error: updateError } = await supabase
    .from('framework_progress')
    .update({
      session_in_progress: null,
      exercises_viewed: mergedViewed,
      updated_at: nowIso,
    })
    .eq('user_id', user.id)

  if (updateError) {
    console.error(
      '[finalise] INCONSISTENCY — session_logs inserted but framework_progress update failed.',
      'user:', user.id,
      'error:', updateError.message,
    )
    return NextResponse.json({ error: 'update_failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
