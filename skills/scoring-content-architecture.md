---
name: scoring-content-architecture
description: Somatic Tinnitus Project framework content system and Phase 1 scoring architecture. Use when building any part of the framework content system, Phase 1 deep assessment, scoring logic, profile generation, daily focus lines, phase advancement, session construction, or exercise library content.
---

# Somatic Tinnitus Project — Scoring & Content Architecture

## The Most Important Rule

**Content lives in `/content` TypeScript files. Never in the database.**

The database stores where the member is and what their profile flags are.
It never stores what they read. When building any framework component:
- Read content from `/content/*.ts` files
- Read member state (position, flags, progress) from Supabase
- Never write member-facing text to any database table

---

## Content Directory Structure

```
/content
  /design-tokens.ts             — all design tokens (single source of truth)
  /scoring-thresholds.ts        — all scoring threshold constants (never hardcode these)
  /framework
    /phase1.ts                  — Phase 1 assessment content and mechanism explanations
    /phase2.ts                  — Phase 2 session content (from Document 8 Part C)
    /phase3-tmj.ts              — Phase 3 TMJ protocol content (from Document 8 Part D)
    /phase3-cervical.ts         — Phase 3 cervical protocol content (from Document 8 Part E)
    /phase4.ts                  — Phase 4 maintaining factors content (from Document 8 Part F)
    /phase5.ts                  — Phase 5 stabilisation content (from Document 8 Part G)
    /session-lists.ts           — ordered session arrays per phase, sectionUrls lookup
    /daily-focus-lines.ts       — focus line lookup table for all phases
  /exercises
    /jaw-release.ts             — jaw release exercise content
    /cervical-release.ts        — cervical release exercise content
    /resistance-training.ts     — resistance training exercise content
    /postural.ts                — postural exercise content
    /nervous-system.ts          — nervous system exercise content
    /breathing.ts               — breathing exercise content
  /profile-modifiers.ts         — profile modifier text blocks keyed by exercise and flag
  /video-config.ts              — Cloudflare Stream video IDs
  /stripe-support-prices.ts     — 14 support contribution Stripe Price IDs
```

---

## Schema Correction — Critical

`cerv_floor_relief_test` is **VARCHAR(10)** not BOOLEAN.
- `'clear'`  → 3 points
- `'slight'` → 1 point
- `'none'`   → 0 points
- `NULL`     → treated as none, 0 points

---

## Scoring Threshold Constants

All threshold values are named constants in `/content/scoring-thresholds.ts`.
Never hardcode any numeric threshold inline. Always import and reference by name.

```typescript
import { SCORING_THRESHOLDS } from '@/content/scoring-thresholds'

// Then use like:
SCORING_THRESHOLDS.CORRELATION_MINIMUM_LOGS    // 14
SCORING_THRESHOLDS.PROTOCOL_ASSIGNMENT_MINIMUM // 20
SCORING_THRESHOLDS.DUAL_DRIVER_MIN_SCORE       // 30
// etc.
```

The complete constants file (copy exactly into codebase):

```typescript
// /content/scoring-thresholds.ts
export const SCORING_THRESHOLDS = {
  TMJ_MODULE_MAXIMUM: 30,
  CERVICAL_MODULE_MAXIMUM: 28,
  SINGLE_DRIVER_HIGH_THRESHOLD: 60,
  PROTOCOL_ASSIGNMENT_MINIMUM: 20,
  DUAL_DRIVER_MIN_SCORE: 30,
  DUAL_DRIVER_MAX_DIFFERENCE: 15,
  PRIMARY_STRONG_SECONDARY_LEAD: 50,
  PRIMARY_STRONG_SECONDARY_MIN: 30,
  PRIMARY_STRONG_SECONDARY_MAX: 50,
  LOW_CONFIDENCE_SYMPTOM_THRESHOLD: 6,
  HIGH_NS_FLAG_THRESHOLD: 3,
  CORRELATION_MINIMUM_STRENGTH: 0.3,
  CORRELATION_MODERATE: 0.4,
  CORRELATION_STRONG: 0.6,
  CORRELATION_MINIMUM_LOGS: 14,
  SUB_FOUR_STREAK_THRESHOLD: 4,
  SUB_THREE_STREAK_THRESHOLD: 3,
  PHASE3_MINIMUM_WEEKS: 4,
  PHASE3_DAY14_NUDGE_THRESHOLD: 14,
  PHASE2_HABITS_AUDIT_SESSION: 2,
  PHASE2_SLEEP_SESSION: 5,
  PHASE2_LAST_SESSION: 8,
} as const

export type ScoringThresholds = typeof SCORING_THRESHOLDS
```

---

## Scoring Runs at Two Points

1. **Progressive** — `tmj_raw_score` and `cerv_raw_score` recalculated and written to
   `phase1_assessment` on every module save. Keeps stored scores current as member works
   through modules.

2. **Final** — when member confirms profile: `tmj_raw_score`, `tmj_normalised_score`,
   `cerv_raw_score`, `cerv_normalised_score`, `profile_type`, `tmj_protocol_assigned`,
   `cerv_protocol_assigned`, `profile_paragraph`, `completed_at` — all written in a
   single transaction. After this, scores never change.

Profile type classification and edge case logic run **only at final scoring**.

---

## The Overlapping Indicator Rule

Four indicators exist in both the intake test and Phase 1 assessment. Must not double-count.

For each overlapping indicator:
- Use the Phase 1 assessment column if NOT NULL (member has answered in-platform)
- Fall back to intake import value if Phase 1 column is NULL

| Phase 1 Column | Intake Fallback | Points if Positive |
|---|---|---|
| `tmj_daytime_clenching` | `users.s1_score > 0` | 1 |
| `tmj_pain_eating` | `users.s6_score > 0` | 1 |
| `cerv_neck_pain` | `users.s7_score > 0` | 1 |
| `cerv_cervicogenic_headaches` | `users.s8_score > 0` | 1 |

---

## Seven Profile Types

Document 7 listed 5 types. Document 13 uses 7 — Document 13 is correct.
The dominant driver is encoded in the string so session construction and paragraph
generation can switch on `profile_type` alone.

```typescript
type ProfileType =
  | 'TMJ_DOMINANT'
  | 'CERV_DOMINANT'
  | 'DUAL_DRIVER'
  | 'TMJ_PRIMARY_STRONG_SECONDARY'
  | 'CERV_PRIMARY_STRONG_SECONDARY'
  | 'TMJ_PRIMARY_WITH_SECONDARY'
  | 'CERV_PRIMARY_WITH_SECONDARY'
```

Classification decision tree — evaluated top to bottom, first match wins:

```typescript
function classifyProfileType(tmjNorm: number, cervNorm: number): ProfileType {
  const T = SCORING_THRESHOLDS
  if (tmjNorm > T.SINGLE_DRIVER_HIGH_THRESHOLD && cervNorm < T.PROTOCOL_ASSIGNMENT_MINIMUM)
    return 'TMJ_DOMINANT'
  if (cervNorm > T.SINGLE_DRIVER_HIGH_THRESHOLD && tmjNorm < T.PROTOCOL_ASSIGNMENT_MINIMUM)
    return 'CERV_DOMINANT'
  if (tmjNorm > T.DUAL_DRIVER_MIN_SCORE && cervNorm > T.DUAL_DRIVER_MIN_SCORE
      && Math.abs(tmjNorm - cervNorm) <= T.DUAL_DRIVER_MAX_DIFFERENCE)
    return 'DUAL_DRIVER'
  if (tmjNorm > T.PRIMARY_STRONG_SECONDARY_LEAD
      && cervNorm >= T.PRIMARY_STRONG_SECONDARY_MIN
      && cervNorm <= T.PRIMARY_STRONG_SECONDARY_MAX)
    return 'TMJ_PRIMARY_STRONG_SECONDARY'
  if (cervNorm > T.PRIMARY_STRONG_SECONDARY_LEAD
      && tmjNorm >= T.PRIMARY_STRONG_SECONDARY_MIN
      && tmjNorm <= T.PRIMARY_STRONG_SECONDARY_MAX)
    return 'CERV_PRIMARY_STRONG_SECONDARY'
  if (tmjNorm > T.DUAL_DRIVER_MIN_SCORE
      && cervNorm >= T.PROTOCOL_ASSIGNMENT_MINIMUM
      && cervNorm < T.PRIMARY_STRONG_SECONDARY_MIN)
    return 'TMJ_PRIMARY_WITH_SECONDARY'
  if (cervNorm > T.DUAL_DRIVER_MIN_SCORE
      && tmjNorm >= T.PROTOCOL_ASSIGNMENT_MINIMUM
      && tmjNorm < T.PRIMARY_STRONG_SECONDARY_MIN)
    return 'CERV_PRIMARY_WITH_SECONDARY'
  // Fallback — both below all thresholds (low confidence case)
  return tmjNorm >= cervNorm ? 'TMJ_DOMINANT' : 'CERV_DOMINANT'
}
```

Test cases — verify all 7 types plus edge cases before Phase E UI work:

| Expected type | tmjNorm | cervNorm |
|---|---|---|
| TMJ_DOMINANT | 70 | 10 |
| CERV_DOMINANT | 10 | 70 |
| DUAL_DRIVER | 45 | 40 |
| TMJ_PRIMARY_STRONG_SECONDARY | 60 | 38 |
| CERV_PRIMARY_STRONG_SECONDARY | 38 | 60 |
| TMJ_PRIMARY_WITH_SECONDARY | 45 | 25 |
| CERV_PRIMARY_WITH_SECONDARY | 25 | 45 |
| LOW_CONFIDENCE (fallback TMJ) | 15 | 12 |

---

## Low-Confidence Edge Case

When both `tmjNorm < 20` AND `cervNorm < 20`:
- If `users.symptom_score >= 6`: variant `LOW_CONFIDENCE_SYMPTOM_DOMINANT`
- Otherwise: variant `LOW_CONFIDENCE_LOW_ALL`

Protocol assignment override for low confidence:
- `tmj_protocol_assigned = TRUE` regardless of score
- `cerv_protocol_assigned = TRUE` regardless of score
- `protocol_option = NULL` — session structure choice screen is omitted entirely
- Session construction routes to `buildLowConfidenceList()`
- Reassessment prompt appears at 4-week Phase 3 mark

---

## Framework URL Structure

Framework routes use `session` not `section`:
```
/framework/phase-[N]/session-[N]
/session   ← daily practice checklist (Phase 3 and 4)
```

Content files use section letter codes (B.1, C.3, D.7 etc) as internal authoring labels.
These map to session numbers in the URL. The content file keys by session number.

---

## Session Construction Algorithm

```typescript
function buildSessionExerciseList(
  tmjAssigned: boolean,
  cervAssigned: boolean,
  protocolOption: 1 | 2 | 3 | null,
  profileType: ProfileType,
  resistancePhaseStarted: boolean
): string[] {
  // Low confidence — both assigned, minimal exploratory list
  if (protocolOption === null) return buildLowConfidenceList()

  let list: string[] = []

  if (protocolOption === 1) {
    // Sequential — one protocol at a time
    // TMJ release phase first, then cervical after TMJ complete
    if (tmjAssigned) list = [...buildTmjReleaseList()]
    else if (cervAssigned) list = [...buildCervReleaseList()]
  }

  if (protocolOption === 2) {
    // Parallel — both protocols in every session
    if (tmjAssigned) list = [...buildTmjReleaseList()]
    if (cervAssigned) list = [...list, ...buildCervReleaseList()]
  }

  if (protocolOption === 3) {
    // Prioritised parallel — full primary + reduced secondary
    if (tmjAssigned) list = [...buildTmjReleaseList()]
    if (cervAssigned) list = [...list, ...buildReducedCervList(profileType)]
    if (cervAssigned && !tmjAssigned) list = [...buildCervReleaseList()]
    if (tmjAssigned && !cervAssigned) list = [...list]
    // Cervical primary profiles
    if (cervAssigned && tmjAssigned && profileType.startsWith('CERV')) {
      list = [...buildCervReleaseList(), ...buildReducedTmjList(profileType)]
    }
  }

  // Add resistance exercises if resistance phase acknowledged
  if (resistancePhaseStarted) {
    if (tmjAssigned) list = [...list, ...buildTmjResistanceList()]
    if (cervAssigned) list = [...list, ...buildCervRetrainingList()]
  }

  return list
}
```

Combined session exercise order (when both protocols in same session):
1. Heat application (D4) — TMJ members, always first
2. Thoracic mobility (E3) — cervical members, general warm-up
3. Cervical release exercises (E4–E9) in order
4. Jaw release exercises (D5–D10) in order
5. Cervical retraining (E13–E15) — if resistance phase started
6. Jaw resistance (D14–D16) — if resistance phase started

---

## Daily Focus Line Logic

Focus lines come from `/content/framework/daily-focus-lines.ts`. Never from the database.
Dashboard always shows focus line for `current_phase` — never Phase 4 even if member
is also working through it.

```typescript
function getDailyFocusLine(frameworkProgress): string {
  if (frameworkProgress.phase5_completed_at) return DAILY_FOCUS_LINES.complete
  if (frameworkProgress.current_phase === 3) return getPhase3FocusLine(frameworkProgress)
  const line = DAILY_FOCUS_LINES[frameworkProgress.current_phase][frameworkProgress.current_session]
  if (!line) {
    // Edge case: phase complete but not yet advanced — return last line for phase
    const lastSession = Object.keys(DAILY_FOCUS_LINES[frameworkProgress.current_phase]).length
    return DAILY_FOCUS_LINES[frameworkProgress.current_phase][lastSession]
  }
  return line
}

function getPhase3FocusLine(frameworkProgress): string {
  if (!frameworkProgress.resistance_phase_start) {
    return DAILY_FOCUS_LINES[3].release  // Fixed: "Release before you retrain"
  }
  // Weekly rotation from resistance_phase_start
  const daysSince = dateDiff(new Date(), new Date(frameworkProgress.resistance_phase_start))
  const weekNumber = Math.floor(daysSince / 7)
  const lines = DAILY_FOCUS_LINES[3].resistance
  return lines[weekNumber % lines.length]
}
```

---

## Phase Access Control

Enforced at **page component level** for framework routes, not just middleware.

```typescript
// Runs server-side on every /framework/phase-[N] and /framework/phase-[N]/session-[N] load
if (requestedPhase > progress.current_phase) {
  redirect(`/framework/phase-${progress.current_phase}`)
}
// Phase 4 exception — accessible from Phase 2 onwards
if (requestedPhase === 4 && progress.current_phase >= 2) {
  // allow through regardless of current_phase
}
// Session bounds check
const maxSessions = PHASE_SESSION_COUNTS[requestedPhase]
if (requestedSession > maxSessions || requestedSession < 1) {
  redirect(`/framework/phase-${requestedPhase}`)
}
```

Members can read ahead freely within their current phase — no per-session gate.

---

## Phase Advancement Triggers

| Phase | Trigger | Function |
|---|---|---|
| Phase 1 | Member selects protocol option and confirms | `advanceFromPhase1()` |
| Phase 1 (low confidence) | Member confirms profile (no protocol option) | `advanceFromPhase1LowConfidence()` |
| Phase 2 | Member submits maintaining factor checklist (C.8) | `advanceFromPhase2()` |
| Phase 3 | Manual — complete button active after 4 weeks + resistance acknowledged | `advanceFromPhase3()` |
| Phase 4 | Optional — member taps Mark Phase 4 complete | `markPhase4Complete()` |
| Phase 5 | Member acknowledges G.8 section | `recordPhase5Complete()` |

Phase 3 advances to Phase 5 directly — not Phase 4. Phase 4 has permanent separate access.

---

## Exercise Library Categories — Six URL Slugs

```
/exercise-library/jaw-release
/exercise-library/cervical-release
/exercise-library/resistance-training
/exercise-library/postural
/exercise-library/nervous-system
/exercise-library/breathing
```

Exercise content files use `category` field matching these slugs.
The "Assessment" filter on the exercise library home is a client-side filter only —
not a route. Assessment exercises live within the six category pages.

---

## First-View vs Condensed-View

```typescript
function getExerciseViewMode(exerciseId: string, frameworkProgress): 'full' | 'condensed' {
  return frameworkProgress.exercises_viewed[exerciseId] === true ? 'condensed' : 'full'
}

// On first completion — mark viewed (idempotent)
// UPDATE framework_progress
// SET exercises_viewed = exercises_viewed || jsonb_build_object(exerciseId, true)
// WHERE user_id = auth.uid()
```

Full view (first visit): mechanism explanation → profile modifier block → full instructions
→ video → common mistakes → contraindications → complete button.

Condensed view (all subsequent): exercise name → expand link → brief summary → video
→ complete button.

---

## Analytics — Correlation Threshold

**14 logs, not 28 days.** The constant is `SCORING_THRESHOLDS.CORRELATION_MINIMUM_LOGS = 14`.
This is the log count threshold. UI copy: "14 days of logging".
Do not use "28 days" anywhere in the codebase.
