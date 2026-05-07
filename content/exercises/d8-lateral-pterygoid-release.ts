// /content/exercises/d8-lateral-pterygoid-release.ts
// D.8 — Lateral Pterygoid Release
// Verbatim member-facing copy from Document 8 Part D, section D.8.
//
// Pre-launch §1.5 correction applied: honest framing of the technique's
// evidence base added under a new 'A Note on the Evidence' subhead at the
// end of the technique block. Members understand the external approach reaches
// the attachment zone and overlying fascia rather than the muscle belly directly.
//
// ProfileModifier: triggers on tmj_jaw_drift. Side templating deferred —
// ProfileModifier type has no sideField key (follow-up M13m+).
// Content uses literal '[left / right]' per spec Decision 2.

import type { Exercise } from './_types'

const d8LateralPterygoidRelease: Exercise = {
  kind: 'exercise',
  id: 'D8_lateral_pterygoid_release',
  sectionRef: 'D.8',
  name: 'Lateral Pterygoid Release',
  category: 'jaw-release',
  bodyRegion: 'jaw',
  libraryDurationLabel: '90 sec per position',
  estimatedMinutes: 3,
  focusLine: 'Target the muscle that drives the drift',

  fullContent: [
    {
      type: 'p',
      text: 'The lateral pterygoid is the primary muscle responsible for jaw deviation on opening; if your Phase 1 assessment identified a consistent drift to one side, the lateral pterygoid on that side is the overactive muscle producing it. It also plays a central role in disc movement within the TMJ, attaching directly to the articular disc and pulling it forward during jaw opening. Chronic overactivity or asymmetric loading in this muscle contributes directly to disc displacement, joint loading, and aberrant trigeminal input.',
    },
    {
      type: 'p',
      text: "The lateral pterygoid sits deep to the masseter and zygomatic arch, which limits direct external access to the muscle belly itself. The external approach targets the lateral pterygoid attachment area and surrounding fascia at the most accessible point (just below the zygomatic arch), producing a release effect through sustained fascial pressure and reducing tension at the muscle's insertion zone.",
    },
    {
      type: 'emphasis',
      text: 'This is not the same depth of access as the intraoral technique. You are working the attachment zone and overlying fascia rather than the muscle belly directly. Sustained pressure here produces a genuine release effect but through a different mechanism than the deep intraoral work. Both are necessary. Neither replaces the other.',
    },
    {
      type: 'subhead',
      text: 'Technique',
    },
    {
      type: 'p',
      text: 'Locate the zygomatic arch: the bony ridge running from your cheekbone toward your ear. Place your index finger just below this arch, approximately halfway between your ear and the outer corner of your eye. This is the landmark you used in the Phase 1 lateral pterygoid palpation assessment.',
    },
    {
      type: 'p',
      text: 'Apply firm inward and slightly upward pressure at this point. The tissue here will often be tender in people with confirmed pterygoid overactivity; that tenderness confirms accurate targeting. Hold sustained pressure for 90 seconds per position. Work through two positions: the primary landmark point and one position slightly more anterior along the same line below the arch.',
    },
    {
      type: 'subhead',
      text: 'A Note on the Evidence',
    },
    {
      type: 'p',
      text: 'Lateral pterygoid release is a contested technique. The lateral pterygoid sits deep behind the zygomatic arch, and there is genuine anatomical debate about how reliably it can be accessed through external palpation alone. For some people the external technique reaches the right tissue; for others, the pressure may be working adjacent muscle (the deep masseter or temporalis tendon) rather than the lateral pterygoid specifically. Either way, the technique targets a tender region that often holds significant tension in TMJ-dominant cases, and many people report meaningful benefit. If you find this exercise produces a clear distinct response from the masseter release, keep it in your protocol. If it feels redundant with the masseter work for you, the masseter release on its own covers most of the same territory.',
    },
  ],

  condensedSummary: [
    {
      type: 'p',
      text: 'Locate the zygomatic arch and place your index finger just below it, halfway between your ear and the outer corner of your eye. Apply firm inward and slightly upward sustained pressure for 90 seconds per position. Work through two positions along the line below the arch. Both sides.',
    },
  ],

  videoId: null,
  commonMistakes: null,
  contraindications: null,

  profileModifiers: [
    {
      // Side templating deferred — ProfileModifier has no sideField key (follow-up M13m+).
      triggerFlag: 'tmj_jaw_drift',
      triggerValue: true,
      title: 'Jaw Drift Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your assessment identified jaw drift to the [left / right]. The [left / right] lateral pterygoid is the overactive side. Apply asymmetric emphasis; begin on the [left / right] and spend additional time there before working the other side. Over weeks of consistent release work you should notice the drift becoming less ; this is one of your clearest progress indicators for this exercise.',
        },
      ],
    },
  ],

  shorter_session_eligible: true,
  rotation_slot: null,
  timer: null,
}

export default d8LateralPterygoidRelease
