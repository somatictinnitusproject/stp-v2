// app/framework/phase-4/actions.ts
// ─────────────────────────────────────────────────────────────────
// Server actions for Phase 4 overview page:
//   - markPhase4FirstAccessed: idempotent first-access timestamp
//     write (M14a).
//   - acknowledgePhase4Reading: idempotent merge of a Phase 4
//     reading id into framework_progress.exercises_viewed (M14b.0).
//
// Both actions use silent-failure on DB error to match the
// optimistic-update pattern used by /api/session/complete.
// ─────────────────────────────────────────────────────────────────

'use server'

import { createClient } from '@/lib/supabase/server'

export async function markPhase4FirstAccessed(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Idempotent guard: only update when column is currently NULL.
  const { data: progress } = await supabase
    .from('framework_progress')
    .select('phase4_first_accessed')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!progress || progress.phase4_first_accessed) return

  const { error } = await supabase
    .from('framework_progress')
    .update({ phase4_first_accessed: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('phase4_first_accessed', null)

  if (error) {
    console.error('[phase-4 actions] phase4_first_accessed write failed:', error.message, 'user:', user.id)
  }
}

export async function acknowledgePhase4Reading(readingId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: progress, error: fetchError } = await supabase
    .from('framework_progress')
    .select('exercises_viewed')
    .eq('user_id', user.id)
    .maybeSingle()

  if (fetchError) {
    console.error('[phase-4 actions] exercises_viewed fetch failed:', fetchError.message, 'user:', user.id)
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
    console.error('[phase-4 actions] exercises_viewed update failed:', updateError.message, 'user:', user.id, 'readingId:', readingId)
  }
}
