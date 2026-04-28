# STP V2 Pre-Launch Changes

**Purpose:** Comprehensive list of changes agreed during the pre-launch evidence review. This document is the source of truth for what needs to be implemented before V2 launch. Hand to Claude Code in implementation phases.

**Status of changes:** All decisions in this document are confirmed by the founder. Implementation is the remaining work.

---

## 1. CONTENT FIXES (NO STRUCTURAL CHANGES)

### 1.1 Autogenic inhibition mechanism error

**Location:** Masseter release content (D.6) and any other release exercise content where autogenic inhibition is explained, including suboccipital release content.

**Change:** Replace all instances of "muscle spindle signalling" with "Golgi tendon organ feedback".

**Rationale:** Autogenic inhibition is mediated by Golgi tendon organs, not muscle spindles. Muscle spindles drive the stretch reflex (the opposite effect). This is a basic physiology error that any physiotherapist would spot.

### 1.2 Soften 90-second absoluteness

**Location:** Masseter release (D.6) and any other release exercise content using 90-second framing.

**Change:** Replace "Releasing at 60 seconds produces a different and lesser response" with "Sustained pressure for 90 seconds reliably produces tissue release — shorter durations can produce some effect but the response is less consistent."

**Rationale:** Literature supports 90 seconds as a reliable duration for tissue release, but there's no sharp neurological threshold at exactly 90 seconds. Current framing implies a binary switch that doesn't exist physiologically.

### 1.3 Caffeine guidance correction

**Location:** Phase 2 systemic habits audit (C.4).

**Change:** Replace "affects sympathetic tone and potentially cochlear blood flow. Worth moderating rather than eliminating for most people" with:

> Caffeine is commonly cited as a tinnitus trigger but the evidence does not support this. The largest controlled trial of caffeine cessation in tinnitus sufferers (St. Claire et al. 2010) found no effect on symptoms, and withdrawal symptoms during cessation made the experience of tinnitus more bothersome. There is no need to reduce caffeine intake for tinnitus reasons. If you have noticed your own tinnitus reliably worsens with caffeine intake — track this through the progress tracker and decide based on your own data, not on general advice.

**Rationale:** St. Claire et al. 2010 RCT and Claro et al. 2021 triple-blind RCT both showed no effect of caffeine cessation on tinnitus, with cessation actually producing withdrawal-related worsening. Glicksman et al. 2014 found higher caffeine intake associated with reduced tinnitus incidence. Current framing primes members to worry about something the evidence doesn't support.

### 1.4 Supplement evidence rating downgrade

**Location:** Phase 2 supplements section (C.6).

**Change:** Drop the evidence rating from "Moderate" to "Weak" for magnesium, omega-3, and vitamin D. Keep the existing prose unchanged — it already argues honestly for deficiency correction rather than direct tinnitus treatment.

**Rationale:** "Moderate" overclaims for tinnitus-specific evidence. Magnesium has one uncontrolled n=19 study (Cevette 2010). Omega-3 and vitamin D have essentially no tinnitus-specific evidence as standalone interventions. The existing prose makes the honest argument; the rating just needs to match.

### 1.5 Lateral pterygoid release honest framing

**Location:** Lateral pterygoid release exercise (D.8).

**Change:** After the existing technique instructions, add:

> A note on the evidence: lateral pterygoid release is a contested technique. The lateral pterygoid sits deep behind the zygomatic arch, and there is genuine anatomical debate about how reliably it can be accessed through external palpation alone. For some people the external technique reaches the right tissue; for others, the pressure may be working adjacent muscle (the deep masseter or temporalis tendon) rather than the lateral pterygoid specifically. Either way, the technique targets a tender region that often holds significant tension in TMJ-dominant cases, and many people report meaningful benefit. If you find this exercise produces a clear distinct response from the masseter release, keep it in your protocol. If it feels redundant with the masseter work for you, the masseter release on its own covers most of the same territory.

**Rationale:** Stratmann 2000 (n=106 dissected specimens, 7.8mm residual distance in 81% of cases) and Türp & Minagi 2001 systematic review both found the lateral pterygoid is anatomically inaccessible to external palpation. Honest framing protects credibility while preserving member agency.

### 1.6 TMJ distraction reframing

**Location:** TMJ distraction exercise (D.10).

**Change:** Reframe the exercise opening with:

> If you have access to a physiotherapist or dental specialist trained in manual therapy, this is something they can deliver more effectively than you can self-administer. The home version below is a gentler self-administered approximation that may produce some benefit but is not equivalent to clinician-delivered distraction.

Keep the rest of the exercise content intact.

**Rationale:** No published evidence for self-administered TMJ distraction in tinnitus. Clinical version has small support in TMD literature but doesn't translate directly to home delivery. Honest framing prevents overclaiming while keeping the exercise available.

### 1.7 Hyoid/suprahyoid release: move to library

**Location:** Currently exercise D.11 in structured protocol.

**Change:** Remove from the structured Phase 3 release protocol. Move to the exercise library. Remove from the daily session view for all members.

**Rationale:** No published evidence for hyoid/suprahyoid release in tinnitus. Marginal mechanistic case, finite session time. Members who want to explore can find it in the library. Pulling it tightens the daily session without losing meaningful benefit.

### 1.8 Upper cervical mobilisation: replace with chin-tuck-rotation

**Location:** Currently exercise E.11 (SNAG-style upper cervical mobilisation).

**Change:** Remove the SNAG-style technique entirely. Replace with **controlled chin tuck with rotation**:

> Sit upright with shoulders relaxed. Perform a chin tuck (drawing your chin straight back, not down). While maintaining the chin tuck, slowly rotate your head to one side until you feel a gentle stretch sensation in the upper neck. Hold for 5 seconds. Return to neutral. Repeat to the other side. Perform 5-8 repetitions per side.
>
> This is a gentle self-mobilisation that produces movement at the upper cervical joints through your own active muscle work, rather than the applied-force techniques used in clinical mobilisation. The clinical version is more targeted, but requires hands-on training to do safely. If you have access to a physiotherapist experienced in cervical dysfunction, they can deliver the more specific version. The home version below is the safe self-administered alternative.

**Rationale:** Self-administered SNAGs at C1-C2 carry meaningful risk (vertebrobasilar concerns, undiagnosed instability). Risk-reward unfavourable for self-directed platform. Chin-tuck-rotation produces upper cervical motion through member-generated force, much safer, mechanistically consistent.

### 1.9 Deep cervical flexor self-palpation fidelity check

**Location:** Deep cervical flexor training exercise (E.13).

**Change:** Add to the technique instructions, before the existing "common mistake" warning:

> To check whether you're activating the right muscles, place two fingers gently on the front of your throat — across the prominent muscles either side of your windpipe (the sternocleidomastoid and scalenes). Perform the chin tuck while monitoring these muscles. If you feel them bulging, hardening, or visibly tightening, you're substituting superficial muscle activation for deep flexor activation. The deep cervical flexors run along the front of the cervical spine deep to these muscles — when they're working correctly, the front of your throat should remain relaxed and quiet. If you feel substitution happening, reduce your effort. The deep flexors respond to low-load sustained activation, not strong contraction.

**Rationale:** Without pressure biofeedback unit, fidelity is variable and members can substitute SCM/scalene activation without knowing. Self-palpation gives a real-time check rather than abstract guidance.

### 1.10 PMR removed: clean up cross-references

**Location:** Phase 1 nervous system flag content; any Phase 4 content referencing PMR.

**Change:** Grep all content files for references to "PMR", "progressive muscle relaxation", or "adapted PMR". Remove or replace each reference. Specifically:
- Phase 1 NS flag mechanism content references "the resting jaw position retraining in Phase 3 and the adapted PMR in Phase 4 both specifically target this pattern" — remove the PMR reference
- Any Phase 4 nervous system framing listing PMR as a tool — remove

**Rationale:** PMR has been removed from the framework. Orphaned references are confusing.

### 1.11 Tinnitus neutralisation: gating up for high-NS-flag members

**Location:** Tinnitus neutralisation exercise (F.8).

**Change:** Replace the current high-NS-flag (3+ flags) profile modifier (which currently increases emphasis) with:

> Your assessment identified multiple nervous system patterns that respond well to professionally-guided CBT-for-tinnitus. The neutralisation work below is a self-administered approximation of techniques that deliver better and safer outcomes when guided by a clinician trained in tinnitus-specific CBT. We'd encourage you to pursue professional support alongside the framework — the British Tinnitus Association maintains a directory of trained therapists, and the American Tinnitus Association maintains an equivalent for US members. Search for "CBT for tinnitus" practitioners in your country if you're elsewhere. The self-administered version below is available if professional support isn't accessible, but for your specific pattern it has a meaningful ceiling.

The professional support signposting in F.11 should pull through to F.8 rather than duplicating directory references.

**Rationale:** CBT-for-tinnitus literature is reasonably clear that self-administered exposure for severely distressed patients carries real risk. Early sessions can become traumatic exposures rather than therapeutic ones. The high-NS-flag subgroup is the one CBT-for-tinnitus was built for. Routing them to professional support is more honest and protects members.

### 1.12 Bimodal stimulation acknowledgment (post-launch acceptable)

**Location:** Phase 1 mechanism education (DCN convergence section); Phase 5 plateau-outcome content.

**Change:** Add to Phase 1 mechanism education at the end of the DCN convergence section:

> Note: bimodal stimulation devices (Auricle, Lenire) target the same DCN mechanism through direct stimulation rather than physical intervention. They're a separate evidence-based approach to somatic tinnitus that some members may want to research independently.

Add to Phase 5 plateau-outcome content:

> Bimodal stimulation devices (Auricle, Lenire) are an evidence-based device approach to somatic tinnitus that some members at this stage choose to investigate.

**Rationale:** The DCN convergence model the framework uses produced these device therapies. Members who search will find them; the platform's silence about them creates a credibility gap. Minimal acknowledgment closes the gap without promoting them.

**Priority:** Post-launch acceptable. Not blocking.

---

## 2. PHASE 1 SCORING CHANGES

### 2.1 Daytime clenching weight increase

**Location:** Phase 1 TMJ scoring (M-series indicators).

**Change:** Move daytime clenching from 1 point (general tier) to **2 points**.

**Rationale:** Naderi 2024 showed TFI mean reduction 18.4 (95% CI 13.2-23.5) from awake bruxism reversal training combined with TMD therapy. This is the strongest single effect size in the somatic tinnitus literature and identifies daytime clenching as one of the highest-leverage findings. Current 1-point weighting under-emphasises this.

### 2.2 Joint sounds (S5) conditional weighting

**Location:** Phase 1 TMJ scoring (S5 indicator).

**Change:** Joint sounds at 4 points only when paired with pain or modulation. Joint sounds alone (no pain, no modulation) drop to 2 points.

**Rationale:** ~30% of asymptomatic adults have audible TMJ sounds without TMD or tinnitus. Fabrizia 2025 meta-analysis found TMJ pain on palpation was the strongest temporomandibular predictor (OR 2.46), not joint sounds. Scoring isolated sounds at 4 points is generous on specificity grounds.

### 2.3 Lateral pterygoid palpation downweight

**Location:** Phase 1 TMJ scoring (lateral pterygoid palpation indicator).

**Change:** Drop from 4 points to **2 points**.

**Rationale:** Anatomically inaccessible in 81% of cases per Stratmann 2000. Members are likely palpating adjacent tissue (deep masseter, temporal tendon, medial pterygoid) rather than the lateral pterygoid itself. 4 points is too generous for a finding that can't be reliably assessed. The exercise stays in the protocol with honest framing (see 1.5); the scoring weight is the change.

### 2.4 Floor lying relief test downweight + attentional warning

**Location:** Phase 1 cervical scoring (floor lying relief test).

**Change:** Drop "clear reduction" from 3 points to **2 points**. Add to the test instructions:

> If your tinnitus seemed louder during the supine period rather than reduced, this is not necessarily evidence the cervical mechanism is absent — for some members lying still in silence focuses attention on the sound. If you noticed this happening, score 'no reduction' for the test but flag this in the optional notes.

**Rationale:** Framework-original test without published validation. 3 points is high for an unvalidated finding. Test is also sensitive to attentional state — hypervigilant members may experience increased perceived loudness from focused attention, pulling them away from a cervical classification they might genuinely fit.

---

## 3. PHASE 1 ONBOARDING ADDITIONS

### 3.1 Hypervigilance settings prompt

**Location:** Phase 1 profile generation flow, after profile is generated, for members with confirmed hypervigilance flag only.

**Change:** Add a settings prompt screen that appears once for confirmed hypervigilants:

> Your assessment identified a hypervigilance pattern. For your profile, daily detailed monitoring of loudness can sometimes maintain the attentional loop Phase 4 addresses. The default settings work well for most members, but you have three optional changes available if you find them helpful:
>
> [ ] Hide the loudness sparkline on the dashboard
> [ ] Hide the lowest-loudness personal-best cards in analytics
> [ ] Switch from daily to weekly loudness logging
>
> These are optional and can be changed any time in settings. Most members find tracking useful — turn these off only if you find they're reinforcing rather than helping.

Settings page should expose these three toggles independently for hypervigilant members. Non-hypervigilant members see the standard settings without these options.

**Rationale:** Daily loudness logging plus dashboard sparkline plus loudness personal-bests are in tension with Phase 4 hypervigilance interruption content for the confirmed hypervigilant subgroup. Optional toggles preserve the universal default while giving the at-risk subgroup agency.

### 3.2 Daytime clenching immediate-action bullet

**Location:** Phase 1 onboarding output, immediate-actions section (currently lists items like sleep position, screen height for confirmed members).

**Change:** Add for members with confirmed daytime clenching:

> Daytime clenching confirmed: start the resting jaw position habit today — tongue on roof of mouth, lips together, teeth slightly apart. The full guidance is in Phase 2 but the habit itself can begin immediately.

**Rationale:** Habit reversal is potentially the highest-leverage intervention in the framework (Naderi 2024 effect size). Surfacing the habit at Phase 1 conclusion gives members 1-2 extra weeks of habit work before Phase 3 release work begins.

### 3.3 Hyperacusis screening (NS module)

**Location:** Phase 1 nervous system module.

**Change:** Add two screening questions:

> Do everyday sounds — running water, dishwashing, conversation in a busy room, traffic — feel uncomfortably loud or painful in a way they don't for most people? [Yes / Sometimes / No]
>
> Do you find yourself avoiding situations or environments because of sound levels that other people seem to tolerate fine? [Yes / Sometimes / No]

Confirmed positive on both = hyperacusis flag.

**Rationale:** ~15-25% of somatic tinnitus members likely have meaningful hyperacusis. Subgroup needs adapted Phase 4 content (masking and neutralisation carry different risk profiles).

### 3.4 Hyperacusis profile modifiers in Phase 4

**Location:** F.8 (neutralisation) and F.9 (masking).

**Change:** For confirmed hyperacusis members, add modifiers:

**In F.9 masking content:**
> If you confirmed hyperacusis in Phase 1, masking sound use needs more careful management than the standard guidance above. Use the lowest sound level that produces benefit. Avoid using masking continuously throughout the day. If you find sound exposure becoming uncomfortable rather than helpful, reduce or stop.

**In F.8 neutralisation content (in addition to high-NS-flag routing in 1.11):**
> If you confirmed hyperacusis, the standard neutralisation practice may not be appropriate without modification. Consider working with a clinician trained in hyperacusis-specific desensitisation rather than self-administered exposure.

### 3.5 Cervicogenic dizziness screening

**Location:** Phase 1 cervical module.

**Change:** Add screening question:

> Do you experience dizziness, light-headedness, or unsteadiness — particularly with neck movement, after sustained desk work, or when looking up? [Yes / Sometimes / No]

Confirmed positive = cervicogenic dizziness flag. For confirmed members, surface a small library section covering basic gaze stability work (eye-head coordination exercises). Direct them to Phase 3 cervical protocol as the primary intervention with gaze stability as supplementary.

**Rationale:** ~40% of cervicogenic somatic tinnitus patients have parallel cervicogenic dizziness. Single question + small library section closes the gap for a meaningful subgroup.

---

## 4. STRUCTURAL CHANGES

### 4.1 Sustained-pressure timer (must-fix-before-launch)

**Location:** Masseter release (D.6), temporalis release (D.7), suboccipital tennis ball release (E.1).

**Build requirement:**

A timer component integrated into these three exercises. Member taps "Start guided session" button on the exercise page. The timer runs:

- **Masseter and temporalis:** Three 90-second timers in sequence with a 5-second transition tone between positions. Total 4 minutes 50 seconds. Audio chime at the end of each 90-second hold. Audio chime at the end of the full sequence.
- **Suboccipital:** Single 10-minute timer with optional 30-second-out warning chime. Audio is the right channel because member is supine.

**Visual layout:** Mobile-first. Large central timer, position indicator (1 of 3, 2 of 3, 3 of 3), pause and stop buttons.

**Technical requirements:**
- Audio context initialised on user interaction (the Start button) to handle iOS Safari autoplay restrictions
- State persistence so members who navigate away or close the app mid-session can resume rather than restart
- Single chime audio file, played at events
- Timer component should be reusable — same component, different durations and sequences

**Estimated build:** 2-3 Claude Code sessions for the timer feature itself plus content integration to replace the static "Complete" button with the guided session flow.

**Rationale:** Removes the "tap Complete after 30 seconds" failure mode. Single biggest fidelity improvement available. The 90-second dosing is what the literature supports; without a timer, members will under-dose.

### 4.2 Shorter session option

**Location:** Dashboard, alongside "Start today's session".

**Change:** Add a smaller text link below "Start today's session" that says "Limited time today? Start a shorter session". Visual hierarchy keeps the full session as the primary CTA.

**Implementation:**

Each exercise gets two flags:
- `shorter_session_eligible`: boolean (whether the exercise appears in shorter sessions)
- `rotation_slot`: integer or day-of-week (which day of the week the exercise rotates in for shorter sessions)

**Shorter session composition for single-driver TMJ member:**
- Masseter release (5 min) — every day
- One supporting exercise rotating through the week (temporalis Mon/Thu, intraoral pterygoid if gated Tue/Fri, lateral pterygoid Wed/Sat, auriculotemporal Sun)
- Resting position retraining as continuous habit (no session time)
- ~7-10 minutes

**Shorter session composition for single-driver cervical member:**
- Suboccipital tennis ball (10 min) — every day
- Two cervical triumvirate exercises rotating through the week (e.g., SCM Mon/Thu, upper trap Tue/Fri, levator Wed/Sat, suboccipital stretch Sun)
- DCF training if in retraining phase (5 min)
- ~17-20 minutes

**Shorter session composition for dual-driver member:**
- Masseter release (5 min)
- Suboccipital tennis ball (10 min)
- One cervical triumvirate exercise emphasised that day (rotating)
- One TMJ supporting exercise (rotating)
- One additional cervical supporting exercise (rotating)
- DCF training if in retraining phase (5 min)
- ~25-30 minutes

**No heat in shorter sessions.** Heat is preparation rather than treatment; the masseter release will still produce most of its benefit without the heat warmup.

**Framing in the content:**
> Shorter sessions skip the heat warmup and rotate the supporting exercises through the week rather than running them daily. They keep the highest-evidence release work happening on days when a full session isn't realistic. Use this option when life gets in the way — but the full session remains the recommendation. Members who do the full daily session more consistently see better outcomes than members who default to shorter sessions long-term.

**Streak handling:** Shorter sessions count toward the daily streak the same as full sessions. Otherwise members will skip entirely on busy days rather than do the shorter version.

**Analytics:** Track shorter session frequency in analytics for founder visibility, but don't surface it visually to members. Showing "you've used the shorter option 23 times this month" creates unhelpful self-monitoring pressure.

### 4.3 Resistance phase entry: 1-week minimum gate

**Location:** Phase 3 progression logic.

**Change:** Add a 7-day minimum from phase3 start before the resistance phase progression button becomes active. This runs alongside the existing self-report criteria (tenderness reduced, release feels less effortful, jaw drift reduced, tissues responding) — both gates must be satisfied.

**UI behaviour:** If a member taps the progression button before the 7 days are up, show: "Minimum one week of release work before resistance phase begins — you can advance from [date]".

**Rationale:** Catches the eager subgroup who would otherwise rush through release in 3-4 days. 7 days is a reasonable minimum; 2 weeks would be too long and frustrate appropriate fast responders.

### 4.4 Heat duration

**Location:** Heat application exercise (D.5).

**Change:** No change to recommended duration. Keep at **10 minutes**. Acknowledge in content that 15-20 is the literature standard but that 10 minutes consistently is the realistic recommendation.

**Rationale:** Founder decision: 20 minutes is too demanding for adherence. Shorter consistent sessions outperform optimal-but-abandoned protocols.

### 4.5 Thoracic mobility: move to library

**Location:** Currently in Phase 3 cervical release as exercise E.12.

**Change:** Remove from the structured Phase 3 cervical protocol. Move to the exercise library, surfaced specifically for members with confirmed forward head posture or significant desk-driven cervical loading.

**Rationale:** Mechanistically defensible but not directly evidenced as a tinnitus intervention. The strongest somatic tinnitus RCTs (Michiels 2016, Atan 2020, Van der Wal 2020) didn't include thoracic mobility as a measured variable. Saves 3 minutes of daily session time. Members with relevant profile match can opt in.

---

## 5. OUTCOME DATA INFRASTRUCTURE (NEW PRE-LAUNCH ADDITION)

### 5.1 TFI capture at fixed intervals

**Location:** New questionnaire screens at five points in the member journey.

**Change:** Implement Tinnitus Functional Index (TFI) capture at:

1. **Intake** — during Phase 1 onboarding, after profile generation
2. **Phase 3 entry** — when member transitions from Phase 2 to Phase 3 (week 4-6 typically)
3. **Phase 5 entry** — when member transitions from Phase 4 to Phase 5 (week 12-16 typically)
4. **3-month follow-up** — measured from intake date
5. **6-month follow-up** — measured from intake date

**Implementation:**
- Single questionnaire screen (TFI is 25 items, 5-point scale, takes ~5 minutes)
- TFI is free for non-commercial use
- Standard scoring: 0-100 scale, lower is better
- Store full responses plus computed total score
- Surface to members as "Progress check — this gives us a comparable measure of where you are"
- Schedule the 3-month and 6-month follow-ups via email reminders

**Rationale:** Loudness 1-10 scale is useful for member self-tracking but isn't comparable to the published literature. TFI is the field standard with established psychometric properties. Capturing it gives the platform real-world outcome data that can validate or refute the framework's outcome assumptions, support honest claims to future members, and potentially form the basis of a published case series.

**Priority:** Pre-launch addition. Modest build complexity (one questionnaire screen replicated at five trigger points).

---

## 6. PRICING AND COMMERCIAL

### 6.1 Founding cohort grandfathering

**Decision:** Founding members (`is_founding_member = true`) retain free lifetime access regardless of future pricing changes. Members joining at the £2.99 price point retain that rate if pricing increases later.

**Implementation:** Already handled by existing `is_founding_member` boolean. For the £2.99 cohort, add a `pricing_tier` field that locks in the rate at signup.

**Rationale:** Don't change the deal on people who joined under earlier terms. Tinnitus communities have long memories — a single price-hike grievance can dominate community sentiment for months.

---

## 7. WHAT'S NOT CHANGING

These items were considered and rejected:

- **Phase 5 outcome category labels** — keeping "full resolution / significant improvement with residual / plateau" as is. Founder judgment that the spectrum is implicitly communicated by the three categories sitting alongside each other.
- **Founder-journey framing throughout the platform** — leaving for fresh-eyes review pre-launch by the founder.
- **Community feature** — launching as planned with the existing structure (Progress and Wins, Introduce Yourself, Questions for Oliver, Discussion, Research and Resources). Access unlocks at Phase 1 completion (after profile generation). Single-screen community charter on first community entry. Watch for loudness comparison drift as the highest-leverage moderation behaviour.
- **PMR (Progressive Muscle Relaxation)** — already removed from framework. Cross-references need cleanup (see 1.10).
- **Bimodal device promotion beyond minimal acknowledgment** — minimal two-sentence version in Phase 1 and Phase 5 only. Not promoted, named for member research only.

---

## 8. IMPLEMENTATION PRIORITY

### Must-fix-before-launch
- All content fixes (Section 1)
- All Phase 1 scoring changes (Section 2)
- All Phase 1 onboarding additions (Section 3)
- Sustained-pressure timer (4.1)
- Shorter session option (4.2)
- Resistance phase 1-week gate (4.3)
- Thoracic mobility move to library (4.5)
- TFI infrastructure (5.1)

### Post-launch acceptable
- Bimodal stimulation acknowledgment (1.12) — can be added in a content update post-launch

### Already in scope, not changing
- Heat duration (4.4) — no change
- Phase 5 outcome labels — no change
- Community feature — launching as planned

---

## 9. POSITIONING NOTES

**On outcome claims:** The framework should claim and promise meaningful improvement, not reversal. Realistic distribution for adherent members with confirmed somatic component:
- Significant improvement (where tinnitus stops being a major organising factor): ~50-60%
- Modest improvement: ~20-30%
- No meaningful change: ~15-25%
- Near-resolution or full reversal: ~10-20%

These are conservative estimates extrapolating from literature to real-world adherence-adjusted outcomes. Public-facing copy should reflect this.

**On the framework's evidence base:** The exercises are as close to optimal as the current evidence base supports for self-administered delivery. Load-bearing components have direct RCT evidence (Michiels 2016, Atan 2020, Naderi 2024, Rocha 2008/2012, Van der Wal 2020, Jull/Falla lineage). Supporting components have weaker direct tinnitus evidence but solid mechanistic rationale and adjacent literature support. The framework as a whole is defensible.

**On honesty as positioning:** The free-for-founding-cohort approach removes the financial incentive to overclaim. The £2.99 price point is appropriately priced for the value delivered. Honest outcome framing is both ethically right and commercially stronger than overpromising.

---

*End of pre-launch changes document.*
