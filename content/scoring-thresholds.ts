export const SCORING_THRESHOLDS = {
  // Tracker — retroactive logging window
  RETROACTIVE_LOG_DAYS: 7,

  // Tracker — weekly nudge above optional section toggle
  WEEKLY_NUDGE_INTERVAL: 7,
  WEEKLY_NUDGE_MIN_LOGS: 7,

  // Tracker — default slider value (all-at-5 confirmation modal trigger)
  ALL_AT_FIVE_DEFAULT: 5,

  // Tracker — edit window after submission
  EDIT_WINDOW_HOURS: 24,

  // Tracker — notes field character cap
  NOTES_MAX_LENGTH: 1000,

  // Tracker — push opt-in card minimum prior log count
  PUSH_OPT_IN_MIN_LOGS: 3,

  // Analytics — minimum log count before correlation insights appear (ERRATA G1: 14 logs, not 28 days)
  CORRELATION_MINIMUM_LOGS: 14,
} as const
