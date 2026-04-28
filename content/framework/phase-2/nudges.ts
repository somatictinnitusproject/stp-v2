// Phase 2 contextual nudges — Doc 13 §9.2.
//
// Three nudges render inline at specific Phase 2 sections to surface
// Phase 4 content recommendations based on Phase 1 flags. Each card
// displays a small title, the recommendation body, and a dismiss-X.
// No CTA in M12i — Phase 4 build (post-launch) will add a "Go to
// Phase 4 X" button.
//
// ERRATA (Doc 13 §9.2): Nudge 2's trigger section is documented as
// C.5 but our build has Sleep Foundations at C.7. We trigger Nudge 2
// at C.7. See ERRATA_AND_BUILD_INSTRUCTIONS.md M12i note.

// Five nudge IDs — Phase 2 (3) + Phase 3 (2 deferred).
// The 5-ID set is exhaustive per Doc 13 §9.2 and matches the
// dismissal route's accepted IDs.
export type NudgeId =
  | 'phase4_workstation'              // Nudge 1 — C.2
  | 'phase4_sleep'                    // Nudge 2 — C.7
  | 'phase4_breathwork'               // Nudge 3 — C.8
  | 'phase4_nervous_system_stress'    // Nudge 4 — Phase 3 day 14 (deferred)
  | 'phase4_hypervigilance'           // Nudge 5 — Phase 3 day 14 (deferred)

export type NudgeData = {
  id: NudgeId
  title: string  // Always "Recommended for your profile" for now
  body: string
  // ctaLabel + ctaDestination omitted in M12i. Phase 4 build adds them.
}

// Nudge content — body text from Doc 13 §9.2 verbatim.
export const PHASE_2_NUDGES: Record<NudgeId, NudgeData | null> = {
  phase4_workstation: {
    id: 'phase4_workstation',
    title: 'Recommended for your profile',
    body:
      'Your assessment flagged sustained desk load. Phase 4\u2019s ' +
      'workstation section is directly relevant.',
  },
  phase4_sleep: {
    id: 'phase4_sleep',
    title: 'Recommended for your profile',
    body:
      'Sleep position change is one of the highest-impact things ' +
      'you can do. Phase 4 covers this in full.',
  },
  phase4_breathwork: {
    id: 'phase4_breathwork',
    title: 'Recommended for your profile',
    body:
      'Phase 4 breath work takes 10 minutes daily and can produce ' +
      'noticeable benefit within 2\u20133 weeks.',
  },
  // Phase 3 nudges — deferred until Phase 3 build
  phase4_nervous_system_stress: null,
  phase4_hypervigilance: null,
}
