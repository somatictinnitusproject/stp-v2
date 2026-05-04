'use server'

// app/exercise-library/actions.ts
// ─────────────────────────────────────────────────────────────────
// Server action for /exercise-library/[category]/[slug] pages.
// Marks an exercise as viewed by merging its ID into
// framework_progress.exercises_viewed JSONB. Idempotent — already-viewed
// exercises are no-ops.
//
// Visiting an exercise in the library is treated as equivalent to
// completing it once in /session for the purposes of first-view-vs-
// condensed-view (Doc 13 §5.8). A member who reads about Masseter
// Release in the library will subsequently see condensed view in
// /session rather than re-reading full content.
//
// Silent-failure on DB error matches the optimistic-update pattern used
// by /api/session/complete and /app/framework/phase-4/actions.ts.
// ─────────────────────────────────────────────────────────────────

import { createClient } from '@/lib/supabase/server'

export async function markLibraryExerciseViewed(exerciseId: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: progress, error: fetchError } = await supabase
    .from('framework_progress')
    .select('exercises_viewed')
    .eq('user_id', user.id)
    .maybeSingle()

  if (fetchError) {
    console.error(
      '[exercise-library actions] exercises_viewed fetch failed:',
      fetchError.message,
      'user:',
      user.id,
    )
    return
  }
  if (!progress) return

  const currentViewed = (progress.exercises_viewed ?? {}) as Record<string, boolean>

  // Idempotent: already viewed → no-op.
  if (currentViewed[exerciseId] === true) return

  const mergedViewed = {
    ...currentViewed,
    [exerciseId]: true,
  }

  const { error: updateError } = await supabase
    .from('framework_progress')
    .update({ exercises_viewed: mergedViewed })
    .eq('user_id', user.id)

  if (updateError) {
    console.error(
      '[exercise-library actions] exercises_viewed update failed:',
      updateError.message,
      'user:',
      user.id,
      'exerciseId:',
      exerciseId,
    )
  }
}
