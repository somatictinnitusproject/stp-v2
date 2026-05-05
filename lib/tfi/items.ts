/**
 * /lib/tfi/items.ts
 *
 * Verbatim TFI item definitions per Meikle et al. 2012.
 * Wording must not be changed — deviation invalidates comparability
 * with published literature.
 */

export interface TfiItem {
  /** 1-based item number */
  number: number
  /** Verbatim question text per Meikle 2012 */
  questionText: string
  /** Label shown at the left (low) end of the response scale */
  leftAnchorLabel: string
  /** Label shown at the right (high) end of the response scale */
  rightAnchorLabel: string
  /**
   * Whether this item is reverse-scored (items 4, 5, 14, 15).
   * Reverse-scored items use reversed_value = 10 - raw_value before
   * being summed into their subscale. Stored raw in the database.
   */
  reversed: boolean
  /**
   * Whether the response scale represents percentages (items 1, 3).
   * UI shows "0%"–"100%" labels; internal storage is 0–10.
   */
  isPercentage: boolean
  /** Subscale this item belongs to */
  section: string
}

export const TFI_ITEMS: readonly TfiItem[] = [
  // ── Section 1: Intrusive ───────────────────────────────────────────────────
  {
    number: 1,
    questionText:
      'What percentage of your time awake were you consciously AWARE of your tinnitus?',
    leftAnchorLabel: 'Never aware',
    rightAnchorLabel: 'Always aware',
    reversed: false,
    isPercentage: true,
    section: 'Intrusive',
  },
  {
    number: 2,
    questionText: 'How STRONG or LOUD was your tinnitus?',
    leftAnchorLabel: 'Not at all strong or loud',
    rightAnchorLabel: 'Extremely strong or loud',
    reversed: false,
    isPercentage: false,
    section: 'Intrusive',
  },
  {
    number: 3,
    questionText: 'What percentage of your time were you ANNOYED by your tinnitus?',
    leftAnchorLabel: 'None of my time',
    rightAnchorLabel: 'All of my time',
    reversed: false,
    isPercentage: true,
    section: 'Intrusive',
  },
  // ── Section 2: Sense of Control (items 4, 5 reverse-scored) ───────────────
  {
    number: 4,
    questionText: 'Did you feel IN CONTROL in regard to your tinnitus?',
    leftAnchorLabel: 'Very much in control',
    rightAnchorLabel: 'Never in control',
    reversed: true,
    isPercentage: false,
    section: 'Sense of Control',
  },
  {
    number: 5,
    questionText: 'How easy was it for you to COPE with your tinnitus?',
    leftAnchorLabel: 'Very easy to cope',
    rightAnchorLabel: 'Impossible to cope',
    reversed: true,
    isPercentage: false,
    section: 'Sense of Control',
  },
  {
    number: 6,
    questionText: 'How easy was it for you to IGNORE your tinnitus?',
    leftAnchorLabel: 'Very easy to ignore',
    rightAnchorLabel: 'Impossible to ignore',
    reversed: false,
    isPercentage: false,
    section: 'Sense of Control',
  },
  // ── Section 3: Cognitive ───────────────────────────────────────────────────
  {
    number: 7,
    questionText:
      'How much did your tinnitus interfere with your ability to CONCENTRATE?',
    leftAnchorLabel: 'Did not interfere',
    rightAnchorLabel: 'Completely interfered',
    reversed: false,
    isPercentage: false,
    section: 'Cognitive',
  },
  {
    number: 8,
    questionText:
      'How much did your tinnitus interfere with your ability to THINK CLEARLY?',
    leftAnchorLabel: 'Did not interfere',
    rightAnchorLabel: 'Completely interfered',
    reversed: false,
    isPercentage: false,
    section: 'Cognitive',
  },
  // ── Section 4: Sleep ───────────────────────────────────────────────────────
  {
    number: 9,
    questionText:
      'How often did your tinnitus make it difficult to FALL ASLEEP or STAY ASLEEP?',
    leftAnchorLabel: 'Never had difficulty',
    rightAnchorLabel: 'Always had difficulty',
    reversed: false,
    isPercentage: false,
    section: 'Sleep',
  },
  {
    number: 10,
    questionText:
      'How often did your tinnitus cause you difficulty in getting AS MUCH SLEEP as you needed?',
    leftAnchorLabel: 'Never had difficulty',
    rightAnchorLabel: 'Always had difficulty',
    reversed: false,
    isPercentage: false,
    section: 'Sleep',
  },
  // ── Section 5: Auditory ────────────────────────────────────────────────────
  {
    number: 11,
    questionText:
      'How much has your tinnitus interfered with your ability to HEAR CLEARLY?',
    leftAnchorLabel: 'Did not interfere',
    rightAnchorLabel: 'Completely interfered',
    reversed: false,
    isPercentage: false,
    section: 'Auditory',
  },
  {
    number: 12,
    questionText:
      'How much has your tinnitus interfered with your ability to UNDERSTAND PEOPLE who are talking?',
    leftAnchorLabel: 'Did not interfere',
    rightAnchorLabel: 'Completely interfered',
    reversed: false,
    isPercentage: false,
    section: 'Auditory',
  },
  {
    number: 13,
    questionText:
      'How much has your tinnitus interfered with your ability to FOLLOW CONVERSATIONS in a group or at meetings?',
    leftAnchorLabel: 'Did not interfere',
    rightAnchorLabel: 'Completely interfered',
    reversed: false,
    isPercentage: false,
    section: 'Auditory',
  },
  // ── Section 6: Relaxation (items 14, 15 reverse-scored) ───────────────────
  {
    number: 14,
    questionText:
      'How much has your tinnitus interfered with your QUIET RESTING ACTIVITIES?',
    leftAnchorLabel: 'Did not interfere',
    rightAnchorLabel: 'Completely interfered',
    reversed: true,
    isPercentage: false,
    section: 'Relaxation',
  },
  {
    number: 15,
    questionText:
      'How much has your tinnitus interfered with your ability to RELAX?',
    leftAnchorLabel: 'Did not interfere',
    rightAnchorLabel: 'Completely interfered',
    reversed: true,
    isPercentage: false,
    section: 'Relaxation',
  },
  {
    number: 16,
    questionText:
      'How much has your tinnitus interfered with your ability to enjoy PEACE AND QUIET?',
    leftAnchorLabel: 'Did not interfere',
    rightAnchorLabel: 'Completely interfered',
    reversed: false,
    isPercentage: false,
    section: 'Relaxation',
  },
  // ── Section 7: Quality of Life ─────────────────────────────────────────────
  {
    number: 17,
    questionText:
      'How much has your tinnitus interfered with your enjoyment of SOCIAL ACTIVITIES?',
    leftAnchorLabel: 'Did not interfere',
    rightAnchorLabel: 'Completely interfered',
    reversed: false,
    isPercentage: false,
    section: 'Quality of Life',
  },
  {
    number: 18,
    questionText:
      'How much has your tinnitus interfered with your ENJOYMENT OF LIFE?',
    leftAnchorLabel: 'Did not interfere',
    rightAnchorLabel: 'Completely interfered',
    reversed: false,
    isPercentage: false,
    section: 'Quality of Life',
  },
  {
    number: 19,
    questionText:
      'How much has your tinnitus interfered with your RELATIONSHIPS with family, friends and other people?',
    leftAnchorLabel: 'Did not interfere',
    rightAnchorLabel: 'Completely interfered',
    reversed: false,
    isPercentage: false,
    section: 'Quality of Life',
  },
  {
    number: 20,
    questionText:
      'How often did your tinnitus cause you to have difficulty performing your WORK or other tasks, such as home maintenance, school work, or caring for children or others?',
    leftAnchorLabel: 'Never had difficulty',
    rightAnchorLabel: 'Always had difficulty',
    reversed: false,
    isPercentage: false,
    section: 'Quality of Life',
  },
  {
    number: 21,
    questionText:
      'How much has your tinnitus interfered with the EFFECTIVENESS of work or other tasks, such as home maintenance, school work, or caring for children or others?',
    leftAnchorLabel: 'Did not interfere',
    rightAnchorLabel: 'Completely interfered',
    reversed: false,
    isPercentage: false,
    section: 'Quality of Life',
  },
  {
    number: 22,
    questionText:
      'How much has your tinnitus interfered with your ABILITY TO ENGAGE IN HOBBIES, recreational, or social activities?',
    leftAnchorLabel: 'Did not interfere',
    rightAnchorLabel: 'Completely interfered',
    reversed: false,
    isPercentage: false,
    section: 'Quality of Life',
  },
  // ── Section 8: Emotional ───────────────────────────────────────────────────
  {
    number: 23,
    questionText: 'How ANXIOUS or WORRIED has your tinnitus made you feel?',
    leftAnchorLabel: 'Not at all anxious or worried',
    rightAnchorLabel: 'Extremely anxious or worried',
    reversed: false,
    isPercentage: false,
    section: 'Emotional',
  },
  {
    number: 24,
    questionText:
      'How BOTHERED or UPSET have you been because of your tinnitus?',
    leftAnchorLabel: 'Not at all bothered or upset',
    rightAnchorLabel: 'Extremely bothered or upset',
    reversed: false,
    isPercentage: false,
    section: 'Emotional',
  },
  {
    number: 25,
    questionText: 'How DEPRESSED were you because of your tinnitus?',
    leftAnchorLabel: 'Not at all depressed',
    rightAnchorLabel: 'Extremely depressed',
    reversed: false,
    isPercentage: false,
    section: 'Emotional',
  },
]
