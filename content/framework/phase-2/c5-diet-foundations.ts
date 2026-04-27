// C.5 — Diet Foundations
// Source: Document 8 Part C section C.5. Verbatim member-facing prose.
//
// No personalisation: Doc 8 has no system note for C.5. Content is
// universal across all member profiles.

// ── Content types ────────────────────────────────────────────────────────────

// Paragraph entry — body prose or bold sub-heading.
export type C5Paragraph =
  | { kind: 'p'; text: string }
  | { kind: 'subhead'; text: string }

export type C5DietFoundations = {
  sectionLabel: string
  sectionTitle: string
  introductionTitle: string
  paragraphs: C5Paragraph[]
  mechanismNote: string
  sectionAcknowledgeLabel: string
}

// ── Content constant ──────────────────────────────────────────────────────────

export const C5_DIET_FOUNDATIONS: C5DietFoundations = {
  sectionLabel: 'Phase 2 \u2014 Lifestyle Foundations',
  sectionTitle: 'Diet Foundations',
  introductionTitle: 'Eating to Support Recovery',
  sectionAcknowledgeLabel:
    'I understand these principles and will integrate what is practical for me',
  paragraphs: [
    { kind: 'p', text:
      'The honest position on diet and tinnitus is this: there is no ' +
      'specific dietary intervention with strong evidence for directly ' +
      'reducing tinnitus. Anyone claiming otherwise is overclaiming. ' +
      'What the evidence does support \u2014 and what is mechanistically ' +
      'plausible given what you now know about DCN hypersensitivity ' +
      '\u2014 is that reducing systemic inflammatory load creates a ' +
      'better neurological environment for the protocol work to ' +
      'operate in. Chronic systemic inflammation maintains the kind ' +
      'of central sensitisation that keeps the DCN hypersensitive. ' +
      'Diet is not the primary intervention here. It is a supporting ' +
      'condition.' },
    { kind: 'p', text:
      'The principles below are practical and non-prescriptive. They ' +
      'are not a meal plan and they are not a list of foods to ' +
      'eliminate. They are adjustments worth integrating at whatever ' +
      'pace is realistic \u2014 the goal is a general shift in dietary ' +
      'pattern rather than a dramatic overhaul.' },
    { kind: 'subhead', text: 'Omega-3 fatty acids' },
    { kind: 'p', text:
      'Omega-3 fatty acids have a well-established anti-inflammatory ' +
      'role and are among the most consistently supported dietary ' +
      'factors for reducing systemic inflammation. Practical food ' +
      'sources: oily fish \u2014 salmon, mackerel, sardines, anchovies ' +
      '\u2014 two to three portions weekly, walnuts, flaxseed, and ' +
      'chia seeds. For members who do not regularly eat oily fish, ' +
      'dietary intake alone is often insufficient to reach meaningful ' +
      'levels and supplementation is worth considering. Omega-3 ' +
      'supplementation is covered in the next section.' },
    { kind: 'subhead', text: 'Reducing ultra-processed food and refined sugar' },
    { kind: 'p', text:
      'Ultra-processed foods and refined sugar are the dietary ' +
      'factors most consistently associated with elevated systemic ' +
      'inflammatory markers. The mechanism is not specific to ' +
      'tinnitus \u2014 it is general systemic inflammation that ' +
      'maintains the neurological environment in which central ' +
      'sensitisation persists. The practical adjustment is reduction ' +
      'rather than elimination: fewer processed snacks, fewer sugary ' +
      'drinks, less refined carbohydrate as a staple. Small consistent ' +
      'reductions in daily ultra-processed food intake produce ' +
      'measurable reductions in inflammatory markers over weeks to ' +
      'months.' },
    { kind: 'subhead', text: 'Hydration' },
    { kind: 'p', text:
      'Adequate hydration is relevant to joint health generally and ' +
      'to TMJ disc integrity specifically. The TMJ disc is an ' +
      'avascular fibrocartilaginous structure \u2014 it receives ' +
      'nutrition and maintains its mechanical properties partly ' +
      'through adequate systemic hydration. Chronic mild dehydration ' +
      'contributes to reduced disc resilience over time. The ' +
      'practical indicator is urine colour \u2014 pale yellow ' +
      'throughout the day indicates adequate hydration. Dark yellow ' +
      'or amber indicates insufficient intake. A large glass of water ' +
      'first thing in the morning and consistent intake through the ' +
      'day is sufficient for most people without needing to count ' +
      'litres.' },
    { kind: 'subhead', text: 'Magnesium-rich foods' },
    { kind: 'p', text:
      'Magnesium is involved in muscle relaxation, neuromuscular ' +
      'function, and has a neuroprotective role relevant to auditory ' +
      'nerve function. Deficiency is common \u2014 estimates suggest ' +
      'a significant proportion of the population does not meet ' +
      'recommended intake through diet alone. Food sources: leafy ' +
      'green vegetables, nuts \u2014 particularly almonds and ' +
      'cashews \u2014 seeds, legumes, and dark chocolate. Integrating ' +
      'these regularly is a practical starting point. For members ' +
      'whose dietary intake is consistently low in these food groups, ' +
      'supplementation is worth considering. Magnesium supplementation ' +
      'is covered in the next section.' },
    { kind: 'subhead', text: 'Anti-inflammatory foods' },
    { kind: 'p', text:
      'Beyond omega-3 sources, a range of foods have meaningful ' +
      'anti-inflammatory properties worth integrating practically ' +
      'rather than treating as a supplement protocol. Berries ' +
      '\u2014 particularly blueberries and cherries \u2014 contain ' +
      'anthocyanins with anti-inflammatory activity. Turmeric ' +
      'contains curcumin, one of the more studied natural ' +
      'anti-inflammatory compounds \u2014 most effectively absorbed ' +
      'with black pepper and a fat source. Ginger has both ' +
      'anti-inflammatory and mild analgesic properties. Olive oil ' +
      '\u2014 particularly extra virgin \u2014 is a core component ' +
      'of the Mediterranean dietary pattern consistently associated ' +
      'with reduced systemic inflammatory markers. These are ' +
      'ingredients to use regularly rather than consume ' +
      'therapeutically.' },
  ],
  mechanismNote:
    'Chronic systemic inflammation maintains central sensitisation ' +
    '\u2014 the state of heightened neural responsiveness in which ' +
    'DCN hypersensitivity persists. The primary intervention for ' +
    'somatic tinnitus is reducing the abnormal peripheral input ' +
    'driving DCN activity through the Phase 3 protocol. Reducing ' +
    'systemic inflammatory load through dietary pattern does not ' +
    'replace that intervention \u2014 it supports the neurological ' +
    'environment in which it operates. A less inflamed system is a ' +
    'more responsive one.',
}
