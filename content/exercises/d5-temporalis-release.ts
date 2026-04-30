// /content/exercises/d5-temporalis-release.ts
// D.5 — Temporalis Release
// Verbatim member-facing copy from Document 8 Part D, section D.5.
// Targets the temporalis — primary jaw closing muscle alongside masseter.
//
// ProfileModifier: triggers on temporal_headache — a column NOT in phase1_assessment
// (P3-13 unpersisted flags). Silently omits per filterQualifyingModifiers helper.
// Defined here to preserve design intent and activate if the column is added later.

import type { Exercise } from './_types'
import type { Phase1AssessmentRow } from '@/lib/scoring/types'

const d5TemporalisRelease: Exercise = {
  kind: 'exercise',
  id: 'D5_temporalis_release',
  sectionRef: 'D.5',
  name: 'Temporalis Release',
  category: 'jaw-release',
  estimatedMinutes: 5,
  focusLine: 'Release the full jaw closing system, not just the masseter',

  fullContent: [
    {
      type: 'p',
      text: 'The temporalis is a broad fan-shaped muscle covering the side of the skull above and in front of the ear, running down to attach to the lower jaw. Along with the masseter it is one of the two primary jaw closing muscles — and like the masseter it is a common site of chronic tension in people with jaw-driven tinnitus.',
    },
    {
      type: 'p',
      text: "Temporalis tension contributes to temporal headaches, a sense of pressure or fullness around the ear, and sustained jaw closing force that loads the TMJ and trigeminal pathway continuously between sessions. Because it sits above and behind the obvious jaw area most people don't associate it with jaw dysfunction — but its attachment to the mandible means chronic temporalis tension is directly loading the same pathway the rest of this protocol is working to unload.",
    },
    {
      type: 'subhead',
      text: 'Technique',
    },
    {
      type: 'p',
      text: 'Place the fingertips of both hands on the temporal region — the area of the skull above and slightly in front of each ear, in the natural hollow between the brow ridge and the top of the ear. You should be able to feel the muscle contract if you gently clench your teeth.',
    },
    {
      type: 'p',
      text: 'Apply firm sustained pressure into the muscle using your fingertips. Hold each position for 90 seconds without releasing. Work through three positions across the muscle — anterior (closest to the eye), middle (directly above the ear), and posterior (behind the ear toward the back of the skull).',
    },
    {
      type: 'p',
      text: 'The pressure should be firm enough to feel the muscle responding — a dull aching sensation under the fingertips is normal and indicates you are in the right tissue. Sharp or shooting pain is not normal — reduce pressure immediately.',
    },
    {
      type: 'emphasis',
      text: 'Ninety seconds per position. Both sides simultaneously where possible.',
    },
  ],

  condensedSummary: [
    {
      type: 'p',
      text: 'Place fingertips on the temporal region above and slightly in front of each ear. Apply firm sustained pressure for 90 seconds per position across three positions — anterior, middle, posterior. Both sides simultaneously where possible.',
    },
  ],

  videoId: null,
  commonMistakes: null,
  contraindications: null,

  profileModifiers: [
    {
      // temporal_headache is NOT in phase1_assessment (P3-13 unpersisted flag).
      // filterQualifyingModifiers resolves to undefined → strict equality fails → silent omit.
      triggerFlag: 'temporal_headache' as unknown as keyof Phase1AssessmentRow,
      triggerValue: true,
      title: 'Temporal Headache or Ear Fullness Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your symptom history includes temporal headache, ear fullness, or pressure around the ear. Temporalis tension is a direct contributor to both of these alongside its role in your tinnitus pathway. This exercise is particularly relevant to your presentation — give it full attention.',
        },
      ],
    },
  ],

  shorter_session_eligible: true,
  rotation_slot: null,
  timer: null,
}

export default d5TemporalisRelease
