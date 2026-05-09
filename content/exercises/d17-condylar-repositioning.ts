// /content/exercises/d17-condylar-repositioning.ts
// D.17 — Condylar Repositioning
// Verbatim member-facing copy from Document 8 Part D, section D.17.
//
// Pre-launch §1.16 paragraph PREPENDED as the first content block,
// rendered as callout: info to visually separate clinical-context
// framing from Doc 8 technique copy.
//
// Doc 8 inline "Important" callout retained at Doc 8 source position
// (between mechanism paragraph and Technique subhead) as
// callout: warning. Frames physiotherapy referral for frequent
// locking — informational context, not a contraindication.
//
// Doc 8's "[joint sounds / restricted opening / catching]" placeholder
// paragraph dropped entirely per M13p.3 authoring decision (option b).
// The conditional gate communicates the "this is for your presentation"
// framing implicitly — members only see D.17 when one of the qualifying
// flags is true.
//
// ProfileModifier triggers on jaw_locking. Column added to
// Phase1AssessmentRow type in M13p.3.0 (preflight type drift fix).

import type { Exercise } from './_types'

const d17CondylarRepositioning: Exercise = {
  kind: 'exercise',
  id: 'D17_condylar_repositioning',
  sectionRef: 'D.17',
  name: 'Condylar Repositioning',
  category: 'resistance-training',
  bodyRegion: 'jaw',
  libraryDurationLabel: '2 minutes',
  estimatedMinutes: 2,
  focusLine: 'Guide the joint into its correct position',

  fullContent: [
    {
      type: 'callout',
      tone: 'info',
      text: 'This exercise is a self-administered approximation of clinically-managed treatment for disc displacement. Anterior repositioning splints fitted by a dental specialist alongside physiotherapy are the dominant clinical approach for confirmed disc displacement with reduction. The home version below targets the same underlying mechanism but is one component of management rather than a complete solution. If you have access to a dental specialist or physiotherapist with TMD expertise, working with them alongside the framework will produce better outcomes than the home version alone.',
    },
    {
      type: 'p',
      text: 'The TMJ distraction work in the release phase decompressed the joint space. The symmetry retraining and progressive resistance work has improved the movement pattern and muscular balance around it. Condylar repositioning builds on both, using specific controlled movement patterns to encourage the condyle to seat correctly within the glenoid fossa and improve disc position over time.',
    },
    {
      type: 'p',
      text: 'This is the most advanced exercise in the protocol. It is introduced here, later in the resistance phase, deliberately; the joint needs the foundation of the earlier work before repositioning movements are productive.',
    },
    {
      type: 'callout',
      tone: 'warning',
      text: 'If your jaw catches, locks, or significantly restricts opening on a regular basis rather than occasionally, a single physiotherapy session to confirm your specific displacement pattern before continuing with this exercise is a worthwhile investment. Anterior disc displacement without reduction (where the disc is fully displaced and does not recapture) has a different optimal movement pattern to displacement with reduction. The exercise below is appropriate for the more common displacement with reduction presentation. If you experience frequent locking, confirm your pattern first.',
    },
    {
      type: 'subhead',
      text: 'Technique',
    },
    {
      type: 'p',
      text: 'Sit upright, head neutral. Begin with your jaw in the resting position: tongue on roof of mouth, teeth slightly apart.',
    },
    {
      type: 'p',
      text: 'Open the jaw slowly to mid-range, pausing briefly at the point where any clicking or deviation typically occurs. At this pause point, apply gentle forward and downward chin pressure with two fingers, encouraging the mandible to translate slightly forward and downward before continuing to open. This movement pattern encourages the condyle to translate correctly under the disc rather than compressing past it.',
    },
    {
      type: 'p',
      text: 'Continue opening slowly through the full comfortable range, maintaining the encouraged forward translation. Close slowly with control, maintaining midline tracking.',
    },
    {
      type: 'p',
      text: 'Eight to ten repetitions per set. One set per session. Perform after distraction work; the joint is most receptive to repositioning movement immediately after decompression.',
    },
  ],

  condensedSummary: [
    {
      type: 'p',
      text: 'Sit upright, jaw in resting position. Open slowly to mid-range, pause at the point of clicking or deviation. Apply gentle forward and downward chin pressure with two fingers, encouraging the mandible to translate forward and downward before continuing to open. Continue through full comfortable range, close slowly with midline tracking. Eight to ten reps, one set per session. Perform after distraction work.',
    },
  ],

  videoId: null,
  commonMistakes: null,
  contraindications: null,

  profileModifiers: [
    {
      triggerFlag: 'jaw_locking',
      triggerValue: true,
      title: 'Catching or Locking Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your assessment identified catching or locking rather than simple joint sounds. If this is occurring frequently (more than occasionally), a single physiotherapy session to confirm whether your disc displacement is with or without reduction is worth the time before continuing this exercise. This is not a barrier to the rest of your protocol, which continues unchanged.',
        },
      ],
    },
  ],

  shorter_session_eligible: true,
  rotation_slot: null,
  timer: null,
}

export default d17CondylarRepositioning
