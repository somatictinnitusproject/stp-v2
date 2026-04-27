// C.6 — Supplements
// Source: Document 8 Part C section C.6. Verbatim member-facing prose.
//
// No personalisation: Doc 8 has no system note for C.6.
//
// C.6 has an evidence-quality disclaimer box at the top of the body
// content. The shared Session5To7ReadMostlyClient renders this as a
// distinct callout above the introduction paragraphs.

export type C6Paragraph =
  | { kind: 'p'; text: string }
  | { kind: 'subhead'; text: string }

export type C6Supplements = {
  sectionLabel: string
  sectionTitle: string
  introductionTitle: string
  evidenceDisclaimer: string  // unique to C.6 — rendered as callout box
  paragraphs: C6Paragraph[]
  mechanismNote: string
  sectionAcknowledgeLabel: string
}

export const C6_SUPPLEMENTS: C6Supplements = {
  sectionLabel: 'Phase 2 \u2014 Lifestyle Foundations',
  sectionTitle: 'Supplements',
  introductionTitle: 'Supporting the Protocol',
  evidenceDisclaimer:
    'Evidence quality across all supplements in this section: ' +
    'Moderate \u2014 plausible mechanistic rationale with some ' +
    'general evidence support, limited tinnitus-specific evidence. ' +
    'These supplements are presented as potentially useful supporting ' +
    'factors alongside the primary protocol work. They are not ' +
    'treatments for tinnitus. Follow standard labelling for dosage ' +
    'guidance \u2014 if you are on medication or have an existing ' +
    'health condition, check with your pharmacist or GP before ' +
    'starting any new supplement.',
  sectionAcknowledgeLabel:
    'I understand the evidence context and will consider what is relevant for me',
  paragraphs: [
    { kind: 'p', text:
      'Three supplements have a sufficiently plausible mechanistic ' +
      'rationale to be worth considering alongside the Phase 3 ' +
      'protocol work. They are included because the rationale is ' +
      'honest, the risk profile is low, and correcting deficiency ' +
      '\u2014 which is common across all three \u2014 is potentially ' +
      'meaningful. They are not included because there is strong ' +
      'direct evidence that supplementing them reduces tinnitus. ' +
      'That evidence does not currently exist at a level that ' +
      'justifies that claim.' },
    { kind: 'subhead', text: 'Magnesium' },
    { kind: 'p', text:
      'Magnesium is involved in muscle relaxation, neuromuscular ' +
      'function, and has a neuroprotective role relevant to auditory ' +
      'nerve health. The relevance to somatic tinnitus is primarily ' +
      'through the muscle tension angle \u2014 magnesium deficiency ' +
      'is associated with increased muscle hypertonicity, which ' +
      'directly feeds back into whichever primary driver pathway is ' +
      'active. Deficiency is common and often goes unidentified. ' +
      'Correcting it through supplementation is low risk and ' +
      'potentially meaningful for members whose dietary intake of ' +
      'magnesium-rich foods is consistently low.' },
    { kind: 'p', text:
      'Food sources were covered in the diet foundations section. ' +
      'For members who do not regularly eat leafy greens, nuts, ' +
      'seeds, and legumes, supplementation is a practical ' +
      'alternative. Magnesium glycinate and magnesium malate are ' +
      'generally better tolerated than magnesium oxide, which has ' +
      'lower bioavailability and is more likely to cause digestive ' +
      'discomfort at higher doses. Follow standard labelling for ' +
      'dosage.' },
    { kind: 'subhead', text: 'Omega-3' },
    { kind: 'p', text:
      'Omega-3 fatty acids have a well-established anti-inflammatory ' +
      'role and the strongest general evidence base of the three ' +
      'supplements in this section. The tinnitus-specific evidence ' +
      'is limited \u2014 but the systemic inflammation rationale is ' +
      'mechanistically sound and the general evidence for omega-3\u2019s ' +
      'anti-inflammatory effects is robust. For members who do not ' +
      'regularly eat oily fish, supplementation is a practical way ' +
      'to reach meaningful intake levels that diet alone is unlikely ' +
      'to provide.' },
    { kind: 'p', text:
      'Standard fish oil capsules are the most accessible form. ' +
      'Algae-based omega-3 is the plant-based equivalent and ' +
      'provides the same EPA and DHA forms. Flaxseed oil provides ' +
      'ALA which the body converts to EPA and DHA at lower ' +
      'efficiency \u2014 less effective than direct EPA/DHA sources ' +
      'but better than no omega-3 supplementation. Follow standard ' +
      'labelling for dosage.' },
    { kind: 'subhead', text: 'Vitamin D' },
    { kind: 'p', text:
      'Vitamin D deficiency is prevalent \u2014 particularly in ' +
      'northern latitudes with limited sunlight exposure for much ' +
      'of the year \u2014 and is associated with chronic pain ' +
      'conditions and TMJ dysfunction specifically. The direct ' +
      'evidence linking vitamin D deficiency to tinnitus is limited. ' +
      'The rationale for inclusion is correcting a common deficiency ' +
      'that has documented associations with the musculoskeletal ' +
      'conditions most relevant to somatic tinnitus, rather than ' +
      'treating tinnitus directly.' },
    { kind: 'p', text:
      'Worth checking your levels before assuming relevance \u2014 ' +
      'a simple blood test through your GP will confirm whether ' +
      'deficiency is a factor in your case. Supplementation is ' +
      'straightforward and low risk at standard doses. Vitamin D3 ' +
      'is the preferred form. Follow standard labelling for dosage ' +
      '\u2014 higher dose supplementation beyond standard levels ' +
      'should be discussed with a GP.' },
  ],
  mechanismNote:
    'Magnesium deficiency increases muscle hypertonicity and reduces ' +
    'neuromuscular relaxation capacity \u2014 directly relevant to ' +
    'the jaw and cervical tension driving the primary pathways. ' +
    'Omega-3 reduces systemic inflammatory load, supporting the ' +
    'neurological environment in which DCN hypersensitivity is ' +
    'maintained. Vitamin D deficiency is associated with ' +
    'musculoskeletal dysfunction in the structures most relevant ' +
    'to somatic tinnitus \u2014 correction addresses a potential ' +
    'contributing factor rather than the tinnitus directly.',
}
