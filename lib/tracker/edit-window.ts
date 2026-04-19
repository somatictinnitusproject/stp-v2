import { SCORING_THRESHOLDS } from '@/content/scoring-thresholds'

export function isEditable(createdAt: Date): boolean {
  return (
    Date.now() - createdAt.getTime() <
    SCORING_THRESHOLDS.EDIT_WINDOW_HOURS * 3_600_000
  )
}
