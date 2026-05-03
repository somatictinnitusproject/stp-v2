// app/framework/phase-5/actions.ts
// ─────────────────────────────────────────────────────────────────
// Server actions for Phase 5 overview page:
//   - acknowledgePhase5Reading: idempotent merge of a Phase 5
//     reading id into framework_progress.exercises_viewed.
//
// Mirrors app/framework/phase-4/actions.ts → acknowledgePhase4Reading
// exactly. Uses the same exercises_viewed JSONB column — no new DB
// column or migration required.
// ─────────────────────────────────────────────────────────────────

'use server'

import { createClient } from '@/lib/supabase/server'

export async function acknowledgePhase5Reading(readingId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: progress, error: fetchError } = await supabase
    .from('framework_progress')
    .select('exercises_viewed')
    .eq('user_id', user.id)
    .maybeSingle()

  if (fetchError) {
    console.error('[phase-5 actions] exercises_viewed fetch failed:', fetchError.message, 'user:', user.id)
    return
  }
  if (!progress) return

  const currentViewed = (progress.exercises_viewed ?? {}) as Record<string, boolean>

  // Idempotent: already acknowledged → no-op.
  if (currentViewed[readingId] === true) return

  const mergedViewed = {
    ...currentViewed,
    [readingId]: true,
  }

  const { error: updateError } = await supabase
    .from('framework_progress')
    .update({ exercises_viewed: mergedViewed })
    .eq('user_id', user.id)

  if (updateError) {
    console.error('[phase-5 actions] exercises_viewed update failed:', updateError.message, 'user:', user.id, 'readingId:', readingId)
  }
}
