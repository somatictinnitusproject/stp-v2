// /content/exercises/e13-deep-cervical-flexor-training.ts
// E.13 — Deep Cervical Flexor Training
// Authored from Document 8 Part E §E.13 plus pre-launch §1.9
// (self-palpation fidelity check insertion).
//
// Three Stage subheads (Activation, Progressive Hold Duration,
// Upright Carryover) following Doc 8 source structure.
//
// §1.9 self-palpation fidelity check paragraph inserted in Stage 1
// between the hold/reps instruction and the existing common mistake
// warning. Without pressure biofeedback unit, fidelity is variable
// and members can substitute SCM/scalene activation without knowing
// — self-palpation gives a real-time check rather than abstract
// guidance.
//
// Doc 8's "the same horizontal retraction movement described in E.9"
// reference replaced with inline self-contained chin tuck
// description. E.9 is library-only per §1.14 — referencing it from
// a structured-protocol exercise would create a broken reference
// for members who don't see E.9 in their daily session.
//
// ProfileModifier triggers on cerv_forward_head_posture (boolean).
// Doc 8 modifier copy verbatim — well-written and clinically
// important: this is the single most important retraining exercise
// for FHP-confirmed members.

import type { Exercise } from './_types'

const e13DeepCervicalFlexorTraining: Exercise = {
  kind: 'exercise',
  id: 'E13_deep_cervical_flexor_training',
  sectionRef: 'E.13',
  name: 'Deep Cervical Flexor Training',
  category: 'resistance-training',
  bodyRegion: 'cervical',
  libraryDurationLabel: '10 reps × 3 sets',
  estimatedMinutes: 4,
  focusLine: 'Activate the muscles that should have been doing this work all along',

  fullContent: [
    {
      type: 'p',
      text: 'The deep cervical flexors (primarily the longus colli and longus capitis) are the muscles that run along the front of the cervical spine, deep to the superficial neck muscles. Their job is to maintain the natural cervical curve and provide the primary structural support for the head and neck during all upright activity. When they are functioning correctly, the superficial neck muscles (the SCM, scalenes, and upper trapezius) act as movement muscles rather than postural support muscles.',
    },
    {
      type: 'p',
      text: 'In people with chronic forward head posture and upper cervical tension, the deep cervical flexors become progressively inhibited. The superficial muscles take over their postural role, maintaining constant elevated tone to support a head position they were not designed to sustain. This is one of the primary reasons cervical ; the wrong muscles are doing the postural work, and they generate abnormal upper cervical input as a consequence.',
    },
    {
      type: 'p',
      text: 'Retraining the deep cervical flexors restores correct load distribution across the cervical system. As they become stronger and more active, the superficial muscles reduce their resting tone, releasing the tension that has been feeding into the upper cervical pathway. Deep cervical flexor inhibition develops over months or years and reverses over weeks and months of consistent training. Consistency matters more than intensity.',
    },
    {
      type: 'subhead',
      text: 'Technique, Stage 1: Activation',
    },
    {
      type: 'p',
      text: 'Begin lying on your back on a firm surface with your knees bent and feet flat on the floor.',
    },
    {
      type: 'p',
      text: ': a horizontal retraction movement, drawing the chin straight back without tilting the head downward. In this position the movement is performed against gravity, which makes the deep cervical flexors the primary muscles required to produce it. You should feel a gentle deep activation at the front of the cervical spine, not a strong contraction in the superficial muscles of the throat or jaw.',
    },
    {
      type: 'p',
      text: 'Hold the chin tuck position for 10 seconds. Release slowly. The release should be controlled; do not let the head drop back. Repeat 10 times.',
    },
    {
      type: 'p',
      text: 'To check whether you\'re activating the right muscles, place two fingers gently on the front of your throat: across the prominent muscles either side of your windpipe (the sternocleidomastoid and scalenes). Perform the chin tuck while monitoring these muscles. If you feel them bulging, hardening, or visibly tightening, you\'re substituting superficial muscle activation for deep flexor activation. The deep cervical flexors run along the front of the cervical spine: when they\'re working correctly, the front of your throat should remain relaxed and quiet. If you feel substitution happening, reduce your effort. The deep flexors respond to low-load sustained activation, not strong contraction.',
    },
    {
      type: 'p',
      text: 'The common mistake at this stage is substituting superficial muscle activation ; the throat muscles visibly tighten, the jaw clenches, or the chin pushes forward rather than retracting. If this is happening, reduce the effort. : they respond to low load sustained activation, not high effort contraction.',
    },
    {
      type: 'subhead',
      text: 'Technique, Stage 2: Progressive Hold Duration',
    },
    {
      type: 'p',
      text: 'Once 10 repetitions of 10-second holds can be completed without substitution (smooth controlled retraction with no visible superficial muscle bracing), progress to longer holds. Work up to 10 repetitions of 20 to 30 second holds over subsequent sessions.',
    },
    {
      type: 'p',
      text: 'Progress only when the current duration can be completed cleanly. Loading duration before the activation pattern is correct reinforces substitution rather than deep flexor activation.',
    },
    {
      type: 'subhead',
      text: 'Technique, Stage 3: Upright Carryover',
    },
    {
      type: 'p',
      text: 'Once lying activation is established, begin practising the chin tuck position during upright activity: seated at a desk, standing, walking. The goal is for the deep cervical flexors to begin maintaining this position automatically during daily activity rather than only during the exercise itself. Start with brief deliberate holds during desk work and build from there.',
    },
    {
      type: 'p',
      text: '; the lying activation work continues as the foundation.',
    },
  ],

  condensedSummary: [
    {
      type: 'p',
      text: 'Lie on back, knees bent. Gentle chin tuck: horizontal retraction, draw chin straight back without tilting head down. Hold 10 seconds, release slowly. 10 reps. Self-palpation check: two fingers on front of throat : these should stay relaxed and quiet. If they bulge or harden, you\'re substituting superficial activation. Reduce effort. Progress to longer holds (20–30 seconds) only when current duration is clean. Stage 3: practise the chin tuck position during upright daily activity.',
    },
  ],

  videoId: null,
  commonMistakes: null,
  contraindications: null,

  profileModifiers: [
    {
      triggerFlag: 'cerv_forward_head_posture',
      triggerValue: true,
      title: 'Forward Head Posture Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your assessment identified forward head posture as a confirmed finding. Deep cervical flexor inhibition is the primary muscular mechanism ; the deep stabilisers have progressively reduced their activity and the superficial muscles have compensated. For your pattern, this is the single most important retraining exercise in the protocol. The release work addresses the tension that has built up in the superficial muscles. This exercise addresses the underlying reason that tension keeps rebuilding. : significant inhibition of the deep flexors is normal and expected, and is itself confirmation that this exercise is targeting the right pattern.',
        },
      ],
    },
  ],

  shorter_session_eligible: true,
  rotation_slot: null,
  timer: null,
}

export default e13DeepCervicalFlexorTraining
