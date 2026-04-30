'use server'

// app/framework/phase-3/actions.ts
// ─────────────────────────────────────────────────────────────────────────────
// Server action: advancePhase3ToPhase5.
// Re-validates both gates server-side before writing. Never trusts the client.
// Idempotent: if phase3_completed_at already set, returns success without
// double-writing.
// ─────────────────────────────────────────────────────────────────────────────

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { SCORING_THRESHOLDS } from '@/content/scoring-thresholds'

export async function advancePhase3ToPhase5(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'unauthenticated' }

  const { data: progress, error: fetchError } = await supabase
    .from('framework_progress')
    .select('phase2_completed_at, resistance_phase_start, phase3_completed_at, current_phase')
    .eq('user_id', user.id)
    .maybeSingle()

  if (fetchError) {
    console.error('[phase-3 advance] fetch error:', fetchError.message, 'user:', user.id)
    return { success: false, error: 'db' }
  }

  if (!progress) return { success: false, error: 'not_found' }

  // Idempotent — already advanced, do not double-write
  if (progress.phase3_completed_at) return { success: true }

  // Re-validate both gates server-side
  if (!progress.phase2_completed_at || !progress.resistance_phase_start) {
    return { success: false, error: 'gate_failed' }
  }

  const dateGateMs = SCORING_THRESHOLDS.PHASE3_MINIMUM_WEEKS * 7 * 24 * 60 * 60 * 1000
  const elapsed = Date.now() - new Date(progress.phase2_completed_at).getTime()
  if (elapsed < dateGateMs) return { success: false, error: 'gate_failed' }

  const now = new Date().toISOString()
  const { error: updateError } = await supabase
    .from('framework_progress')
    .update({
      current_phase: 5,
      current_session: 1,
      phase3_completed_at: now,
      updated_at: now,
    })
    .eq('user_id', user.id)

  if (updateError) {
    console.error('[phase-3 advance] update error:', updateError.message, 'user:', user.id)
    return { success: false, error: 'db' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/framework/phase-3')
  return { success: true }
}
