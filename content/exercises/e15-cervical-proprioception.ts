// /content/exercises/e15-cervical-proprioception.ts
// E.15 — Cervical Proprioception Retraining
// Verbatim member-facing copy from Document 8 Part E, section E.15.
//
// Pairs with E.14 — both share the cerv_rotation_restriction
// profile modifier trigger but apply the asymmetric finding
// differently: E.14 emphasises restricted-first ordering and an
// additional repetition; E.15 emphasises proprioceptive error
// correlation with the restriction.
//
// ProfileModifier triggers on cerv_rotation_restriction (boolean)
// and renders side from cerv_restricted_side. Literal [left / right]
// placeholder retained per Decision 2.

import type { Exercise } from './_types'

const e15CervicalProprioception: Exercise = {
  kind: 'exercise',
  id: 'E15_cervical_proprioception',
  sectionRef: 'E.15',
  name: 'Cervical Proprioception Retraining',
  category: 'resistance-training',
  estimatedMinutes: 3,
  focusLine: 'Recalibrate the position sense that chronic tension has disrupted',

  fullContent: [
    {
      type: 'p',
      text: 'Proprioception is the body\'s position sense — the system that tells your brain where your head and neck are in space without you having to look. In the cervical spine this system is extraordinarily precise, and for good reason: accurate head position information is fundamental to balance, gaze stability, and coordination of the entire upper body.',
    },
    {
      type: 'p',
      text: 'The cervical joints contain a dense concentration of proprioceptive receptors — sensors that continuously report joint position, movement speed, and load to the brainstem. In people with chronic cervical dysfunction, these receptors become less accurate. The joints have been held in abnormal positions for so long, and the surrounding muscles have maintained such consistently elevated tone, that the position sense system has recalibrated around the dysfunction rather than around neutral. The brain has learned to treat an abnormal position as normal.',
    },
    {
      type: 'p',
      text: 'This matters for tinnitus for a specific reason. The same brainstem regions that process cervical proprioceptive input sit adjacent to the auditory processing centres where DCN hypersensitivity produces tinnitus. Inaccurate proprioceptive signalling from the upper cervical joints contributes directly to the abnormal input environment that maintains DCN sensitisation. Recalibrating the position sense system addresses one of the specific input streams feeding the problem.',
    },
    {
      type: 'p',
      text: 'Proprioception retraining works by repeatedly challenging the system to find a precise target position accurately — training the receptors and the neural pathways that process their output to produce more accurate signals. The improvements are measurable, progressive, and durable with consistent practice.',
    },
    {
      type: 'subhead',
      text: 'Method — Laser Pointer or Fixed Mark',
    },
    {
      type: 'p',
      text: 'This exercise requires a reference point on a wall and a way to track the position of your head accurately. Two options: a small laser pointer attached to a headband or held lightly against the forehead works well — the laser dot on the wall gives precise visual feedback of head position. Alternatively, sit facing a fixed mark on the wall at eye level and use the mark as your reference target without a laser.',
    },
    {
      type: 'subhead',
      text: 'The Exercise',
    },
    {
      type: 'p',
      text: 'Sit upright in a chair approximately one metre from a wall. Place a small target on the wall at eye level directly in front of you — a piece of tape or a drawn cross works well.',
    },
    {
      type: 'p',
      text: 'Close your eyes. Rotate your head slowly to one side to approximately halfway through your comfortable range. Hold briefly. Then slowly return your head to what feels like the exact starting position — the position where you were looking directly at the target. Open your eyes.',
    },
    {
      type: 'p',
      text: 'Assess the accuracy of your return. If using a laser, note where the dot has landed relative to the target. If using a fixed mark, note whether your gaze has returned to the exact target position or has drifted to one side. The gap between where you think you returned to and where you actually returned to is your proprioceptive error. The goal of repeated practice is to reduce that error — training the system to return more accurately to neutral after rotation.',
    },
    {
      type: 'p',
      text: 'Ten repetitions to each side per session. Note which direction produces more error, whether accuracy improves across the set, and how accuracy changes across sessions over time.',
    },
    {
      type: 'subhead',
      text: 'Progression',
    },
    {
      type: 'p',
      text: 'As accuracy at half range improves, progress to returning from full comfortable end range rotation. As overall accuracy improves, add a brief nodding movement before the return — introducing a second plane of movement that the system must account for before repositioning. These progressions increase the challenge to the proprioceptive system and continue driving adaptation.',
    },
    {
      type: 'emphasis',
      text: 'Watch the demonstration video before your first attempt. The setup and the method of assessing return accuracy are both best confirmed visually.',
    },
  ],

  condensedSummary: [
    {
      type: 'p',
      text: 'Sit one metre from a wall with a target at eye level. Close eyes, rotate head halfway through comfortable range, then slowly return to what feels like the exact starting position. Open eyes, assess error — distance from target. Goal is to reduce error across reps and sessions. Ten reps per side. Progress to full comfortable end range, then add a nodding movement before the return.',
    },
  ],

  videoId: null,
  commonMistakes: null,
  contraindications: null,

  profileModifiers: [
    {
      triggerFlag: 'cerv_rotation_restriction',
      triggerValue: true,
      title: 'Rotation Restriction Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your assessment identified restricted rotation on your [left / right] side. Asymmetric rotation restriction is consistently associated with greater proprioceptive error on the restricted side — the joints that move least accurately tend to report their position least accurately. Begin each set rotating toward your restricted side. Track error direction carefully — consistent drift toward or away from your restricted side on return is the specific pattern this exercise is correcting for your profile.',
        },
      ],
    },
  ],

  shorter_session_eligible: true,
  rotation_slot: null,
  timer: null,
}

export default e15CervicalProprioception
