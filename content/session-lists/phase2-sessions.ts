// Phase 2 — Lifestyle Foundations session list.
// Spec: Doc 8 Part C, Doc 13 §5.3.
// Eight addressable member sessions C.1–C.8. C.9 (Phase 3 transition screen) is
// not a member session — it is an interstitial rendered on first Phase 3 entry.
// C.10 (focus line reference table) is internal documentation only.

export interface SessionItem {
  id: string
  sectionKey: string
  name: string
  estimatedMinutes: number
  phase: number
}

export const PHASE2_SESSIONS: SessionItem[] = [
  { id: 'C1', sectionKey: 'openingFraming',             name: 'Clearing the Path',                    estimatedMinutes: 5,  phase: 2 },
  { id: 'C2', sectionKey: 'habitsAuditJaw',             name: 'Habits Audit — Jaw-Specific',          estimatedMinutes: 15, phase: 2 },
  { id: 'C3', sectionKey: 'habitsAuditCerv',            name: 'Habits Audit — Cervical and Postural', estimatedMinutes: 15, phase: 2 },
  { id: 'C4', sectionKey: 'habitsAuditSystemic',        name: 'Habits Audit — Systemic',              estimatedMinutes: 10, phase: 2 },
  { id: 'C5', sectionKey: 'dietFoundations',            name: 'Diet Foundations',                     estimatedMinutes: 10, phase: 2 },
  { id: 'C6', sectionKey: 'supplements',                name: 'Supplements',                          estimatedMinutes: 8,  phase: 2 },
  { id: 'C7', sectionKey: 'sleepFoundations',           name: 'Sleep Foundations',                    estimatedMinutes: 10, phase: 2 },
  { id: 'C8', sectionKey: 'maintainingFactorChecklist', name: 'Maintaining Factor Confirmation',      estimatedMinutes: 5,  phase: 2 },
]
