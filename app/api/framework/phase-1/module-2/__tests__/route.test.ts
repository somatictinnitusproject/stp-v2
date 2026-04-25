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

// Valid submission payload — all cervical indicators 'yes' → cervRawScore = 25, tmjRawScore = 0
// Score breakdown: M3(+4) + M4(+4) + suboccipital(+4) + worse_desk(+3) + M5(+2)
//                 + rotation_restriction(+2) + SCM/trap OR(+2) + fwd_head(+2) + neck_pain(+1) + cerv_headaches(+1) = 25
// cerv_m4_asymmetric_side and cerv_suboccipital_asymmetric are flags only — no additional points.
// SCM and trap share one OR slot: both true still contributes only 2 pts (§1.7).
const VALID_PAYLOAD: Record<string, string | null> = {
  cerv_m3_neck_curl: 'yes',
  cerv_m4_head_rotation: 'yes',
  cerv_m4_asymmetric_side: 'yes',
  cerv_m5_chin_tuck: 'yes',
  cerv_suboccipital_tenderness: 'yes',
  cerv_suboccipital_asymmetric: 'yes',
  cerv_suboccipital_tender_side: 'left',
  cerv_scm_asymmetry: 'yes',
  cerv_scm_dominant_side: 'left',
  cerv_trap_asymmetry: 'yes',
  cerv_trap_dominant_side: 'right',
  cerv_rotation_restriction: 'yes',
  cerv_restricted_side: 'left',
  cerv_forward_head_posture: 'yes',
  cerv_neck_pain: 'yes',
  cerv_cervicogenic_headaches: 'yes',
  cerv_worse_desk_work: 'yes',
  ctx_whiplash_history: 'yes',
  ctx_sedentary_occupation: 'yes',
  ctx_one_sided_sport: 'yes',
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
  return new Request('http://localhost/api/framework/phase-1/module-2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.resetAllMocks()
})

describe('POST /api/framework/phase-1/module-2', () => {

  it('case 1 — happy path: 200 with correct scores, collapsed payload, session advanced', async () => {
    const { mockClient, getCapturedPayload } = buildMockClient()
    vi.mocked(createClient).mockResolvedValue(mockClient as any)
    vi.mocked(incrementCurrentSession).mockResolvedValue(undefined as any)

    const res = await POST(makeRequest(VALID_PAYLOAD))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.tmjRawScore).toBe(0)
    expect(body.cervRawScore).toBe(25)
    expect(body.nextSession).toBe(4)

    // Session advanced with correct args
    expect(incrementCurrentSession).toHaveBeenCalledWith('user-1', 1, 3)

    // Collapsed booleans written to DB (spot-check)
    const payload = getCapturedPayload()
    expect(payload).not.toBeNull()
    expect(payload!.cerv_m3_neck_curl).toBe(true)                // yes → true
    expect(payload!.cerv_suboccipital_tenderness).toBe(true)     // yes → true
    expect(payload!.cerv_suboccipital_asymmetric).toBe(true)     // yes → true
    expect(payload!.cerv_suboccipital_tender_side).toBe('left')  // primary=yes, secondary=yes → passed through
    expect(payload!.cerv_neck_pain).toBe(true)                   // yes → true
    expect(payload!.cerv_raw_score).toBe(25)
    expect(payload!.tmj_raw_score).toBe(0)
  })

  it('case 2 — 401 when not authenticated', async () => {
    const { mockClient } = buildMockClient({ noAuth: true })
    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const res = await POST(makeRequest(VALID_PAYLOAD))

    expect(res.status).toBe(401)
    expect(incrementCurrentSession).not.toHaveBeenCalled()
  })

  it('case 3 — 400 when a required primary key is missing', async () => {
    const { mockClient } = buildMockClient()
    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const incomplete = { ...VALID_PAYLOAD }
    delete (incomplete as Record<string, unknown>).cerv_m3_neck_curl

    const res = await POST(makeRequest(incomplete as Record<string, string | null>))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.ok).toBe(false)
    expect(incrementCurrentSession).not.toHaveBeenCalled()
  })

  it('case 4 — 400 when a nullable secondary key is absent entirely', async () => {
    const { mockClient } = buildMockClient()
    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const missingSecondary = { ...VALID_PAYLOAD }
    delete (missingSecondary as Record<string, unknown>).cerv_m4_asymmetric_side

    const res = await POST(makeRequest(missingSecondary as Record<string, string | null>))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.ok).toBe(false)
    expect(incrementCurrentSession).not.toHaveBeenCalled()
  })

  it('case 5 — 409 when no phase1_assessment row exists (B.1 not completed)', async () => {
    const { mockClient } = buildMockClient({ assessment: null })
    vi.mocked(createClient).mockResolvedValue(mockClient as any)

    const res = await POST(makeRequest(VALID_PAYLOAD))
    const body = await res.json()

    expect(res.status).toBe(409)
    expect(body.ok).toBe(false)
    expect(incrementCurrentSession).not.toHaveBeenCalled()
  })

  it('case 6 — E7 collapse: sometimes→true, no→false for history fields', async () => {
    const { mockClient, getCapturedPayload } = buildMockClient()
    vi.mocked(createClient).mockResolvedValue(mockClient as any)
    vi.mocked(incrementCurrentSession).mockResolvedValue(undefined as any)

    const payload: Record<string, string | null> = {
      ...VALID_PAYLOAD,
      cerv_neck_pain: 'sometimes',           // collapseYesSometimesNo → true
      cerv_cervicogenic_headaches: 'no',     // collapseYesSometimesNo → false
      cerv_worse_desk_work: 'yes',           // collapseYesSometimesNo → true
    }

    const res = await POST(makeRequest(payload))
    expect(res.status).toBe(200)

    const saved = getCapturedPayload()
    expect(saved!.cerv_neck_pain).toBe(true)
    expect(saved!.cerv_cervicogenic_headaches).toBe(false)
    expect(saved!.cerv_worse_desk_work).toBe(true)
  })

  it('case 7 — M4 cascade: head_rotation=no nulls cerv_m4_asymmetric_side', async () => {
    const { mockClient, getCapturedPayload } = buildMockClient()
    vi.mocked(createClient).mockResolvedValue(mockClient as any)
    vi.mocked(incrementCurrentSession).mockResolvedValue(undefined as any)

    const payload: Record<string, string | null> = {
      ...VALID_PAYLOAD,
      cerv_m4_head_rotation: 'no',
      cerv_m4_asymmetric_side: 'yes', // deliberately inconsistent — route must null it
    }

    const res = await POST(makeRequest(payload))
    const body = await res.json()

    expect(res.status).toBe(200)
    // M4=false → 0 pts, so 25 - 4 = 21
    expect(body.cervRawScore).toBe(21)

    const saved = getCapturedPayload()
    expect(saved!.cerv_m4_head_rotation).toBe(false)
    expect(saved!.cerv_m4_asymmetric_side).toBeNull()
  })

  it('case 8 — suboccipital cascade: primary=yes, secondary=no nulls tender_side', async () => {
    const { mockClient, getCapturedPayload } = buildMockClient()
    vi.mocked(createClient).mockResolvedValue(mockClient as any)
    vi.mocked(incrementCurrentSession).mockResolvedValue(undefined as any)

    const payload: Record<string, string | null> = {
      ...VALID_PAYLOAD,
      cerv_suboccipital_tenderness: 'yes',
      cerv_suboccipital_asymmetric: 'no',
      cerv_suboccipital_tender_side: 'left', // should be nulled — asymmetric=no
    }

    const res = await POST(makeRequest(payload))
    const body = await res.json()

    expect(res.status).toBe(200)
    // suboccipital primary still fires (+4), score unchanged: 25
    expect(body.cervRawScore).toBe(25)

    const saved = getCapturedPayload()
    expect(saved!.cerv_suboccipital_tenderness).toBe(true)
    expect(saved!.cerv_suboccipital_asymmetric).toBe(false)
    expect(saved!.cerv_suboccipital_tender_side).toBeNull()
  })

  it('case 9 — suboccipital cascade: primary=no nulls both secondary and tertiary', async () => {
    const { mockClient, getCapturedPayload } = buildMockClient()
    vi.mocked(createClient).mockResolvedValue(mockClient as any)
    vi.mocked(incrementCurrentSession).mockResolvedValue(undefined as any)

    const payload: Record<string, string | null> = {
      ...VALID_PAYLOAD,
      cerv_suboccipital_tenderness: 'no',
      cerv_suboccipital_asymmetric: 'yes',  // deliberately inconsistent — route must null it
      cerv_suboccipital_tender_side: 'right', // deliberately inconsistent — route must null it
    }

    const res = await POST(makeRequest(payload))
    const body = await res.json()

    expect(res.status).toBe(200)
    // suboccipital primary = false → 0 pts, so 25 - 4 = 21
    expect(body.cervRawScore).toBe(21)

    const saved = getCapturedPayload()
    expect(saved!.cerv_suboccipital_tenderness).toBe(false)
    expect(saved!.cerv_suboccipital_asymmetric).toBeNull()
    expect(saved!.cerv_suboccipital_tender_side).toBeNull()
  })

})
