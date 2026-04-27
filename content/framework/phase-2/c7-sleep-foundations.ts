// C.7 — Sleep Foundations
// Source: Document 8 Part C section C.7. Verbatim member-facing prose.
//
// No personalisation: Doc 8 has no system note for C.7.
//
// Note: cervical alignment subhead references back to C.3 sleep position
// entry. The cross-reference is preserved verbatim — content remains
// self-contained and does not require active linking.

export type C7Paragraph =
  | { kind: 'p'; text: string }
  | { kind: 'subhead'; text: string }

export type C7SleepFoundations = {
  sectionLabel: string
  sectionTitle: string
  introductionTitle: string
  paragraphs: C7Paragraph[]
  mechanismNote: string
  sectionAcknowledgeLabel: string
}

export const C7_SLEEP_FOUNDATIONS: C7SleepFoundations = {
  sectionLabel: 'Phase 2 \u2014 Lifestyle Foundations',
  sectionTitle: 'Sleep Foundations',
  introductionTitle: 'Sleep as a Maintaining Factor',
  sectionAcknowledgeLabel:
    'I understand these foundations and will address what is relevant for me',
  paragraphs: [
    { kind: 'p', text:
      'Sleep is where the body recovers \u2014 but for members with ' +
      'somatic tinnitus, poor sleep habits can actively maintain the ' +
      'tension and sympathetic tone that the protocol is working to ' +
      'reduce. This section covers the mechanical and practical ' +
      'foundations. The deeper relationship between tinnitus, ' +
      'hypervigilance, and sleep \u2014 and the psychological tools ' +
      'for managing it \u2014 is addressed in Phase 4.' },
    { kind: 'subhead', text: 'Cervical alignment' },
    { kind: 'p', text:
      'Sleep position and pillow height were covered in detail in ' +
      'the cervical and postural habits section. The key points in ' +
      'brief: stomach sleeping is strongly discouraged for ' +
      'cervical-involved members \u2014 sustained cervical rotation ' +
      'through the night directly counteracts the protocol work. ' +
      'Side sleeping requires a pillow height that maintains neutral ' +
      'cervical alignment \u2014 ear directly above the shoulder. ' +
      'Back sleeping requires lower support. If you have not yet ' +
      'worked through the sleep position entry in the habits ' +
      'section, return to it before continuing.' },
    { kind: 'subhead', text: 'Sleep environment and masking' },
    { kind: 'p', text:
      'For members whose tinnitus is most intrusive at night ' +
      '\u2014 particularly during the quiet of sleep onset \u2014 ' +
      'environmental sound can be a practical tool for reducing the ' +
      'contrast between silence and tinnitus perception. This is not ' +
      'a coping strategy or a long-term management approach. It is ' +
      'a practical sleep onset aid for members who need it, used ' +
      'strategically rather than as a permanent fixture.' },
    { kind: 'p', text:
      'Effective options include: brown or white noise \u2014 widely ' +
      'available through free apps and streaming platforms \u2014 ' +
      'pink noise, which has a softer frequency profile that some ' +
      'people find more tolerable for extended listening, nature ' +
      'sounds such as rain or running water, and fan noise. ' +
      'Experiment with a few to find what works for your specific ' +
      'tinnitus frequency and personal preference. The goal is a ' +
      'background sound level sufficient to reduce the perceptual ' +
      'contrast without being loud enough to disrupt sleep quality ' +
      'itself.' },
    { kind: 'p', text:
      'Volume matters \u2014 masking sound should sit below ' +
      'conversational volume. Loud masking sound trades one sleep ' +
      'disruption for another.' },
    { kind: 'subhead', text: 'Sleep consistency' },
    { kind: 'p', text:
      'Irregular sleep and wake times elevate baseline sympathetic ' +
      'tone \u2014 the background nervous system activation that ' +
      'amplifies tinnitus perception on top of whatever the primary ' +
      'driver is producing. The mechanism is straightforward: the ' +
      'body\u2019s circadian regulation affects cortisol and ' +
      'autonomic nervous system patterns throughout the day. ' +
      'Irregular timing disrupts those patterns and keeps the ' +
      'system in a state of mild chronic activation.' },
    { kind: 'p', text:
      'The adjustment is simple in principle: consistent sleep and ' +
      'wake times seven days a week, including weekends. Weekend ' +
      'sleep-ins feel restorative but disrupt circadian timing ' +
      'enough to affect the following week\u2019s baseline ' +
      'sympathetic tone. Consistency matters more than total hours ' +
      'within a reasonable range.' },
  ],
  mechanismNote:
    'Cervical misalignment during sleep rebuilds suboccipital and ' +
    'upper cervical tension through the night \u2014 directly ' +
    'counteracting the Phase 3 protocol. Environmental sound reduces ' +
    'the perceptual contrast that drives hypervigilant attention to ' +
    'tinnitus at sleep onset, breaking the attention-amplification ' +
    'cycle before it establishes. Sleep timing consistency maintains ' +
    'circadian regulation of the autonomic nervous system, reducing ' +
    'the baseline sympathetic tone that amplifies tinnitus perception ' +
    'above the primary driver signal.',
}
