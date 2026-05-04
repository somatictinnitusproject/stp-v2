// /content/exercises/e8-upper-trap-scalene-release.ts
// E.8 — Upper Trapezius and Scalene Release
// Verbatim member-facing copy from Document 8 Part E, section E.8.
//
// Two sub-techniques: Upper Trapezius Release and Scalene Release.
// Rendered as inline subheads in fullContent following Doc 8 source
// structure (no separate fields for sub-techniques).
//
// Neurovascular Important callout retained inline at Doc 8 source
// position (between Scalene Release framing and Scalene Technique)
// as callout: warning. Frames safety guidance for proximity to
// brachial plexus and subclavian vessels — applies to scalene
// technique specifically. Not in contraindications array because
// it is "apply with care" not "do not perform" per d10 precedent.
//
// ProfileModifier triggers on cerv_trap_asymmetry (boolean) — Doc 8
// references "cerv_upper_trap_asymmetry" but live schema uses
// cerv_trap_asymmetry per M13s.2 schema reconciliation (same pattern
// as E.5's tender_side resolution and M13p.3 jaw_locking). Side
// rendered from cerv_trap_dominant_side. Literal [left / right]
// placeholder retained per Decision 2.

import type { Exercise } from './_types'

const e8UpperTrapScaleneRelease: Exercise = {
  kind: 'exercise',
  id: 'E8_upper_trap_scalene_release',
  sectionRef: 'E.8',
  name: 'Upper Trapezius and Scalene Release',
  category: 'cervical-release',
  bodyRegion: 'cervical',
  libraryDurationLabel: '60–90 sec per side',
  estimatedMinutes: 4,
  focusLine: 'Release the muscles compressing your cervical spine from above and below',

  fullContent: [
    {
      type: 'p',
      text: 'These two muscle groups are addressed together because they work in opposition on the cervical spine — the upper trapezius compresses from above and out laterally, the scalenes compress from below. Chronic tension in both simultaneously creates a compressive load on the cervical spine from two directions at once. Releasing them together in the same session produces a more complete decompression than addressing either in isolation.',
    },
    {
      type: 'subhead',
      text: 'Upper Trapezius Release',
    },
    {
      type: 'p',
      text: 'The upper trapezius runs from the base of the skull and upper cervical spine out to the tip of the shoulder on each side. Chronic tension here elevates the shoulder, loads the cervicothoracic junction, and contributes to the forward head posture pattern that keeps the upper cervical pathway persistently activated.',
    },
    {
      type: 'p',
      text: 'This is a sustained compression release using finger or thumb pressure directly into the muscle belly — sustained pressure applied manually rather than through gravity loading.',
    },
    {
      type: 'subhead',
      text: 'Technique — Upper Trapezius',
    },
    {
      type: 'p',
      text: 'Reach across with your opposite hand and grasp the muscle at the peak of the shoulder — the highest point of the trapezius ridge between the neck and the shoulder tip. Apply firm sustained pressure into the muscle belly using your fingers, working slowly along the ridge from the shoulder tip toward the base of the skull. Spend extra time on any points of particular tenderness — sustained pressure at those points produces the most release.',
    },
    {
      type: 'p',
      text: 'Work each side for 60 to 90 seconds. The pressure should be firm and produce a deep aching sensation. If a point is acutely tender, sustain pressure there rather than moving through it quickly.',
    },
    {
      type: 'subhead',
      text: 'Scalene Release',
    },
    {
      type: 'p',
      text: 'The scalenes are three muscles running from the upper cervical transverse processes down to the first and second ribs. Their role is neck flexion and rotation, but when chronically hypertonic they pull the cervical spine downward and forward, compressing the upper cervical joints from below while the suboccipital muscles compress from above.',
    },
    {
      type: 'p',
      text: 'Scalene release uses sustained finger pressure into the muscle bellies on the side of the neck. The technique requires care — the scalenes sit adjacent to important neurovascular structures including the brachial plexus and subclavian vessels.',
    },
    {
      type: 'callout',
      tone: 'warning',
      text: 'Apply moderate sustained pressure only — do not dig aggressively into the lateral neck. If you feel a pulsation under your fingers, reposition immediately — you are over a vessel, not muscle tissue. If you experience any tingling, numbness, or shooting sensation into the arm during this technique, stop immediately and reposition. These sensations indicate contact with neural tissue rather than muscle. The correct sensation is a dull muscular ache — nothing sharp, pulsatile, or radiating.',
    },
    {
      type: 'subhead',
      text: 'Technique — Scalenes',
    },
    {
      type: 'p',
      text: 'Sit upright and tilt your head slightly away from the side you are working — this slackens the SCM and brings the scalenes closer to the surface. Place two or three fingers on the side of the neck, just behind the SCM and above the collarbone. Apply moderate sustained pressure inward and slightly downward into the muscle tissue.',
    },
    {
      type: 'p',
      text: 'Work slowly along the scalene region from just above the collarbone upward toward the transverse processes, spending 20 to 30 seconds per position. Both sides. The pressure should produce a deep dull ache in the muscle. Reposition immediately if any of the sensations described above are produced.',
    },
    {
      type: 'p',
      text: 'Work each side for 60 to 90 seconds total.',
    },
    {
      type: 'emphasis',
      text: 'Watch the demonstration video carefully before your first attempt. Correct finger placement to target muscle rather than adjacent structures is best confirmed visually.',
    },
  ],

  condensedSummary: [
    {
      type: 'p',
      text: 'Upper trap: reach across with opposite hand, grasp muscle peak between neck and shoulder, firm sustained pressure into muscle belly, work slowly toward base of skull, 60 to 90 seconds per side. Scalenes: head tilted slightly away from working side, two to three fingers behind SCM above collarbone, moderate sustained pressure inward and slightly downward, 20 to 30 seconds per position, 60 to 90 seconds per side total. Stop and reposition immediately if pulsation, tingling, numbness, or shooting sensation.',
    },
  ],

  videoId: null,
  commonMistakes: null,
  contraindications: null,

  profileModifiers: [
    {
      triggerFlag: 'cerv_trap_asymmetry',
      triggerValue: true,
      title: 'Upper Trapezius Asymmetry Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your assessment identified asymmetric upper trapezius tension — more pronounced on your [left / right] side. Spend additional time on that side during the upper trapezius release — work the dominant side for 90 seconds and the other for 60. The scalene release remains bilateral and equal regardless of upper trapezius asymmetry.',
        },
      ],
    },
  ],

  shorter_session_eligible: true,
  rotation_slot: null,
  timer: null,
}

export default e8UpperTrapScaleneRelease
