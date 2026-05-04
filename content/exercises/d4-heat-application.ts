// /content/exercises/d4-heat-application.ts
// D.4 — Heat Application
// Unified preparation step covering both jaw and cervical regions.
// Authored from Document 8 Part D §D.4 (jaw heat copy) and Document
// 8 Part E §E.5 "Before you begin" warmth preamble (cervical heat
// guidance). M13s.0a authoring decision: single unified copy rather
// than profile-conditional modifiers — most members run both
// protocols (DUAL_DRIVER + 4 PRIMARY/SECONDARY profile types), so
// the modifier overhead is not warranted.
//
// Session list ordering (D.4 at top of /session for all release-phase
// members regardless of protocol assignment) is implemented in
// M13s.0b. In M13s.0a D.4 still lives in buildTmjReleaseList.
//
// Closing emphasis block addresses the minority of members on
// single-region protocols (TMJ_DOMINANT or CERV_DOMINANT) — gives
// them explicit guidance to focus heat on the region their protocol
// is targeting that day.

import type { Exercise } from './_types'

const d4HeatApplication: Exercise = {
  kind: 'exercise',
  id: 'D4_heat_application',
  sectionRef: 'D.4',
  name: 'Heat Application',
  category: 'jaw-release',
  bodyRegion: 'general',
  libraryDurationLabel: '10 minutes',
  estimatedMinutes: 10,
  focusLine: 'Prepare the tissue before you work it',

  fullContent: [
    {
      type: 'p',
      text: 'Heat is optional preparation, not a required exercise. If you have access to a heat source and a few extra minutes, applying warmth before the release work improves tissue response. If you do not, the release exercises that follow still produce most of their benefit. Skip without concern when convenient.',
    },
    {
      type: 'p',
      text: 'Apply moist heat over the masseter and TMJ area, the posterior neck, and the base of the skull for ten minutes before beginning any manual release work. A warm damp towel or heat pack held over the relevant region works well — for the jaw, from just in front of the ear down to the lower jaw; for the cervical region, across the back of the neck and the base of the skull.',
    },
    {
      type: 'p',
      text: 'The heat should be warm and comfortable, not hot. You are not trying to produce discomfort — you are preparing the tissue for the work that follows.',
    },
    {
      type: 'subhead',
      text: 'Why This Matters',
    },
    {
      type: 'p',
      text: 'Muscle tissue at resting temperature has higher resistance to sustained pressure — it takes longer to respond and requires more force to produce the same effect. Ten minutes of moist heat increases local tissue extensibility, reduces resting muscle tone, and decreases the guarding response that tightened tissue produces when compressed. The release work that follows produces a meaningfully better result when the tissue has been prepared this way.',
    },
    {
      type: 'emphasis',
      text: 'Heat materially improves tissue response when used. On days when adding ten minutes is realistic, do it — the release work that follows lands better. On days when it is not, the release work alone still produces most of its benefit. Use what fits the day rather than skipping the session entirely.',
    },
    {
      type: 'subhead',
      text: 'What to Use',
    },
    {
      type: 'p',
      text: 'A warm damp towel wrung out and held in place works well. A reusable heat pack microwaved to a comfortable temperature is a straightforward alternative. Either is fine. Moist heat penetrates tissue more effectively than dry heat at the same surface temperature — a damp towel or moist heat pack is preferable to a dry heat pad where possible.',
    },
    {
      type: 'emphasis',
      text: 'If your protocol targets only the jaw or only the cervical region, focus heat application on the relevant region — no need to warm tissue you are not working that day.',
    },
  ],

  condensedSummary: [
    {
      type: 'p',
      text: 'Apply moist heat over the jaw, the posterior neck, and the base of the skull for ten minutes before beginning any manual release work. Warm and comfortable, not hot. If your protocol targets only one region, focus the heat there.',
    },
  ],

  videoId: null,
  commonMistakes: null,
  contraindications: null,
  profileModifiers: [],
  shorter_session_eligible: true,
  rotation_slot: null,
  timer: null,
  optional: true,
}

export default d4HeatApplication
