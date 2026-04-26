// B.6 — Module 5: Asymmetry & Pattern
// Source: Document 8 Part B, section B.6. All framing prose, consolidated findings
// list, question prompt, option labels, and record label verbatim from Doc 8.
// This module captures the tinnitus lateralisation answer and triggers profile generation.
// One column written to phase1_assessment on submit:
//   asym_tinnitus_worse_ear (via /api/framework/phase-1/asymmetry route — M10c)
// The asym_* columns (jaw drift direction, masseter dominant side, etc.) are
// consolidated for display from existing assessment data — not re-entered here.
// Pattern analysis output (classifyAsymmetryPattern §3.4) is computed at profile
// generation time; this content file contains no pattern output prose.

import type {
  B6LateralisationAnswer,
  B6LateralisationOption,
  B6FindingSource,
  B6Module5Asymmetry,
} from './types'

// ── Content ───────────────────────────────────────────────────────────────────

export const B6_MODULE_5_ASYMMETRY: B6Module5Asymmetry = {
  id: 'B6',
  sessionNumber: 6,
  sectionLabel: 'Phase 1 \u2014 Identification',
  sectionTitle: 'Module 5: Asymmetry & Pattern',

  framing: [
    'This module sits after all four driver modules because you now have the context to understand what asymmetric findings mean. On their own, a left-drifting jaw or an elevated right shoulder are isolated observations. Together, with the full picture from Modules 1 through 4, they form a pattern \u2014 and patterns are more meaningful than individual findings.',
    'Asymmetry matters for somatic tinnitus because the trigeminal and upper cervical pathways are lateralised. Input from the left side of the jaw feeds primarily into the left side of the brainstem\u2019s auditory processing system. When one side is consistently generating more abnormal input than the other, the tinnitus is often louder in the corresponding ear \u2014 or the contralateral one, depending on the specific pathway involved.',
    'This module consolidates the asymmetric findings from across your assessment into a single pattern picture, and asks one new question about your tinnitus itself.',
  ],

  consolidatedHeading: 'Your asymmetric findings',

  consolidatedIntro: 'All pulled automatically from data already entered \u2014 no new inputs required for these:',

  // Eight asymmetric findings consolidated read-only from prior module answers.
  // Client renders each entry where presenceColumn is TRUE and sideColumn is non-null.
  // Display format: label + ' \u2014 ' + sideColumn value (e.g. "Jaw drift on opening — left").
  consolidatedFindings: [

    // ── Module 1 jaw findings ───────────────────────────────────────────────

    {
      label: 'Jaw drift on opening',
      sourceColumn: 'tmj_jaw_drift',
      sideColumn: 'tmj_jaw_drift_direction',
      presenceColumn: 'tmj_jaw_drift',
    },
    {
      label: 'Masseter dominant side',
      sourceColumn: 'tmj_masseter_dominant_side',
      sideColumn: 'tmj_masseter_dominant_side',
      presenceColumn: 'tmj_masseter_asymmetry',
    },
    {
      label: 'Pterygoid tenderness dominant side',
      sourceColumn: 'tmj_pterygoid_tender_side',
      sideColumn: 'tmj_pterygoid_tender_side',
      presenceColumn: 'tmj_pterygoid_tenderness',
    },

    // ── Module 2 cervical findings ──────────────────────────────────────────

    {
      label: 'Suboccipital tenderness dominant side',
      sourceColumn: 'cerv_suboccipital_tender_side',
      sideColumn: 'cerv_suboccipital_tender_side',
      presenceColumn: 'cerv_suboccipital_asymmetric',
    },
    {
      label: 'SCM dominant side',
      sourceColumn: 'cerv_scm_dominant_side',
      sideColumn: 'cerv_scm_dominant_side',
      presenceColumn: 'cerv_scm_asymmetry',
    },
    {
      label: 'Upper trapezius dominant side',
      sourceColumn: 'cerv_trap_dominant_side',
      sideColumn: 'cerv_trap_dominant_side',
      presenceColumn: 'cerv_trap_asymmetry',
    },
    {
      label: 'Cervical rotation restricted side',
      sourceColumn: 'cerv_restricted_side',
      sideColumn: 'cerv_restricted_side',
      presenceColumn: 'cerv_rotation_restriction',
    },

    // ── Module 3 postural findings ──────────────────────────────────────────

    {
      label: 'Elevated shoulder',
      sourceColumn: 'post_elevated_side',
      sideColumn: 'post_elevated_side',
      presenceColumn: 'post_shoulder_asymmetry',
    },

  ],

  emptyStateText: 'Your assessment did not identify significant asymmetric patterns. Your protocol will be bilateral throughout without side-specific emphasis.',

  questionHeading: 'Tinnitus Lateralisation',

  questionPrompt: 'Is your tinnitus worse in one ear than the other, or does it feel more localised to one side?',

  questionOptions: [
    { value: 'left',      label: 'Yes \u2014 clearly worse in my left ear' },
    { value: 'right',     label: 'Yes \u2014 clearly worse in my right ear' },
    { value: 'bilateral', label: 'It\u2019s in both ears roughly equally' },
    { value: 'central',   label: 'It\u2019s more of a central or head sound without clear lateralisation' },
    { value: 'unsure',    label: 'I\u2019m not sure' },
  ],

  recordLabel: 'Tinnitus lateralisation \u2014 left / right / bilateral / central / unsure.',

  submitLabel: 'Save and continue',
}
