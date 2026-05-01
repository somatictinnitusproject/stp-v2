import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'
import { createClient } from '@/lib/supabase/server'
import { incrementCurrentSession } from '@/lib/framework/advance'
import type { Phase1AssessmentRow } from '@/lib/scoring'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/framework/advance', () => ({ incrementCurrentSession: vi.fn() }))
// @/lib/scoring runs real — integration value

// ── Fixtures ─────────────────────────────────────────────────────────────────

// Minimal existing assessment row (all Phase 1 fields null, just identity)
function blankAssessmentRow(): Phase1AssessmentRow {
  return {
    id: 'row-1',
    user_id: 'user-1',
    created_at: '2026-01-01T00:00:00Z',
    completed_at: null,
    tmj_m1_jaw_opening: null,
    tmj_m2_jaw_protrusion: null,
    jaw_clicking: null,
    jaw_locking: null,
    tmj_jaw_drift: null,
    tmj_jaw_drift_direction: null,
    tmj_masseter_asymmetry: null,
    tmj_masseter_dominant_side: null,
    tmj_joint_sounds: null,
    tmj_pterygoid_tenderness: null,
    tmj_pterygoid_tender_side: null,
    tmj_opening_restriction: null,
    tmj_morning_soreness: null,
    tmj_daytime_clenching: null,
    tmj_pain_eating: null,
    tmj_worse_after_chewing: null,
    ctx_orthodontic_history: null,
    ctx_dental_extractions: null,
    ctx_jaw_surgery: null,
    ctx_jaw_injury: null,
    tmj_raw_score: null,
    tmj_normalised_score: null,
    cerv_m3_neck_curl: null,
    cerv_m4_head_rotation: null,
    cerv_m4_asymmetric_side: null,
    cerv_m5_chin_tuck: null,
    cerv_suboccipital_tenderness: null,
    cerv_suboccipital_asymmetric: null,
    cerv_suboccipital_tender_side: null,
    cerv_scm_asymmetry: null,
    cerv_scm_dominant_side: null,
    cerv_trap_asymmetry: null,
    cerv_trap_dominant_side: null,
    cerv_rotation_restriction: null,
    cerv_restricted_side: null,
    cerv_forward_head_posture: null,
    cerv_neck_pain: null,
    cerv_cervicogenic_headaches: null,
    cerv_worse_desk_work: null,
    ctx_whiplash_history: null,
    ctx_sedentary_occupation: null,
    ctx_one_sided_sport: null,
    cerv_raw_score: null,
    cerv_normalised_score: null,
    post_shoulder_asymmetry: null,
    post_elevated_side: null,
    post_dominant_chewing_side: null,
    post_sustained_desk_load: null,
    post_asymmetric_exercise: null,
    ns_stress_tinnitus_correlation: null,
    ns_hypervigilance: null,
    ns_sleep_disruption: null,
    ns_anxiety_loop: null,
    asym_jaw_drift_direction: null,
    asym_masseter_dominant_side: null,
    asym_shoulder_elevated_side: null,
    asym_scm_dominant_side: null,
    asym_tinnitus_worse_ear: null,
    asym_contralateral_pattern: null,
    profile_type: null,
    tmj_protocol_assigned: null,
    cerv_protocol_assigned: null,
    profile_paragraph: null,
  }
}

// Valid submission payload
// TMJ score: M1(+4) + drift(+4) + pterygoid(+4) + masseter(+2)
//            + worse_after_chewing/sometimes(+2) + daytime_clenching/sometimes(+1) + pain_eating/sometimes(+1) = 18
// Cerv score: 0 (all cerv fields absent from M1 payload, user intake null)
const VALID_PAYLOAD: Record<string, string | null> = {
  tmj_m1_jaw_opening: 'yes',
  tmj_m2_jaw_protrusion: 'no',
  tmj_jaw_drift: 'yes',
  tmj_jaw_drift_direction: 'left',
  tmj_masseter_asymmetry: 'yes',
  tmj_masseter_dominant_side: 'right',
  tmj_pterygoid_tenderness: 'yes',
  tmj_pterygoid_tender_side: 'bilateral',
  tmj_joint_sounds: 'no',
  tmj_opening_restriction: 'no',
  tmj_morning_soreness: 'no',
  tmj_daytime_clenching: 'sometimes',
  tmj_pain_eating: 'sometimes',
  tmj_worse_after_chewing: 'sometimes',
  ctx_orthodontic_history: 'no',
  ctx_dental_extractions: 'no',
  ctx_jaw_surgery: 'no',
  ctx_jaw_injury: 'no',
}

// ── Mock helpers ──────────────────────────────────────────────────────────────

interface MockOptions {
  noAuth?: boolean
  assessment?: Phase1AssessmentRow | null
  fetchError?: { code: string; message: string } | null
  updateError?: { code: string; message: string } | null
  updateRows?: { user_id: string }[] | null
}

function buildMockClient(options: MockOptions = {}) {
  let capturedUpdatePayload: Record<string, unknown> | null = null
  let phase1CallCount = 0

  const mockClient = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: options.noAuth ? null : { id: 'user-1' } },
        error: null,
      }),
    },
    from: vi.fn((table: string) => {
      if (table === 'users') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }
      }

      // phase1_assessment — first call is SELECT, second call is UPDATE
      phase1CallCount++
      if (phase1CallCount === 1) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: options.assessment !== undefined ? options.assessment : blankAssessmentRow(),
            error: options.fetchError ?? null,
          }),
        }
      }
      return {
        update: vi.fn((payload: Record<string, unknown>) => {
          capturedUpdatePayload = payload
          return {
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockResolvedValue({
              data: options.updateError
                ? null
                : (options.updateRows ?? [{ user_id: 'user-1' }]),
              error: options.updateError ?? null,
            }),
          }
        }),
      }
    }),
  }

  return {
    mockClient,
    getCapturedPayload: () => capturedUpdatePayload,
  }
}

function makeRequest(body: Record<string, string | null | undefined>): Request {
  return new Request('http://localhost/api/framework/phase-1/module-1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.resetAllMocks()
})

describe('POST /api/framework/phase-1/module-1', () => {

  it('case 1 — happy path: 200 with correct scores, collapsed payload, session advanced', async () => {
    const { mockClient, getCapturedPayload } = buildMockClient()
    vi.mocked(createClient).mockResolvedValue(mockClient as any)
    vi.mocked(incrementCurrentSession).mockResolvedValue(undefined as any)

    const res = await POST(makeRequest(VALID_PAYLOAD))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.tmjRawScore).toBe(18)
    expect(body.cervRawScore).toBe(0)
    expect(body.nextSession).toBe(3)

    // Session advanced with correct args
    expect(incrementCurrentSession).toHaveBeenCalledWith('user-1', 1, 2)

    // Collapsed booleans written to DB (spot-check)
    const payload = getCapturedPayload()
    expect(payload).not.toBeNull()
    expect(payload!.tmj_m1_jaw_opening).toBe(true)            // yes → true
    expect(payload!.tmj_m2_jaw_protrusion).toBe(false)        // no  → false
    expect(payload!.tmj_jaw_drift).toBe(true)                 // yes → true
    expect(payload!.tmj_jaw_drift_direction).toBe('left')     // drift=yes → pass through
    expect(payload!.tmj_pterygoid_tenderness).toBe(true)      // yes → true
    expect(payload!.tmj_masseter_asymmetry).toBe(true)        // yes → true
    expect(payload!.tmj_raw_score).toBe(18)
    expect(payload!.cerv_raw_score).toBe(0)
  })

  it('case 2 — 401 when not authenticated', async () => {
    const { mockClient } = buildMockClient({ noAuth: true })
    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const res = await POST(makeRequest(VALID_PAYLOAD))

    expect(res.status).toBe(401)
    expect(incrementCurrentSession).not.toHaveBeenCalled()
  })

  it('case 3 — 400 when a required key is missing', async () => {
    const { mockClient } = buildMockClient()
    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const incomplete = { ...VALID_PAYLOAD }
    delete (incomplete as Record<string, unknown>).tmj_m1_jaw_opening

    const res = await POST(makeRequest(incomplete as Record<string, string | null>))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.ok).toBe(false)
    expect(incrementCurrentSession).not.toHaveBeenCalled()
  })

  it('case 4 — 409 when no phase1_assessment row exists (B.1 not completed)', async () => {
    const { mockClient } = buildMockClient({ assessment: null })
    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const res = await POST(makeRequest(VALID_PAYLOAD))
    const body = await res.json()

    expect(res.status).toBe(409)
    expect(body.ok).toBe(false)
    expect(incrementCurrentSession).not.toHaveBeenCalled()
  })

  it('case 5 — E7 collapse: sometimes→true, no→false for history/symptom fields', async () => {
    const { mockClient, getCapturedPayload } = buildMockClient()
    vi.mocked(createClient).mockResolvedValue(mockClient as any)
    vi.mocked(incrementCurrentSession).mockResolvedValue(undefined as any)

    const payload: Record<string, string | null> = {
      ...VALID_PAYLOAD,
      tmj_morning_soreness: 'sometimes',   // collapseYesSometimesNo → true
      tmj_daytime_clenching: 'no',         // collapseYesSometimesNo → false
      tmj_pain_eating: 'no',               // collapseYesSometimesNo → false
      tmj_worse_after_chewing: 'no',       // collapseYesSometimesNo → false
      ctx_orthodontic_history: 'yes',      // collapseYesNo → true
    }

    const res = await POST(makeRequest(payload))
    expect(res.status).toBe(200)

    const saved = getCapturedPayload()
    expect(saved!.tmj_morning_soreness).toBe(true)
    expect(saved!.tmj_daytime_clenching).toBe(false)
    expect(saved!.tmj_pain_eating).toBe(false)
    expect(saved!.tmj_worse_after_chewing).toBe(false)
    expect(saved!.ctx_orthodontic_history).toBe(true)
  })

  it('case 6 — unsure jaw drift: tmj_jaw_drift=null, direction=null, score 14 not 18', async () => {
    const { mockClient, getCapturedPayload } = buildMockClient()
    vi.mocked(createClient).mockResolvedValue(mockClient as any)
    vi.mocked(incrementCurrentSession).mockResolvedValue(undefined as any)

    const payload: Record<string, string | null> = {
      ...VALID_PAYLOAD,
      tmj_jaw_drift: 'unsure',
      tmj_jaw_drift_direction: 'left', // should be nulled by E7 when drift != 'yes'
    }

    const res = await POST(makeRequest(payload))
    const body = await res.json()

    expect(res.status).toBe(200)
    // unsure drift = null (not true) → 0 pts, so 18 - 4 = 14
    expect(body.tmjRawScore).toBe(14)

    const saved = getCapturedPayload()
    expect(saved!.tmj_jaw_drift).toBeNull()           // collapseYesNoUnsure('unsure') → null
    expect(saved!.tmj_jaw_drift_direction).toBeNull() // drift != 'yes' → direction nulled
  })

})
