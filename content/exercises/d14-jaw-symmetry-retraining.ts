// /content/exercises/d14-jaw-symmetry-retraining.ts
// D.14 — Jaw Symmetry Retraining
// Verbatim member-facing copy from Document 8 Part D, section D.14.
//
// Folded "no jaw drift" Doc 8 modifier into base fullContent paragraph
// 3 — applies to all members regardless of drift flag, per M13p.1
// authoring decision (option a).
//
// Doc 8's combined "restricted opening or joint sounds" modifier split
// into two separate modifiers (Modifier 2 and 3) per ProfileModifier
// single-flag constraint. Both render simultaneously for members with
// both flags, content authored to read coherently in that case.
//
// [left / right] placeholder in Modifier 1 retained literally per
// Decision 2 — direction templating deferred to a separate sub-step.

import type { Exercise } from './_types'

const d14JawSymmetryRetraining: Exercise = {
  kind: 'exercise',
  id: 'D14_jaw_symmetry_retraining',
  sectionRef: 'D.14',
  name: 'Jaw Symmetry Retraining',
  category: 'resistance-training',
  bodyRegion: 'jaw',
  libraryDurationLabel: '5 minutes',
  estimatedMinutes: 3,
  focusLine: 'Retrain the pattern before you load it',

  fullContent: [
    {
      type: 'p',
      text: 'The release phase reduced the tension and compression that was loading your jaw asymmetrically. This exercise begins the process of retraining the movement pattern that tension created.',
    },
    {
      type: 'p',
      text: 'Jaw drift on opening (where the lower jaw tracks consistently to one side) is a neuromuscular pattern, not just a tension pattern. The lateral pterygoid on the dominant side has learned to fire earlier and harder than the opposite side. The release work reduces its resting tone. Symmetry retraining corrects the firing pattern itself: teaching the pterygoids to produce a balanced, midline opening movement through repetition and conscious correction.',
    },
    {
      type: 'p',
      text: 'Symmetry retraining is relevant whether or not your assessment identified a significant drift pattern. For members without confirmed drift, it reinforces correct movement mechanics and builds the neuromuscular foundation for the progressive resistance work that follows. Focus on smooth, controlled, even opening rather than drift correction specifically.',
    },
    {
      type: 'emphasis',
      text: 'This is neuromuscular retraining, not strengthening. The goal at this stage is movement quality, not force. Slow, controlled, deliberate repetitions in front of a mirror. Resistance comes later.',
    },
    {
      type: 'subhead',
      text: 'Technique',
    },
    {
      type: 'p',
      text: 'Stand or sit in front of a mirror with your face in a neutral, relaxed position. Locate your midline: the centre line running between your upper and lower front teeth.',
    },
    {
      type: 'p',
      text: 'Open your jaw slowly and in a controlled way, watching the lower teeth track against the upper. Your target is a straight midline trajectory throughout the full range of opening; lower teeth tracking directly downward without deviating left or right.',
    },
    {
      type: 'p',
      text: 'Open to a comfortable mid-range, not forced wide. Close slowly and with the same control. One full open-close cycle should take four to six seconds.',
    },
    {
      type: 'p',
      text: 'If drift occurs (and it likely will in early sessions), stop at the point of drift, consciously reposition to midline, and continue from there. You are interrupting the habitual pattern and substituting a corrected one. The interruption is the training stimulus.',
    },
    {
      type: 'p',
      text: 'Ten repetitions per set. Two sets per session. Rest between sets.',
    },
    {
      type: 'p',
      text: 'As control improves across sessions, increase difficulty progressively: increase range of opening incrementally, introduce eyes-closed repetitions once midline tracking is reliable with visual feedback, reduce the frequency of drift-correction interruptions as the pattern self-corrects.',
    },
    {
      type: 'subhead',
      text: 'Proprioception Progression',
    },
    {
      type: 'p',
      text: 'Once midline tracking is consistent with visual feedback (drift rare or absent on mirror check), introduce proprioceptive training:',
    },
    {
      type: 'p',
      text: 'Close your eyes. Open your jaw to what feels like the midline position. Open your eyes and check. The gap between where you thought midline was and where your jaw actually tracked is your proprioceptive error. Reduce that error through repeated practice.',
    },
    {
      type: 'p',
      text: 'This is the progression that consolidates the retraining: moving from visually-guided correction to internally-guided accuracy. It is the difference between needing a mirror to move correctly and moving correctly without one.',
    },
  ],

  condensedSummary: [
    {
      type: 'p',
      text: 'Mirror setup. Open jaw slowly and controlled, watching lower teeth track midline against upper. Mid-range only, not forced wide. Four to six seconds per open-close cycle. If drift occurs, stop, reposition to midline, continue. Ten reps, two sets per session. Once tracking is reliable with visual feedback, progress to eyes-closed proprioceptive training.',
    },
  ],

  videoId: null,
  commonMistakes: null,
  contraindications: null,

  profileModifiers: [
    {
      triggerFlag: 'tmj_jaw_drift',
      triggerValue: true,
      title: 'Jaw Drift Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your assessment identified consistent jaw drift to the [left / right]. The [left / right] lateral pterygoid is the overactive side producing this pattern. In early sessions your jaw will want to drift in its habitual direction; this is expected. The interruption and correction is the training. Fewer interruptions needed per set is your clearest progress indicator for this exercise.',
        },
      ],
    },
    {
      triggerFlag: 'tmj_joint_sounds',
      triggerValue: true,
      title: 'Joint Sounds Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your assessment identified joint sounds in your Phase 1 assessment. Work within your comfortable range; do not push into restriction or force range of motion. As the resistance phase progresses and disc position improves through the combined effect of distraction and symmetry retraining, comfortable range typically increases gradually. Track this as a progress indicator alongside drift frequency.',
        },
      ],
    },
    {
      triggerFlag: 'tmj_opening_restriction',
      triggerValue: true,
      title: 'Restricted Opening Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your assessment identified restricted opening in your Phase 1 assessment. Work within your comfortable range; do not push into restriction or force range of motion. As the resistance phase progresses and disc position improves through the combined effect of distraction and symmetry retraining, comfortable range typically increases gradually. Track range improvement across sessions as a progress indicator alongside drift frequency.',
        },
      ],
    },
  ],

  shorter_session_eligible: true,
  rotation_slot: null,
  timer: null,
}

export default d14JawSymmetryRetraining
