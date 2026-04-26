// Doc 13 §7.8 — idempotency-safe session advance helper.
// Extracted here so phase-1 module submission routes (E1b) and future routes
// share a single implementation. The existing /api/framework/advance-session
// route retains its own inline copy — it uses a different param shape and is
// not refactored here to avoid unnecessary churn on a working route.

import { createClient } from '@/lib/supabase/server'
import { PHASE_SESSION_COUNTS } from '@/content/framework-manifest'

// incrementCurrentSession — only advances current_session if the submitted
// phase+session matches the member's current active position. Returns
// { nextSession } regardless of whether an increment occurred, so callers
// always know where to redirect.
//
// Doc 13 §7.8 guarantees:
//   - Stale or duplicate submissions are silently ignored
//   - At the last session in a phase, current_session stays at max (no auto-advance)
//   - Phase advancement is a separate trigger — this helper never touches current_phase
export async function incrementCurrentSession(
  userId: string,
  phase: number,
  completedSession: number,
): Promise<{ nextSession: number }> {
  const supabase = await createClient()

  const { data: progress, error: fetchError } = await supabase
    .from('framework_progress')
    .select('current_phase, current_session')
    .eq('user_id', userId)
    .maybeSingle()

  if (fetchError) throw fetchError
  if (!progress) throw new Error('framework_progress row not found for user')

  // §7.8 idempotency: only advance when submitted position matches current active
  if (phase !== progress.current_phase || completedSession !== progress.current_session) {
    return { nextSession: progress.current_session }
  }

  const totalInPhase = PHASE_SESSION_COUNTS[phase] ?? 1

  // At last session — stay at max, do not auto-advance phase (§7.8 explicit)
  if (progress.current_session >= totalInPhase) {
    return { nextSession: progress.current_session }
  }

  const nextSession = progress.current_session + 1

  const { error: updateError } = await supabase
    .from('framework_progress')
    .update({ current_session: nextSession })
    .eq('user_id', userId)

  if (updateError) throw updateError

  return { nextSession }
}

/**
 * Advance member from Phase 1 to Phase 2. Doc 13 §7.2.
 *
 * Called by the M11c confirm-profile route after the member acknowledges
 * their profile and (where applicable) selects a protocol option.
 *
 * Idempotency: writes phase1_completed_at unconditionally — if called twice,
 * the second call overwrites the timestamp and protocol option. The route
 * does not currently guard against re-submission, but no data is lost on
 * retry. A future erratum may add an idempotency check.
 *
 * @param userId — auth user id
 * @param protocolOption — 1 (Sequential), 2 (Parallel), 3 (Prioritised Parallel), or null (single-driver/low-confidence)
 * @throws if framework_progress row not found or update fails
 */
export async function advancePhase1(
  userId: string,
  protocolOption: 1 | 2 | 3 | null,
): Promise<void> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('framework_progress')
    .update({
      phase1_completed_at: new Date().toISOString(),
      current_phase: 2,
      current_session: 1,
      protocol_option: protocolOption,
    })
    .eq('user_id', userId)
    .select('user_id')

  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('framework_progress row not found for user')
  }
}
