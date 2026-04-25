// B.1 acknowledge handler — POST.
// Called when member clicks "I have read this section" at the end of Phase 1 session 1.
//
// ERRATA E8: Doc 13 §1.10 progressive save pattern is pure UPDATE and assumes the
// phase1_assessment row already exists. This route creates that row on B.1 acknowledge.
// Subsequent module submissions (module-1, module-2 …) are pure UPDATEs per §1.10.
//
// Pseudocode:
//   1. Auth check — 401 if no user.
//   2. INSERT INTO phase1_assessment (user_id) VALUES (auth.uid())
//      ON CONFLICT (user_id) DO NOTHING — idempotent, repeat acknowledgements are harmless.
//      Requires UNIQUE constraint on phase1_assessment.user_id (see ERRATA E8).
//   3. Call incrementCurrentSession(userId, phase=1, completedSession=1) per Doc 13 §7.8.
//      Idempotency check in the helper prevents double-increment on retry.
//   4. Return 200 { ok: true, nextSession: 2 }.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { incrementCurrentSession } from '@/lib/framework/advance'

export async function POST() {
  console.log('[b1-acknowledge] POST received')

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  console.log('[b1-acknowledge] auth result', { userId: user?.id ?? null, authError })
  if (!user) return NextResponse.json({ success: false }, { status: 401 })

  console.log('[b1-acknowledge] attempting upsert for user', user.id)

  // ERRATA E8 — create phase1_assessment row. ON CONFLICT DO NOTHING = idempotent.
  // ignoreDuplicates: true maps to ON CONFLICT (user_id) DO NOTHING in Supabase client.
  const { error: upsertError } = await supabase
    .from('phase1_assessment')
    .upsert({ user_id: user.id }, { onConflict: 'user_id', ignoreDuplicates: true })

  console.log('[b1-acknowledge] upsert result', {
    error: upsertError
      ? { code: upsertError.code, message: upsertError.message, details: upsertError.details, hint: upsertError.hint }
      : null,
  })

  if (upsertError) {
    console.error('[b1-acknowledge] upsert failed', upsertError)
    return NextResponse.json(
      { success: false, message: 'Failed to initialise assessment.' },
      { status: 500 },
    )
  }

  console.log('[b1-acknowledge] upsert succeeded, calling incrementCurrentSession')

  // Doc 13 §7.8 — advance current_session from 1 → 2
  try {
    await incrementCurrentSession(user.id, 1, 1)
    console.log('[b1-acknowledge] incrementCurrentSession succeeded')
  } catch (err) {
    console.error('[b1-acknowledge] incrementCurrentSession failed', err)
    return NextResponse.json(
      { success: false, message: 'Failed to advance session.' },
      { status: 500 },
    )
  }

  console.log('[b1-acknowledge] returning 200 ok')
  return NextResponse.json({ ok: true, nextSession: 2 })
}
