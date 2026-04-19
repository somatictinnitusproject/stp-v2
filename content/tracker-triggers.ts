// Canonical trigger tag list — 11 tags, ordered for display.
// IDs are intentionally absent. APIs resolve name → id server-side via
//   SELECT id, name FROM triggers WHERE name = ANY($1::text[])
// "travel" (if present in DB) is omitted; any name not in this list is rejected.
export const TRACKER_TRIGGERS = [
  'Stress',
  'Poor sleep position',
  'Alcohol',
  'Jaw clenching',
  'Long desk session',
  'Dental work',
  'Illness',
  'Exercise',
  'Skipped protocol',
  'Hormonal',
  'Other',
] as const

export type TriggerName = typeof TRACKER_TRIGGERS[number]
