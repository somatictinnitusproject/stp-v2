// app/framework/phase-4/actions.ts
// ─────────────────────────────────────────────────────────────────
// Server action: write phase4_first_accessed on overview entry.
// Idempotent — only writes if column is currently NULL. Safe to
// call on every overview load.
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
