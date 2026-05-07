// /content/framework/phase-4/f7-hypervigilance-interruption.ts
// F.7 — Hypervigilance Interruption
// Verbatim member-facing copy from Document 8 Part F, section F.7.
// Daily focus: "Attention is not neutral — where it goes
// determines what it amplifies"
//
// Two profile modifiers (both single-flag strict equality):
//   - Hypervigilance Pattern Confirmed (ns_hypervigilance=true)
//   - No Hypervigilance Flag Confirmed (ns_hypervigilance=false)
//
// Note: the "no hypervigilance" modifier uses strict === false.
// null does not qualify — column must be explicitly recorded false.
//
// Practical section — acknowledgeLabel = 'Done'.

import type { ReadingSection } from './types'

const f7: ReadingSection = {
  kind: 'reading',
  id: 'F7_hypervigilance_interruption',
  section: 'F.7',
  title: 'Hypervigilance Interruption',
  estimatedMinutes: 6,
  acknowledgeLabel: 'Done',
  content: [
    {
      type: 'subhead',
      text: 'Hypervigilance and Tinnitus',
    },
    {
      type: 'p',
      text: 'Hypervigilance is the nervous system’s threat-monitoring mode. It evolved to keep attention locked onto signals that might indicate danger: scanning continuously, treating the signal as important, allocating processing resources to it automatically. It is an entirely normal and functional response when the threat is real and actionable.',
    },
    {
      type: 'p',
      text: 'Applied to tinnitus, it becomes a problem. The tinnitus sound triggers the threat-monitoring response. Attention locks onto it. The auditory cortex is directed to process it with heightened sensitivity. Perceived loudness increases, not because the physical signal has changed, but because the brain is now attending to it as a priority input. The increased perceived loudness confirms to the nervous system that the threat is real and warrants continued monitoring. The loop tightens.',
    },
    {
      type: 'p',
      text: 'Understanding this mechanism clearly is itself the first intervention. Perceived loudness is partly an attentional phenomenon. The tinnitus sound has not changed; what has changed is the level of attentional resource being directed at it. This does not make the tinnitus less real. It means that reducing the attentional response is a legitimate and direct way to reduce the perceived loudness, independent of any change in the underlying physical signal.',
    },
    {
      type: 'subhead',
      text: 'The Goal',
    },
    {
      type: 'p',
      text: 'The goal of hypervigilance interruption is not suppression: trying not to hear the tinnitus, pretending it is not there, or forcing attention away from it. Suppression requires sustained effort and consistently fails. It also keeps the tinnitus in the centre of attention as the thing being suppressed.',
    },
    {
      type: 'p',
      text: 'The goal is redirection: moving attentional resources away from the tinnitus sound and toward something that genuinely occupies the same processing bandwidth. Attention cannot fully occupy two demanding inputs simultaneously. When it is genuinely engaged elsewhere, the tinnitus monitoring loop cannot run at full intensity.',
    },
    {
      type: 'subhead',
      text: 'Techniques',
    },
    {
      type: 'p',
      text: 'The following are specific redirection techniques rather than generic distraction. Each works by genuinely occupying attentional bandwidth rather than simply providing background noise.',
    },
    {
      type: 'subhead',
      text: 'Technique 1: Attentional Anchoring',
    },
    {
      type: 'p',
      text: 'Choose a specific sensory input in your immediate environment and direct deliberate focused attention to it. Not passive awareness, but active, detailed attention. The texture of a surface under your fingers. The specific sounds in the room other than the tinnitus. The physical sensation of your feet on the floor.',
    },
    {
      type: 'p',
      text: 'The specificity is what makes this work. “Notice the sounds in the room” is too vague to fully occupy attention. “Identify and count every distinct sound you can hear other than the tinnitus: traffic, air movement, voices, the building settling” is specific enough to genuinely redirect the auditory processing resources that hypervigilance has been directing at the tinnitus.',
    },
    {
      type: 'p',
      text: 'Apply this at the moment you notice the monitoring loop beginning, not after it has been running for several minutes. Early interruption is significantly more effective than attempting to break an established loop.',
    },
    {
      type: 'subhead',
      text: 'Technique 2: Cognitive Engagement',
    },
    {
      type: 'p',
      text: 'Tasks that require genuine cognitive effort occupy the same central processing resources that hypervigilance uses. Mental arithmetic, recalling a familiar piece of music in detail, planning something specific; any task that requires active construction rather than passive reception.',
    },
    {
      type: 'p',
      text: 'The threshold for this to work is genuine engagement. A task that is too easy runs in the background while hypervigilance continues alongside it. The task needs to be demanding enough that it actually competes for the same attentional resources.',
    },
    {
      type: 'p',
      text: 'This technique is particularly useful during the specific contexts where hypervigilance peaks: lying in bed before sleep, sitting in a quiet room, low-stimulation periods during the day. Having a specific go-to cognitive task ready for these moments produces better outcomes than attempting to find one when the loop is already running.',
    },
    {
      type: 'subhead',
      text: 'Technique 3: Sensory Grounding',
    },
    {
      type: 'p',
      text: 'A rapid full-body sensory inventory that shifts the nervous system’s attentional focus from internal monitoring to external awareness. Work through five senses in sequence: identify five things you can see, four things you can physically feel, three things you can hear other than the tinnitus, two things you can smell, one thing you can taste.',
    },
    {
      type: 'p',
      text: 'This works through two mechanisms simultaneously: the sequential task structure occupies cognitive bandwidth, and the deliberate external sensory focus directly competes with the internal monitoring loop. It is also fast enough to apply in any context without preparation or equipment.',
    },
    {
      type: 'subhead',
      text: 'Building the Habit',
    },
    {
      type: 'p',
      text: 'These techniques work best when applied consistently at the earliest sign of the monitoring loop rather than as a last resort after the loop has been running unchecked. The signal to apply them is the moment you notice yourself checking tinnitus loudness; the act of checking is itself the beginning of the hypervigilance loop.',
    },
    {
      type: 'p',
      text: 'Over time, consistent early interruption gradually reduces the automaticity of the loop. The nervous system learns, through repeated experience, that the tinnitus signal does not require threat-level monitoring, not because it has been told this, but because the loop consistently fails to complete. This is the same habituation mechanism that makes previously noticeable background sounds invisible over time. It is slow and nonlinear, but it is real and it compounds.',
    },
  ],
  profileModifiers: [
    {
      triggerFlag: 'ns_hypervigilance',
      triggerValue: true,
      title: 'Hypervigilance Pattern Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your Phase 1 assessment identified an active hypervigilance pattern: habitual monitoring of tinnitus loudness and difficulty not attending to it. For your profile, this section is one of the highest-leverage interventions available. The physical protocol work reduces the signal. Consistent hypervigilance interruption reduces the attentional amplification of whatever signal remains. Both are necessary for your pattern; neither alone is sufficient.',
        },
      ],
    },
    {
      triggerFlag: 'ns_hypervigilance',
      triggerValue: false,
      title: 'No Hypervigilance Flag Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your Phase 1 assessment did not identify a significant hypervigilance pattern. The techniques above are available if you notice the attentional monitoring loop arising at any point; they are not a priority for your profile at this stage.',
        },
      ],
    },
  ],
}

export default f7
