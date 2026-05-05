/**
 * app/api/tfi/dismiss/route.ts
 *
 * POST /api/tfi/dismiss
 *
 * Merges a dismissal timestamp into framework_progress.tfi_dismissals
 * for the given capture_point. Idempotent — re-dismissing already-dismissed
 * capture points is a no-op at the application level (JSONB merge overwrites).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type CapturePoint = 'intake' | 'completion'
const VALID_CAPTURE_POINTS: readonly CapturePoint[] = ['intake', 'completion']

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const { capture_point } = (body ?? {}) as { capture_point?: string }
  if (!capture_point || !VALID_CAPTURE_POINTS.includes(capture_point as CapturePoint)) {
    return NextResponse.json({ error: 'invalid_capture_point' }, { status: 400 })
  }

  // Fetch current dismissals.
  const { data: framework, error: fetchError } = await supabase
    .from('framework_progress')
    .select('tfi_dismissals')
    .eq('user_id', user.id)
    .maybeSingle()

  if (fetchError || !framework) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const current = (framework.tfi_dismissals ?? {}) as Record<string, string>
  const merged = { ...current, [capture_point]: new Date().toISOString() }

  const { error: updateError } = await supabase
    .from('framework_progress')
    .update({ tfi_dismissals: merged })
    .eq('user_id', user.id)

  if (updateError) {
    console.error('[tfi/dismiss] update failed:', updateError.message, 'user:', user.id)
    return NextResponse.json({ error: 'update_failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
