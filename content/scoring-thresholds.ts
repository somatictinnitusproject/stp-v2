// /content/scoring-thresholds.ts
// ─────────────────────────────────────────────────────────────────────────────
// SOMATIC TINNITUS PROJECT — V2 Scoring Thresholds and Logic Constants
//
// CRITICAL INSTRUCTION:
// Every value in this file is a named constant used throughout the codebase.
// Never write any of these values as inline numbers anywhere in the code.
// Always import from this file and reference by name.
//
// These values are designed to be adjusted post-launch as member outcome
// data accumulates. Changing a value here propagates everywhere automatically.
// A magic number requires finding every instance manually.
// ─────────────────────────────────────────────────────────────────────────────

export const SCORING_THRESHOLDS = {

  // ── Phase 1 Module Maximums ───────────────────────────────────────────────
  // Total possible raw score for each module. Used as normalisation denominator.
  // Change only if indicators are added to or removed from a module.
  TMJ_MODULE_MAXIMUM: 30,
  CERVICAL_MODULE_MAXIMUM: 28,

  // ── Profile Type Classification ───────────────────────────────────────────
  // All values are normalised percentages (0–100).

  // Normalised score above this = high driver influence = single driver candidate
  SINGLE_DRIVER_HIGH_THRESHOLD: 60,

  // Normalised score below this = negligible = no protocol assigned
  PROTOCOL_ASSIGNMENT_MINIMUM: 20,

  // Both scores must exceed this AND be within DUAL_DRIVER_MAX_DIFFERENCE
  // for dual driver classification
  DUAL_DRIVER_MIN_SCORE: 30,

  // Maximum gap between scores for dual driver classification
  DUAL_DRIVER_MAX_DIFFERENCE: 15,

  // Leading score must exceed this for "primary with strong secondary"
  PRIMARY_STRONG_SECONDARY_LEAD: 50,

  // Secondary score lower bound for "strong secondary" designation
  PRIMARY_STRONG_SECONDARY_MIN: 30,

  // Secondary score upper bound for "strong secondary" designation
  // (above this, scores are close enough for dual driver consideration)
  PRIMARY_STRONG_SECONDARY_MAX: 50,

  // ── Low Confidence Edge Case ──────────────────────────────────────────────
  // Intake test symptom_score at or above this value triggers the
  // symptom-dominant low-confidence variant.
  // Symptom scale maximum: 17.
  LOW_CONFIDENCE_SYMPTOM_THRESHOLD: 6,

  // ── Nervous System Flags ──────────────────────────────────────────────────
  // Number of confirmed NS flags (from 4 possible) that triggers:
  //   - High nervous system modifier in profile paragraph
  //   - Phase 4 breath work nudge (Nudge 3)
  HIGH_NS_FLAG_THRESHOLD: 3,

  // ── Analytics — Correlation ───────────────────────────────────────────────
  // Minimum number of progress_logs required before any correlation
  // insight is calculated or displayed. (ERRATA G1: 14 logs, not 28 days)
  CORRELATION_MINIMUM_LOGS: 14,

  // Minimum absolute Pearson r value to display a correlation insight card.
  CORRELATION_MINIMUM_STRENGTH: 0.3,

  // r value at or above this = "Moderate" strength label on insight card
  CORRELATION_MODERATE: 0.4,

  // r value at or above this = "Strong" strength label on insight card
  CORRELATION_STRONG: 0.6,

  // ── Analytics — Personal Bests ────────────────────────────────────────────
  // Loudness thresholds for sub-N streak personal bests.
  // A log day counts toward the streak if loudness <= this value.
  SUB_FOUR_STREAK_THRESHOLD: 4,
  SUB_THREE_STREAK_THRESHOLD: 3,

  // ── Phase 3 Advancement ───────────────────────────────────────────────────
  // Minimum weeks from phase2_completed_at before the Phase 3 complete
  // button becomes active. Does not auto-advance — controls button state only.
  PHASE3_MINIMUM_WEEKS: 4,

  // ── Contextual Nudges ─────────────────────────────────────────────────────
  // Days into Phase 3 (from phase2_completed_at) before nervous system
  // nudges 4 and 5 appear.
  PHASE3_DAY14_NUDGE_THRESHOLD: 14,

  // current_session values at which specific Phase 2 nudges trigger.
  // Update these if Phase 2 session order changes.
  PHASE2_HABITS_AUDIT_SESSION: 2,  // C.2 → session 2 — end of habits audit
  PHASE2_SLEEP_SESSION: 5,         // C.5 → session 5 — sleep foundations
  // Doc 13 §9.3 specifies 8 (C.8 section label) but Phase 2 has only 6
  // sessions per framework-manifest.ts (C.1, C.2, C.3, C.4, C.5, C.8 → session
  // numbers 1-6). current_session is a counter, not a label. 8 would make
  // Phase 2 advancement's "on final session" check never fire. Overridden to 6.
  PHASE2_LAST_SESSION: 6,

  // ── Tracker ───────────────────────────────────────────────────────────────
  // Retroactive logging window (ERRATA D2: 7 days, not 1)
  RETROACTIVE_LOG_DAYS: 7,

  // Weekly nudge above optional section toggle
  WEEKLY_NUDGE_INTERVAL: 7,
  WEEKLY_NUDGE_MIN_LOGS: 7,

  // Default slider value — triggers all-at-5 confirmation modal
  ALL_AT_FIVE_DEFAULT: 5,

  // Edit window after submission
  EDIT_WINDOW_HOURS: 24,

  // Notes field character cap
  NOTES_MAX_LENGTH: 1000,

  // Push opt-in card minimum prior log count
  PUSH_OPT_IN_MIN_LOGS: 3,

} as const

export type ScoringThresholds = typeof SCORING_THRESHOLDS
