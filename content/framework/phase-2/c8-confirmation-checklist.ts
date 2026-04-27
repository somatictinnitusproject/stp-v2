// C.8 — Maintaining Factor Confirmation Checklist
// Source: Document 8 Part C section C.8. Verbatim member-facing prose.
//
// No personalisation: Doc 8 has no system note for C.8. The checklist
// applies universally to every member regardless of profile. Members
// self-attest; the button is unconditional per Doc 8 line 457.

// ── Content types ────────────────────────────────────────────────────────────

export type C8ConfirmationChecklist = {
  sectionLabel: string
  sectionTitle: string
  introductionTitle: string
  framingParagraphs: string[]      // 2 framing paragraphs before the checklist
  checklistIntro: string           // single line: "Before confirming, work through the following honestly:"
  checklistItems: string[]         // 5 honesty items
  warningParagraph: string         // italic warning after the checklist
  confirmButtonLabel: string       // single confirmation CTA
}

// ── Content constant ──────────────────────────────────────────────────────────

export const C8_CONFIRMATION_CHECKLIST: C8ConfirmationChecklist = {
  sectionLabel: 'Phase 2 \u2014 Lifestyle Foundations',
  sectionTitle: 'Maintaining Factor Confirmation Checklist',
  introductionTitle: 'Before You Begin Phase 3',
  framingParagraphs: [
    'Phase 3 is the primary intervention \u2014 the targeted protocol ' +
    'work that directly addresses your driver pathway. The habits, ' +
    'diet, sleep, and lifestyle foundations covered in Phase 2 exist ' +
    'because protocol work operates on top of whatever daily patterns ' +
    'are already in place. Addressing the maintaining factors first ' +
    'means Phase 3 is working in a cleared environment. Skipping that ' +
    'step and proceeding anyway means the protocol is working against ' +
    'the same patterns it is trying to correct.',

    'This checklist is not a formality. Phase 3 unlocks when you ' +
    'confirm it \u2014 but the value of that confirmation depends ' +
    'entirely on whether it is genuine. There is no minimum time ' +
    'requirement and no external check. The honest answer is the ' +
    'useful one.',
  ],
  checklistIntro: 'Before confirming, work through the following honestly:',
  checklistItems: [
    'The jaw habits that apply to me are genuinely being addressed ' +
    '\u2014 resting jaw position, clenching awareness, and any other ' +
    'flagged patterns are actively being interrupted rather than just ' +
    'understood',

    'The cervical and postural habits that apply to me are genuinely ' +
    'being addressed \u2014 sleep position, screen height, movement ' +
    'breaks, and any other flagged patterns are in place or actively ' +
    'being changed',

    'The systemic habits that apply to me have been considered and I ' +
    'am making the adjustments that are realistic for my situation',

    'I have read the diet and supplement foundations and integrated ' +
    'what is practical',

    'My sleep foundations are in place',
  ],
  warningParagraph:
    'If any of these are not yet genuinely in place \u2014 return to ' +
    'the relevant section and address them before confirming. Phase 3 ' +
    'will be more effective for it.',
  confirmButtonLabel:
    'I have addressed the maintaining factors relevant to my profile ' +
    'and I am ready to begin Phase 3',
}
