// /content/exercises/_types.ts
// ─────────────────────────────────────────────────────────────────────────────
// SOMATIC TINNITUS PROJECT — V2 Exercise Content Type Contract
//
// Defines the Exercise interface that every Phase 3 exercise content file
// must conform to. Read by M13d session list builders, M13e ExerciseView
// component, M13f SustainedPressureTimer, and the Phase F exercise library.
//
// Authority: errata P3-2 (exercise IDs), P3-8 (timer), P3-13 (profile
// modifiers), pre-launch §4.1 (timer), §4.2 (shorter session).
// ─────────────────────────────────────────────────────────────────────────────

import type { Phase1AssessmentRow } from '@/lib/scoring/types'

// ── ContentBlock ──────────────────────────────────────────────────────────────
// Discriminated union for all rendered content. Extends the Phase 2 paragraph
// pattern with additional block types required for exercise content.

export type ContentBlock =
  | { type: 'p'; text: string }
  | { type: 'subhead'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'callout'; tone: 'info' | 'warning'; text: string }
  | { type: 'emphasis'; text: string }
  | { type: 'acknowledge_prompt'; text: string }
  | { type: 'dynamic'; source: 'protocol_assignment' | 'protocol_option' | 'phase4_confirmed_flags' }
  | {
      type: 'single_select'
      source: 'phase5_outcome_type'
      prompt: string
      options: Array<{
        value: string
        label: string
        description?: string
      }>
    }
  | {
      type: 'profile_variant'
      variants: {
        TMJ_DOMINANT: ContentBlock[]
        CERV_DOMINANT: ContentBlock[]
        DUAL_DRIVER: ContentBlock[]
      }
    }

// ── ProfileModifier ───────────────────────────────────────────────────────────
// Data-driven personalisation block. Discriminated union supporting four
// trigger variants:
//
//   triggerFlag + triggerValue: strict equality on a single Phase 1 column.
//     Existing pattern — used by all Phase 3 modifiers and Phase 4 F.2/F.3.
//
//   triggerAllFalse: array of Phase 1 columns, all of which must strictly
//     === false. null does NOT qualify — the column must have been explicitly
//     recorded as false. Used by F.5 and F.8 "No NS Flags Confirmed" blocks.
//
//   triggerAnyTrue: array of Phase 1 columns, any of which strictly === true.
//     Anticipates F.11 multi-flag OR conditions.
//
//   triggerValuesIn: array of values strictly compared against a single Phase 1
//     column. Modifier qualifies if phase1[triggerFlag] === any element in the
//     array. Strict equality — null does not qualify, string comparison is
//     case-sensitive. Used for profile_type family membership where multiple
//     ProfileType values share the same content (e.g. G.6 jaw warning signs
//     trigger on TMJ_DOMINANT, TMJ_PRIMARY_STRONG_SECONDARY,
//     TMJ_PRIMARY_WITH_SECONDARY, plus mixed cervical-primary types and
//     DUAL_DRIVER per the warning sign visibility rule).
//
// Per errata P3-13: five Phase 1 flags referenced in Doc 8 are NOT persisted
// to phase1_assessment (masseter_tenderness, temporalis_tenderness,
// intraoral_pterygoid_tenderness, temporal_headache, ear_fullness). Their
// column reference resolves to undefined, strict equality fails, and the
// block is silently omitted — no error, no UI artifact.

export type ProfileModifier =
  | {
      triggerFlag: keyof Phase1AssessmentRow
      triggerValue: boolean | string  // true | 'left' | 'right' | etc.
      title: string                    // e.g. 'Daytime Clenching Confirmed'
      content: ContentBlock[]
    }
  | {
      triggerAllFalse: (keyof Phase1AssessmentRow)[]
      title: string
      content: ContentBlock[]
    }
  | {
      triggerAnyTrue: (keyof Phase1AssessmentRow)[]
      title: string
      content: ContentBlock[]
    }
  | {
      triggerFlag: keyof Phase1AssessmentRow
      triggerValuesIn: (boolean | string)[]
      title: string
      content: ContentBlock[]
    }

// ── TimerConfig ───────────────────────────────────────────────────────────────
// Per pre-launch §4.1 and errata P3-8.
// Three exercises use <SustainedPressureTimer>: D5, D6, E5. All others: null.

export interface TimerPosition {
  label: string                // e.g. 'Position 1' | 'Single Hold'
  durationSeconds: number      // 90 for D5/D6; 600 for E5
  transitionToneAfter: boolean // true between D5/D6 positions; false on last
}

export interface TimerConfig {
  positions: TimerPosition[]        // D5, D6: 3 positions; E5: 1 position
  audioChannel: 'stereo' | 'right'  // 'right' for E5 (member supine); 'stereo' otherwise
  warningSeconds: number | null     // E5: 30; D5/D6: null
}

// ── Exercise ──────────────────────────────────────────────────────────────────
// One exercise in the daily session pool.
//
// Does NOT represent reading/orientation sections (D.1–D.3, D.12–D.13,
// D.18–D.19, E.1–E.4, E.12, E.16) — those have a different content shape
// and live in /content/framework/.
//
// File convention: one file per exercise, named {id}.ts, default export.
// See /content/exercises/README.md for the full exercise list.

export interface Exercise {
  kind: 'exercise'    // discriminant for (Exercise | ReadingSection)[] union in session client
  // ── Identity ────────────────────────────────────────────────────────────
  id: string          // matches Doc 8 section letter per errata P3-2, e.g. 'D6_masseter_release'
  sectionRef: string  // traceability reference, e.g. 'D.6'
  name: string        // display name, e.g. 'Masseter Release'
  category: 'jaw-release' | 'cervical-release' | 'resistance-training'

  // ── Session metadata ─────────────────────────────────────────────────────
  estimatedMinutes: number
  focusLine: string   // daily focus line per Doc 8 D.20 / E.17

  // ── Content ──────────────────────────────────────────────────────────────
  fullContent: ContentBlock[]       // rendered on first view (exercises_viewed key absent)
  condensedSummary: ContentBlock[]  // rendered on subsequent views

  // ── Media ────────────────────────────────────────────────────────────────
  videoId: string | null            // Cloudflare Stream video ID; null until uploaded

  // ── Supporting content ───────────────────────────────────────────────────
  commonMistakes: ContentBlock[] | null
  contraindications: ContentBlock[] | null

  // ── Personalisation ──────────────────────────────────────────────────────
  // Silent-omission policy per errata P3-13. Array may be empty ([]).
  profileModifiers: ProfileModifier[]

  // ── Shorter session — per pre-launch §4.2 ───────────────────────────────
  shorter_session_eligible: boolean
  // Calendar day slot: 0 = Sun … 6 = Sat. null = appears every day in shorter sessions.
  rotation_slot: number | null

  // ── Timer — per pre-launch §4.1, errata P3-8 ────────────────────────────
  // null for all exercises except D5_temporalis_release, D6_masseter_release,
  // and E5_suboccipital_tennis_ball.
  timer: TimerConfig | null

  // ── Optional preamble flag ───────────────────────────────────────────────
  // true only for D4_heat_application. Optional exercises are excluded from
  // session "X of N" count and ~min remaining total. UI shows Continue + Skip
  // instead of Complete. Omit (or set false) for all other exercises.
  optional?: boolean
}
