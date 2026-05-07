// Phase 2: Lifestyle Foundations types.
// Spec: Doc 8 Part C, Doc 13 §5.3.

// Section identifier — one of the 8 Phase 2 sessions.
// Doc 8 Part C authoring labels.
export type Phase2SectionId =
  | 'C1'  // Opening Framing
  | 'C2'  // Habits Audit: Jaw-Specific
  | 'C3'  // Habits Audit: Cervical and Postural
  | 'C4'  // Habits Audit: Systemic
  | 'C5'  // Diet Foundations
  | 'C6'  // Supplements
  | 'C7'  // Sleep Foundations
  | 'C8'  // Maintaining Factor Confirmation Checklist

// The shape of the phase2_habits_acknowledged JSONB column.
// Each section-level acknowledge writes a top-level key.
// Per-habit acknowledges within C2/C3/C4 nest under the section key.
// All values are ISO timestamps.
// Doc 8 C.8 system note: engagement telemetry only, not access control.
export interface Phase2HabitsAcknowledged {
  C1?: string                              // ISO timestamp
  C2?: { section?: string; habits?: Record<string, string> }
  C3?: { section?: string; habits?: Record<string, string> }
  C4?: { section?: string; habits?: Record<string, string> }
  C5?: string
  C6?: string
  C7?: string
  // C8 not stored here — C.8 confirmation writes phase2_completed_at instead.
}

// Submit payload shape for section-level acknowledge routes (M12b–M12e).
export interface Phase2AcknowledgeSubmission {
  sectionId: Phase2SectionId
  habitId?: string  // Present for per-habit acknowledges within C2/C3/C4 only
}
