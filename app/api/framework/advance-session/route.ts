import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PHASE_SESSION_COUNTS } from '@/content/framework-manifest'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  const { phase, session } = body as { phase: number; session: number }

  if (typeof phase !== 'number' || typeof session !== 'number') {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  // Only phases 1, 2, 5 — phases 3 and 4 advance via /session (Phase D scope)
  if (![1, 2, 5].includes(phase)) {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  const { data: progress } = await supabase
    .from('framework_progress')
    .select('current_phase, current_session')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!progress) return NextResponse.json({ success: false }, { status: 404 })

  // TODO Phase E: once /content/session-lists/ exists with session IDs,
  // upgrade idempotency check from phase+session numeric comparison to
  // session ID comparison per Doc 13 §7.8:
  //   const currentSessionId = getSessionIdForPosition(
  //     progress.current_phase,
  //     progress.current_session
  //   )
  //   const completedSessionId = getSessionIdFromRequest(phase, session)
  //   if (completedSessionId !== currentSessionId) return {success: true, ...}
  // Catches stale-content submissions where numbers coincidentally align
  // but represent different content.

  // Idempotency check — Doc 13 §7.8: only increment if submitted matches current
  // active position. Already-completed or out-of-order calls return without writing.
  if (phase !== progress.current_phase || session !== progress.current_session) {
    return NextResponse.json({ success: true, next_session: progress.current_session })
  }

  const totalInPhase = PHASE_SESSION_COUNTS[phase] ?? 1

  // At last session — do NOT auto-advance phase (Doc 13 §7.8 explicit).
  // Stays at max until explicit phase advancement trigger fires (§7.2–7.6).
  if (progress.current_session >= totalInPhase) {
    return NextResponse.json({ success: true, next_session: progress.current_session })
  }

  const nextSession = progress.current_session + 1

  const { error } = await supabase
    .from('framework_progress')
    .update({ current_session: nextSession })
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ success: false }, { status: 500 })

  return NextResponse.json({ success: true, next_session: nextSession })
}
