/**
 * /lib/tfi/scoring.ts
 *
 * Pure TFI scoring function per Meikle et al. 2012.
 *
 * Subscale composition:
 *   Intrusive (I):        items 1, 2, 3
 *   Sense of Control (SC): items 4*, 5*, 6      (* reverse-scored: 10 - raw)
 *   Cognitive (C):        items 7, 8
 *   Sleep (SL):           items 9, 10
 *   Auditory (A):         items 11, 12, 13
 *   Relaxation (R):       items 14*, 15*, 16    (* reverse-scored)
 *   Quality of Life (Q):  items 17, 18, 19, 20, 21, 22
 *   Emotional (E):        items 23, 24, 25
 *
 * Each subscale score = (rawSum / maxPossible) * 100, rounded to 2dp.
 * Total score = mean of all 8 subscale scores, rounded to 2dp.
 */

export interface TfiResponses {
  item_1: number;  item_2: number;  item_3: number
  item_4: number;  item_5: number;  item_6: number
  item_7: number;  item_8: number
  item_9: number;  item_10: number
  item_11: number; item_12: number; item_13: number
  item_14: number; item_15: number; item_16: number
  item_17: number; item_18: number; item_19: number
  item_20: number; item_21: number; item_22: number
  item_23: number; item_24: number; item_25: number
}

export interface TfiScores {
  subscale_intrusive:        number
  subscale_sense_of_control: number
  subscale_cognitive:        number
  subscale_sleep:            number
  subscale_auditory:         number
  subscale_relaxation:       number
  subscale_quality_of_life:  number
  subscale_emotional:        number
  total_score:               number
}

function roundTo2(n: number): number {
  return Math.round(n * 100) / 100
}

function subscaleScore(rawSum: number, itemCount: number): number {
  return roundTo2((rawSum / (itemCount * 10)) * 100)
}

/**
 * Calculate all TFI subscale scores and total score from raw item responses.
 * Items 4, 5, 14, 15 are reverse-scored (10 - value) before summing.
 * All output values are rounded to 2 decimal places.
 */
export function calculateTfiScores(r: TfiResponses): TfiScores {
  // Reverse-scored items: reversed_value = 10 - raw
  const r4  = 10 - r.item_4
  const r5  = 10 - r.item_5
  const r14 = 10 - r.item_14
  const r15 = 10 - r.item_15

  const intrusive        = subscaleScore(r.item_1 + r.item_2 + r.item_3, 3)
  const sense_of_control = subscaleScore(r4 + r5 + r.item_6, 3)
  const cognitive        = subscaleScore(r.item_7 + r.item_8, 2)
  const sleep            = subscaleScore(r.item_9 + r.item_10, 2)
  const auditory         = subscaleScore(r.item_11 + r.item_12 + r.item_13, 3)
  const relaxation       = subscaleScore(r14 + r15 + r.item_16, 3)
  const quality_of_life  = subscaleScore(
    r.item_17 + r.item_18 + r.item_19 + r.item_20 + r.item_21 + r.item_22, 6,
  )
  const emotional = subscaleScore(r.item_23 + r.item_24 + r.item_25, 3)

  const total_score = roundTo2(
    (intrusive + sense_of_control + cognitive + sleep +
     auditory + relaxation + quality_of_life + emotional) / 8,
  )

  return {
    subscale_intrusive:        intrusive,
    subscale_sense_of_control: sense_of_control,
    subscale_cognitive:        cognitive,
    subscale_sleep:            sleep,
    subscale_auditory:         auditory,
    subscale_relaxation:       relaxation,
    subscale_quality_of_life:  quality_of_life,
    subscale_emotional:        emotional,
    total_score,
  }
}
