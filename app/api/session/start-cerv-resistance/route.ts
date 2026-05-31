// /app/api/session/start-cerv-resistance/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// POST — sets cerv_sequential_resistance_start for Option 1 dual-driver members.
// Called by CervSequentialResistanceCard when the member taps "Begin cervical
// resistance phase". Idempotent — if already set, returns 200 unchanged.
//
// Guards:
//   - Authenticated
//   - protocol_option must be 1
//   - cerv_sequential_phase_start must already be set (cerv release started)
//   - cerv_sequential_resistance_start must be null (not yet started)
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: progress, error: fetchError } = await supabase
    .from('framework_progress')
    .select('protocol_option, cerv_sequential_phase_start, cerv_sequential_resistance_start')
    .eq('user_id', user.id)
    .single()

  if (fetchError || !progress) {
    return NextResponse.json({ error: 'not_found' }, { status: 403 })
  }

  if (progress.protocol_option !== 1) {
    return NextResponse.json({ error: 'not_sequential' }, { status: 400 })
  }

  if (!progress.cerv_sequential_phase_start) {
    return NextResponse.json({ error: 'cerv_release_not_started' }, { status: 400 })
  }

  // Idempotent — already started
  if (progress.cerv_sequential_resistance_start !== null) {
    return NextResponse.json({ ok: true })
  }

  const nowIso = new Date().toISOString()
  const { error: updateError } = await supabase
    .from('framework_progress')
    .update({ cerv_sequential_resistance_start: nowIso })
    .eq('user_id', user.id)

  if (updateError) {
    console.error('[start-cerv-resistance] update failed:', updateError.message)
    return NextResponse.json({ error: 'update_failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, startedAt: nowIso })
}
