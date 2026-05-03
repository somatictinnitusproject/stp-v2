import type { FrameworkProgressRow } from '@/lib/scoring/types'
import { toLocalDateStr } from './timeWindow'

export interface Milestone {
  id: string
  label: string
  shortLabel: string
  date: string
}

// Derives the ordered list of phase milestones from framework_progress timestamps.
// Each non-null timestamp becomes a milestone entry; phase2_completed_at produces two.
export function getMilestones(progress: FrameworkProgressRow | null): Milestone[] {
  if (progress === null) return []

  const milestones: Milestone[] = []

  if (progress.phase1_completed_at) {
    milestones.push({
      id: 'phase1_completed',
      label: 'Phase 1 completed',
      shortLabel: 'P1 done',
      date: toLocalDateStr(new Date(progress.phase1_completed_at)),
    })
  }

  if (progress.phase2_completed_at) {
    milestones.push({
      id: 'phase2_completed',
      label: 'Phase 2 completed',
      shortLabel: 'P2 done',
      date: toLocalDateStr(new Date(progress.phase2_completed_at)),
    })
    milestones.push({
      id: 'phase3_started',
      label: 'Phase 3 started',
      shortLabel: 'P3 start',
      date: toLocalDateStr(new Date(progress.phase2_completed_at)),
    })
  }

  if (progress.resistance_phase_start) {
    milestones.push({
      id: 'resistance_started',
      label: 'Resistance phase started',
      shortLabel: 'Resistance',
      date: toLocalDateStr(new Date(progress.resistance_phase_start)),
    })
  }

  if (progress.phase3_completed_at) {
    milestones.push({
      id: 'phase3_completed',
      label: 'Phase 3 completed',
      shortLabel: 'P3 done',
      date: toLocalDateStr(new Date(progress.phase3_completed_at)),
    })
  }

  if (progress.phase4_first_accessed) {
    milestones.push({
      id: 'phase4_accessed',
      label: 'Phase 4 first accessed',
      shortLabel: 'P4 start',
      date: toLocalDateStr(new Date(progress.phase4_first_accessed)),
    })
  }

  if (progress.phase5_completed_at) {
    milestones.push({
      id: 'phase5_completed',
      label: 'Phase 5 completed',
      shortLabel: 'P5 done',
      date: toLocalDateStr(new Date(progress.phase5_completed_at)),
    })
  }

  return milestones
}
