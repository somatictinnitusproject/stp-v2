// /content/framework/phase-5/g5-maintenance-protocol.ts
// G.5 — Maintenance Protocol
// Verbatim member-facing copy from Document 8 Part G, section G.5.
// Daily focus: "Maintenance is not treatment; it is the habit that makes
// treatment permanent"
//
// Profile-variant block (block 6) dispatches to three family buckets:
// TMJ_DOMINANT (3 blocks: subhead + p + list), CERV_DOMINANT (2 blocks:
// subhead + list), DUAL_DRIVER (4 blocks: subhead + p + p + p).
// Silent omission for members with no/empty profile_type.
//
// acknowledgeLabel: 'Complete'. No acknowledgeRequires, no noAcknowledge,
// no profileModifiers.

import type { Phase5ReadingSection } from './types'

const g5: Phase5ReadingSection = {
  kind: 'reading',
  id: 'G5_phase5_maintenance_protocol',
  section: 'G.5',
  title: 'Maintenance Protocol',
  estimatedMinutes: 8,
  acknowledgeLabel: 'Complete',
  content: [
    {
      type: 'p',
      text: 'Stopping all protocol work entirely once improvement has been achieved risks gradual regression. The tension patterns that produced the original dysfunction were years in the making; they have a natural tendency to rebuild slowly when left unaddressed. The maintenance protocol is the minimum effective dose that keeps the system stable without requiring the daily commitment of the active protocol phase.',
    },
    {
      type: 'p',
      text: 'The goal of maintenance is habit rather than treatment. The elements below should feel like background practice: light, specific, and sustainable indefinitely, rather than an ongoing therapeutic programme requiring conscious daily effort. The transition from active protocol to maintenance is gradual. Members who try to switch abruptly from full daily sessions to nothing typically experience slow regression. Members who reduce gradually to the maintenance level while monitoring their physical indicators find the transition stable.',
    },
    {
      type: 'subhead',
      text: 'How Much, How Often',
    },
    {
      type: 'p',
      text: 'Fifteen to twenty minutes, three to four times per week. This is not a fixed prescription; it is the level at which most members find the maintenance sustainable indefinitely without regression. Some members maintain well on less. Others find they need closer to the full protocol frequency, particularly in high-stress periods. Progress tracker data from the active protocol period is the most reliable guide: the frequency at which you maintained stable scores without regression during the protocol is the right starting point for maintenance frequency.',
    },
    {
      type: 'p',
      text: 'A full protocol reset week every four to six weeks is worth building in as a standard practice: a week of returning to the complete active protocol, particularly following high-stress periods, illness, significant sleep disruption, or any period where the early warning signs described in G.6 have appeared.',
    },
    {
      type: 'profile_variant',
      variants: {
        TMJ_DOMINANT: [
          {
            type: 'subhead',
            text: 'Maintenance Protocol: Jaw-Dominant',
          },
          {
            type: 'p',
            text: 'The elements that produced the most significant change in your jaw protocol are the ones to retain. For most jaw-dominant members the core maintenance set is:',
          },
          {
            type: 'list',
            items: [
              'Masseter release: two to three minutes per side, two to three times per week. Pressure level maintained at the therapeutic level established during the active protocol, not reduced to the point of being comfortable rather than effective.',
              'Resting position habit reinforcement: the teeth-apart tongue-on-palate resting position should be automatic by Phase 5. Maintenance means periodic checking rather than constant monitoring: a brief deliberate check at consistent trigger points during the day. Desk work transitions, driving, and screen use are the contexts where drift back to teeth-together resting position is most likely.',
              'Periodic jaw symmetry check: the same mirror-based jaw drift assessment from Phase 1, performed monthly. Increasing drift or returning asymmetry is an early warning sign warranting a return to more frequent release work before the pattern re-establishes fully.',
              'Breath work: the parasympathetic activation practice from F.6 maintained at a minimum of three to four sessions per week. Nervous system tone directly affects jaw muscle tension; breath work maintenance is jaw maintenance.',
            ],
          },
        ],
        CERV_DOMINANT: [
          {
            type: 'subhead',
            text: 'Maintenance Protocol: Cervical-Dominant',
          },
          {
            type: 'list',
            items: [
              'Suboccipital release: ten minutes, two to three times per week. The single most impactful cervical release technique for most members and the one most worth retaining at full duration and correct technique. Reducing duration below ten minutes significantly reduces the release stimulus.',
              'Deep cervical flexor maintenance: the chin tuck activation exercise from E.13, performed in the upright carryover context during daily activity rather than as a dedicated lying session. The deep cervical flexors require ongoing activation to maintain their postural role; allowing them to become inhibited again is what allows the superficial muscles to reassume their overactive compensatory pattern.',
              'Periodic posture check: shoulder height, forward head position, and workstation setup reviewed monthly. Gradual postural drift is normal and expected; the periodic check catches it before it reaches the level of active maintaining factor.',
              'Breath work: maintained at a minimum of three to four sessions per week. Sympathetic tone directly feeds cervical muscle tension through the same pathway it feeds jaw tension. Breath work maintenance supports cervical maintenance.',
            ],
          },
        ],
        DUAL_DRIVER: [
          {
            type: 'subhead',
            text: 'Maintenance Protocol: Dual Driver',
          },
          {
            type: 'p',
            text: 'The combined maintenance set draws from both protocols. The principle is the same: retain the elements that produced the most significant personal change and perform them at the minimum frequency that maintains stability.',
          },
          {
            type: 'p',
            text: 'Core combined set: masseter release, suboccipital release, resting position habit reinforcement, deep cervical flexor upright carryover, periodic jaw symmetry check, periodic posture check, and breath work. Combined session duration at the maintenance level should be achievable within twenty minutes for most dual driver members; the maintenance versions of these techniques are lighter than their active protocol equivalents.',
          },
          {
            type: 'p',
            text: 'The full protocol reset week every four to six weeks applies to both protocols simultaneously for dual driver members, not alternating between them.',
          },
        ],
      },
    },
    {
      type: 'subhead',
      text: 'Using Your Tracker Data',
    },
    {
      type: 'p',
      text: 'Progress tracker data from the active protocol period is the most valuable tool for personalising maintenance. The inputs that most reliably correlated with loudness reduction during the protocol (the days where jaw tension or neck tension scores dropped and loudness followed) identify the elements most worth retaining. Members whose loudness tracked jaw tension most closely prioritise jaw maintenance. Members whose loudness tracked neck tension most closely prioritise cervical maintenance. The data tells you which lever matters most for your specific pattern.',
    },
    {
      type: 'acknowledge_prompt',
      text: 'Done',
    },
  ],
}

export default g5
