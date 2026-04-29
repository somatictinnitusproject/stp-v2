// /app/api/session/complete/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/session/complete — per-exercise completion.
// Called for every exercise except the last. The last exercise calls
// /api/session/finalise instead (which also writes to session_logs).
//
// Writes session_in_progress and exercises_viewed atomically in a single
// UPDATE on framework_progress.
//
// Idempotent — duplicate exerciseId is a no-op; returns 200 either way.
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

  const { sip } = buildNewSip(framework.session_in_progress, exerciseId, today, nowIso)

  const mergedViewed = {
    ...(framework.exercises_viewed ?? {}),
    [exerciseId]: true,
  }

  const { error: updateError } = await supabase
    .from('framework_progress')
    .update({
      session_in_progress: sip,
      exercises_viewed: mergedViewed,
      updated_at: nowIso,
    })
    .eq('user_id', user.id)

  if (updateError) {
    console.error('[complete] framework_progress update failed:', updateError.message)
    return NextResponse.json({ error: 'update_failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
