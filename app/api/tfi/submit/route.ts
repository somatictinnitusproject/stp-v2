/**
 * app/api/tfi/submit/route.ts
 *
 * POST /api/tfi/submit
 *
 * Accepts client-computed TFI responses and scores, re-computes scores
 * server-side as a defence against client tampering, and inserts the row
 * into tfi_responses. Returns 409 if a row for this capture_point already
 * exists (idempotent).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canAccessPlatform } from '@/lib/auth/access'
import { calculateTfiScores } from '@/lib/tfi/scoring'
import type { TfiResponses, TfiScores } from '@/lib/tfi/scoring'

type CapturePoint = 'intake' | 'completion' | 'follow_up_6m'
const VALID_CAPTURE_POINTS: readonly CapturePoint[] = ['intake', 'completion', 'follow_up_6m']

interface SubmitBody {
  capture_point: CapturePoint
  items: TfiResponses
  scores: TfiScores
}

function isValidItemValue(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 10
}

function validateItems(items: unknown): items is TfiResponses {
  if (typeof items !== 'object' || items === null) return false
  for (let i = 1; i <= 25; i++) {
    if (!isValidItemValue((items as Record<string, unknown>)[`item_${i}`])) return false
  }
  return true
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: membership } = await supabase
    .from('memberships')
    .select('status, is_founding_member')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership || !canAccessPlatform(membership)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const { capture_point, items, scores: clientScores } =
    (body ?? {}) as Partial<SubmitBody>

  // Validate capture_point.
  if (!capture_point || !VALID_CAPTURE_POINTS.includes(capture_point)) {
    return NextResponse.json({ error: 'invalid_capture_point' }, { status: 400 })
  }

  // Validate all 25 item values.
  if (!validateItems(items)) {
    return NextResponse.json({ error: 'invalid_items' }, { status: 400 })
  }

  // Re-compute scores server-side — use server values regardless of client.
  const serverScores = calculateTfiScores(items)

  // Log if client scores differ from server scores (indicates tampering or bug).
  if (clientScores && clientScores.total_score !== serverScores.total_score) {
    console.warn(
      '[tfi/submit] client/server score mismatch',
      'user:', user.id,
      'capture_point:', capture_point,
      'client_total:', clientScores.total_score,
      'server_total:', serverScores.total_score,
    )
  }

  // Eligibility re-check server-side.
  if (capture_point === 'intake' || capture_point === 'completion') {
    const [{ data: phase1 }, { data: framework }] = await Promise.all([
      supabase
        .from('phase1_assessment')
        .select('created_at')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('framework_progress')
        .select('phase5_completed_at')
        .eq('user_id', user.id)
        .maybeSingle(),
    ])

    if (capture_point === 'intake' && !phase1?.created_at) {
      return NextResponse.json({ error: 'not_eligible' }, { status: 403 })
    }
    if (capture_point === 'completion' && !framework?.phase5_completed_at) {
      return NextResponse.json({ error: 'not_eligible' }, { status: 403 })
    }
  }

  // Insert — UNIQUE(user_id, capture_point) returns a conflict on duplicates.
  const { error: insertError } = await supabase.from('tfi_responses').insert({
    user_id: user.id,
    capture_point,
    ...items,
    subscale_intrusive:        serverScores.subscale_intrusive,
    subscale_sense_of_control: serverScores.subscale_sense_of_control,
    subscale_cognitive:        serverScores.subscale_cognitive,
    subscale_sleep:            serverScores.subscale_sleep,
    subscale_auditory:         serverScores.subscale_auditory,
    subscale_relaxation:       serverScores.subscale_relaxation,
    subscale_quality_of_life:  serverScores.subscale_quality_of_life,
    subscale_emotional:        serverScores.subscale_emotional,
    total_score:               serverScores.total_score,
  })

  if (insertError) {
    // Unique constraint violation = already submitted for this capture point.
    if (insertError.code === '23505') {
      return NextResponse.json({ error: 'already_submitted' }, { status: 409 })
    }
    console.error('[tfi/submit] insert failed:', insertError.message, 'user:', user.id)
    return NextResponse.json({ error: 'insert_failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
