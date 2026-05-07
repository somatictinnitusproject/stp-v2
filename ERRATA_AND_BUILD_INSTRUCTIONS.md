# SOMATIC TINNITUS PROJECT — V2 ERRATA & BUILD INSTRUCTIONS

**Read this document at the start of every phase.**
**Where this document conflicts with any other document, this document wins.**

*Compiled from full review of Documents 7, 11, 12, 13, 14, 15, and all Document 8 files.*

---

## HOW TO USE THIS DOCUMENT

Each section below is labelled with the phase where it becomes relevant. Some sections apply
to multiple phases. The Phase A section must be read before anything is built. Everything else
can be read on arrival at that phase.

---

## PHASE A — Environment Setup & Database

### A1. SCHEMA CORRECTION — cerv_floor_relief_test

**Document 7 says:** `cerv_floor_relief_test BOOLEAN`
**Correct definition:** `cerv_floor_relief_test VARCHAR(10)`

Valid values:
- `'clear'`  → 3 points
- `'slight'` → 1 point
- `'none'`   → 0 points
- `NULL`     → treat as 0 points (same as 'none')

When you hand Document 7 to Claude Code, add this instruction explicitly to the Phase A
prompt — do not rely on CLAUDE.md alone being read:

> "When you reach `cerv_floor_relief_test` in Document 7, override the type.
> It is VARCHAR(10), NOT BOOLEAN. Valid values are 'clear', 'slight', 'none'. NULL = 0 pts."

---

### A2. THE COMPLETE SCHEMA — 11 TABLES, NOT 7

Document 7 defines 7 tables. The complete schema at launch requires **11 tables** and
**9 additional columns** on existing tables. Build all of these in Phase A.

**The 7 tables from Document 7:**
1. `users`
2. `phase1_assessment`
3. `progress_logs`
4. `triggers`
5. `progress_log_triggers`
6. `framework_progress`
7. `memberships`

**4 additional tables — defined across Document 12:**

8. `founding_member_emails` — Doc 12 §1.1
   - `id` SMALLINT PK NOT NULL
   - `email` VARCHAR(255) UNIQUE NOT NULL (lowercase stored)
   - `claimed` BOOLEAN NOT NULL DEFAULT FALSE
   - `claimed_at` TIMESTAMPTZ NULLABLE
   - RLS: SELECT and UPDATE service role only. Never exposed to client.

9. `consents` — Doc 12 §2.5
   - `id` UUID PK DEFAULT gen_random_uuid()
   - `user_id` UUID NOT NULL FK users(id)
   - `health_data_consent` BOOLEAN NOT NULL
   - `research_consent` BOOLEAN NOT NULL
   - `consented_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
   - `health_consent_withdrawn_at` TIMESTAMPTZ NULLABLE
   - `research_consent_updated_at` TIMESTAMPTZ NULLABLE
   - RLS: SELECT, UPDATE, INSERT where auth.uid() = user_id. DELETE service role only.

10. `session_logs` — Doc 12 §6.12
    - `id` UUID PK DEFAULT gen_random_uuid()
    - `user_id` UUID NOT NULL FK users(id)
    - `session_date` DATE NOT NULL
    - `phase` SMALLINT NOT NULL
    - `exercises_completed` JSONB NOT NULL
    - `session_duration_seconds` INTEGER NULLABLE
    - `completed_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
    - RLS: SELECT, INSERT where auth.uid() = user_id. UPDATE, DELETE service role only.

11. `community_posts` — Doc 12 §11.3
    - `id` UUID PK DEFAULT gen_random_uuid()
    - `user_id` UUID NOT NULL FK users(id)
    - `space` VARCHAR(50) NOT NULL
    - `title` VARCHAR(200) NOT NULL
    - `body` TEXT NOT NULL
    - `is_pinned` BOOLEAN NOT NULL DEFAULT FALSE
    - `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE
    - `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
    - `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
    - RLS: SELECT all where is_deleted = FALSE (authenticated). INSERT auth.uid() = user_id.
      UPDATE/DELETE service role only.
    - Index on created_at DESC

12. `community_replies` — Doc 12 §11.3
    - `id` UUID PK DEFAULT gen_random_uuid()
    - `post_id` UUID NOT NULL FK community_posts(id)
    - `user_id` UUID NOT NULL FK users(id)
    - `body` TEXT NOT NULL
    - `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE
    - `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
    - `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
    - RLS: SELECT all where is_deleted = FALSE (authenticated). INSERT auth.uid() = user_id.
      UPDATE/DELETE service role only.
    - Index on created_at DESC, and on post_id

**9 additional columns on existing tables — Doc 12 §6.13 and §11.11:**

On `users`:
- `onboarding_completed` BOOLEAN NOT NULL DEFAULT FALSE
- `onboarding_step` SMALLINT NOT NULL DEFAULT 1
- `is_admin` BOOLEAN NOT NULL DEFAULT FALSE

On `framework_progress`:
- `exercises_viewed` JSONB NOT NULL DEFAULT '{}'
- `session_in_progress` JSONB NULLABLE
- `nudges_dismissed` JSONB NOT NULL DEFAULT '{}'
- `resistance_phase_start` TIMESTAMPTZ NULLABLE
- `phase4_first_accessed` TIMESTAMPTZ NULLABLE
- `phase5_outcome_type` VARCHAR(30) NULLABLE

**Add a `correlation_headline` to typography** — Doc 11 §2.2 includes this type token:
`correlation-headline: 15px / 600 / 1.4` — confirm it is in tailwind.config.js.

**After building all tables, verify:**
- Two-account RLS test: Account B cannot read Account A's progress_logs,
  phase1_assessment, or framework_progress.
- Attempt to INSERT a memberships row from the client with a valid session — confirm rejected.

---

### A3. BACKGROUND COLOUR — USE #F8F7F4 NOT #F5F0EB

Document 15's handoff prompts and session reset template contain a typo: `#F5F0EB`.

**The correct background is `#F8F7F4`** — confirmed in Document 11 §1.1, the tailwind.config.js
in Document 11 §10.1, and CLAUDE.md.

When you paste the Phase A, B, C (or any) handoff prompt from Document 15 and it shows
`#F5F0EB`, mentally substitute `#F8F7F4`. The tailwind.config.js you build from Document 11
§10.1 will be correct — this only affects the prose in the prompts.

---

## PHASE B — Authentication & Onboarding

### B1. BUILD canAccessPlatform() AS A SHARED HELPER — DO THIS FIRST

The membership access check — "founding member OR status=active OR status=past_due" —
appears in at minimum these locations:
- `middleware.ts`
- `/dashboard` server component
- `/framework/phase-[N]` server components
- `/tracker`, `/analytics`, `/exercise-library`, `/community`
- Stripe bypass check
- `/subscription` page

**If each location implements this check ad-hoc, they will drift.**

Add this instruction to the Phase B opening prompt:

> "Before building any auth flows, create `lib/auth/access.ts` with two helper functions:
>
> ```typescript
> export function canAccessPlatform(membership: { is_founding_member: boolean, status: string }): boolean {
>   if (membership.is_founding_member === true) return true
>   return membership.status === 'active' || membership.status === 'past_due'
> }
>
> export function isFoundingMember(membership: { is_founding_member: boolean }): boolean {
>   return membership.is_founding_member === true
> }
> ```
>
> Every membership check in the platform uses these functions. No inline membership logic
> anywhere outside this file."

---

### B2. USE .maybeSingle() FOR THE FOUNDING MEMBER EMAIL CHECK

Document 14 §2.3 uses `.single()` for the founding member email lookup:
```typescript
.from('founding_member_emails').select('claimed').eq('email', cleanEmail).single()
```

**`.single()` throws an error if no row is found.** For the founding member check, no row
simply means the user is not a founding member — it is not an error condition.

**Use `.maybeSingle()` instead.** It returns `null` data (not an error) when no row exists.

Correct pattern:
```typescript
const { data: foundingRow } = await supabaseServiceRole
  .from('founding_member_emails')
  .select('claimed')
  .eq('email', cleanEmail)
  .maybeSingle()

// foundingRow is null if not in list — not a founding member
// foundingRow.claimed === false — founding member, not yet claimed
// foundingRow.claimed === true — founding member, already claimed (duplicate account error)
```

---

### B3. ONBOARDING STEP NUMBERING — THE AMBIGUITY

Document 12 §2.2 shows the paid member step sequence as:
Step 1 (Terms) → Step 2 (Consent) → Step 3 (Test result) → **Step 5** (Payment) → Step 4 (Welcome) → Dashboard

Step 5 (Payment) appears *before* Step 4 (Welcome) in the flow. This is intentional — the
database uses `onboarding_step` as a position pointer, not a sequential counter.

**Key rule:** `onboarding_completed = TRUE` (boolean on users table) is the single source
of truth for whether a member is done with onboarding. The `onboarding_step` value tells
the router where to redirect — it does not itself gate the dashboard.

Add to Phase B prompt: "The `onboarding_step` column is a router pointer only.
`onboarding_completed = TRUE` is what middleware checks. Both must be set correctly on
welcome screen completion: `onboarding_step = 5` AND `onboarding_completed = TRUE`."

---

## PHASE C — Dashboard & Framework Skeleton

### C1. FRAMEWORK URL STRUCTURE — USE session NOT section

**Documents 12 and 13** use `/framework/phase-[N]/section-[S]` throughout.
**Document 14 §4.6** (the authoritative route map) uses `/framework/phase-[N]/session-[N]`.

**Decision: use `session`.**

Rationale: Document 14 is explicitly the route authority. The database column is
`current_session`. The session_logs table uses `phase` and `session_date`. Consistency
with the database naming is more important than consistency with Doc 12/13 prose.

**Every framework URL in the build uses `/framework/phase-[N]/session-[N]`.**

When building the framework skeleton in Phase C, the routes are:
```
/framework/phase-1/session-[N]
/framework/phase-2/session-[N]
/framework/phase-3/session-[N]
/framework/phase-4/session-[N]
/framework/phase-5/session-[N]
/session  (the daily practice checklist view — Phase 3 and 4)
```

When you see `section` in Document 12 or Document 13 content references (e.g. "B.3",
"C.5", "D.8") — those are content section labels used internally. They map to session
numbers in the URL. The content file keys sessions by number; the section letter codes
are Document 8 authoring labels only.

---

## PHASE D — Progress Tracker

### D1. progress_logs column names diverge from Doc 7
The database has `tinnitus_score` (not `loudness`) and `stress_level` (not `stress`).
All code uses the actual DB column names. Doc 7 spec for these two columns is deprecated.
Display labels in the UI remain "Tinnitus loudness" and "Stress" — only internal
identifiers and DB column names differ.

---

### D2. Retroactive logging extended to 7 days

Doc 12 §4.4 specifies "one day back only" for retroactive logging. Doc 15 Phase D scope
overrides this with 7-day retroactive window (`RETROACTIVE_LOG_DAYS = 7` in
`scoring-thresholds.ts`). Implementation follows Doc 15 and exposes both paths:
- Inline "Missed yesterday?" link (Doc 12 copy preserved)
- "Log a missed day" link opens a 7-day picker modal

Both route to the same `RetroactiveLogForm` which branches copy based on whether the
selected date is yesterday or an earlier day:
- If `logDate === yesterday`: heading "How were you yesterday?", submit "Log for yesterday"
- Otherwise: heading "How were you on [formatted date]?", submit "Log for [formatted date]"

---

## PHASE E — Framework Content System

### E1. SEVEN PROFILE TYPES, NOT FIVE

Document 7 §2.2 lists 5 profile_type values. **Document 13 §2.1 uses 7.** Doc 13 is correct
and was written after Doc 7. The dominant driver is encoded directly in the string.

The 7 profile types (use these exactly in the codebase):
1. `TMJ_DOMINANT`
2. `CERV_DOMINANT`
3. `DUAL_DRIVER`
4. `TMJ_PRIMARY_STRONG_SECONDARY`
5. `CERV_PRIMARY_STRONG_SECONDARY`
6. `TMJ_PRIMARY_WITH_SECONDARY`
7. `CERV_PRIMARY_WITH_SECONDARY`

The `profile_type` column is `VARCHAR(40)` (already correct in Doc 7 schema). The 7 types fit.

**Before Phase E, review Document 13 end-to-end and write out 7 test cases** — one per
profile type — with specific tmjNorm and cervNorm values that should produce each type.
Run these against the classification function before it touches any UI. Phase E will go
wrong silently if classification is off, and it is hard to debug from the member side.

Example test cases to write:
| Profile Type | tmjNorm | cervNorm |
|---|---|---|
| TMJ_DOMINANT | 70 | 10 |
| CERV_DOMINANT | 10 | 70 |
| DUAL_DRIVER | 45 | 40 |
| TMJ_PRIMARY_STRONG_SECONDARY | 60 | 38 |
| CERV_PRIMARY_STRONG_SECONDARY | 38 | 60 |
| TMJ_PRIMARY_WITH_SECONDARY | 45 | 25 |
| CERV_PRIMARY_WITH_SECONDARY | 25 | 45 |

Also test the edge case: tmjNorm=15, cervNorm=12 → LOW_CONFIDENCE (both < 20%)
And: tmjNorm=15, cervNorm=12, symptom_score=8 → LOW_CONFIDENCE_SYMPTOM_DOMINANT

---

### E2. SPLIT PHASE E INTO THREE SUB-SESSIONS

Phase E is the largest phase by a significant margin. Attempting it in one Claude Code session
will produce context drift and incomplete logic. Split it as follows:

**Phase E1 — Phase 1 assessment only**
- All four assessment modules UI (TMJ, cervical, postural, nervous system)
- Progressive scoring (tmj_raw_score and cerv_raw_score written on every module save)
- Final scoring on profile confirmation (all seven columns written in one transaction)
- Profile type classification — all 7 types
- All 4 edge case checks (Doc 13 §3)
- Profile paragraph generation (Doc 13 §4) — 6 sections
- Protocol option selection screen (omitted for low-confidence members)
- Phase 1 advancement (Doc 13 §7.2)
- Test: put all 7 profile types + 2 low-confidence cases through the system

**Phase E2 — Phase 2 content + session construction**
- Build `/content/framework/` directory structure
- Implement the session construction algorithm (Doc 13 §5)
- Populate Phase 2 content from Doc 8 Part C (all 10 sections)
- Focus line logic (Doc 13 §6)
- Phase 2 advancement trigger (Doc 13 §7.3)

**Phase E3 — Phase 3/4/5 content**
- Phase 3 TMJ content from Doc 8 Part D (20 sections)
- Phase 3 cervical content from Doc 8 Part E (17 sections)
- Phase 4 content from Doc 8 Part F (~12 sections)
- Phase 5 content from Doc 8 Part G (~9 sections)
- Resistance phase unlock (Doc 13 §7.7)
- Phase 3 advancement (Doc 13 §7.4)
- Phase 5 outcome selection and completion (Doc 13 §7.6)
- Contextual nudges (Doc 13 §9)

---

### E3. PHASE2_LAST_SESSION = 6, NOT 8 — AND THE GENERAL SESSION-COUNTER RULE

**Document 13 §9.3 specifies:** `PHASE2_LAST_SESSION: 8` (C.8 is the content section
label for the Phase 2 maintaining-factor checklist)

**Correct value:** `PHASE2_LAST_SESSION: 6`

**Reason:** `current_session` is a sequential integer counter (1 through N), not a
content section label. Phase 2 has 6 sessions: C.1, C.2, C.3, C.4, C.5, C.8 → session
numbers 1, 2, 3, 4, 5, 6 per `content/framework-manifest.ts`. Setting `PHASE2_LAST_SESSION`
to 8 would make any check of the form `current_session >= PHASE2_LAST_SESSION` permanently
unreachable during Phase 2, silently preventing Nudge 3 (Phase 4 breath work) from ever
firing.

The value is fixed at 6 in `content/scoring-thresholds.ts` with an explanatory comment.
Do not change it to 8 when building Phase E2.

**General rule — applies throughout Phase E2 and beyond:**

Document 8 uses section label codes (B.1, C.3, D.7, etc.) as authoring identifiers.
These labels are **not** session numbers. The URL and database use `session-[N]` / `current_session`
where N is the **ordinal position** of the session within its phase (1-indexed), not the
Document 8 label number. This mapping is defined in `content/framework-manifest.ts`.

When any constant, condition, or check references a session position within a phase:
- Use the ordinal session number (the counter), not the Document 8 label
- Cross-check against `PHASE_SESSION_COUNTS` in `framework-manifest.ts`
- If a Doc 13 value looks like a section label (e.g. 8 for C.8, 12 for F.12) rather than
  an ordinal, verify it against the actual session count before writing it to code

The only place Document 8 section labels appear in the codebase is as the `id` field on
`SessionItem` objects in session-list content files (e.g. `id: 'B7'`). Everywhere else —
URL segments, database columns, constants — use ordinal integers.

---

### E4. m4_asymmetric MISSING FROM UserIntakeRow

**Source:** Discovered during M5a pre-work review (2026-04-21).
**Doc 13 references:** §1.7 ("m4_asymmetric is a separate flag recorded for profile output;
it does not add additional points to the raw score") and §4.3 pseudocode
(`user.m4_asymmetric = TRUE` branch in cervical findings block).
**Doc 7 reference:** §2.1 users table — `m4_asymmetric BOOLEAN NULLABLE` defined in the
original schema (not an A2 addition).

**Problem:**
`UserIntakeRow` was defined in M2 to include only columns read by raw score calculation.
`m4_asymmetric` does not affect cervical raw score (Doc 13 §1.7 explicit) and was correctly
omitted from scoring. But §4.3 profile paragraph generation reads `user.m4_asymmetric` to
select the head rotation display string. The field was absent from `UserIntakeRow` when M5a
was written.

**Schema status:**
`m4_asymmetric` is in Doc 7 §2.1 users table (`BOOLEAN NULLABLE`). If Phase A was built
faithfully from Doc 7, the column already exists. If not, apply:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS m4_asymmetric BOOLEAN NULL;
```

ERRATA A2 does NOT need updating — this is an original Doc 7 column, not a discovered addition.

**Fix applied in M5a:**
Added to `UserIntakeRow` immediately after `m4_score` (`lib/scoring/types.ts`):

```typescript
m4_asymmetric: boolean | null   // §1.7: recorded for profile output; does not affect raw cervical score
```

**Impact:**
- `lib/scoring/types.ts` — one line added
- `lib/scoring/profile-paragraph/section2-findings.ts` — reads `user.m4_asymmetric` per §4.3
- Raw scoring unchanged.
- `lib/scoring/__tests__/edge-cases.test.ts` and `lib/scoring/__tests__/scoring.test.ts` fixtures updated during M6 to include `m4_asymmetric: null` — the M5a fix initially missed these files because vitest does not fail on type errors, only `tsc --noEmit` surfaces them. M5b profile-paragraph.test.ts was written after the type was updated and already correctly includes the field.

---

### E5. POST-LAUNCH CONTENT GAPS

**Source:** Discovered during M5b review (2026-04-21 through 2026-04-22) of profile paragraph generation (Doc 13 §4.4 + §4.5, implemented in `lib/scoring/profile-paragraph/`).

Doc 8 B.7 Section 3 defines base templates and modifier text for the most common contextual flags, but does not provide explicit member-facing text for every combination Doc 13 logic requires. The following seven content gaps were resolved during M5b and documented here for post-launch content review, scientific audit, and future V3 planning. The text currently shipped in the codebase is recorded alongside its source.

**Gap 1 — dentalExtractions modifier (§3 step 3)**

Doc 8 B.7 Section 3 does not provide modifier text for `ctx_dental_extractions = TRUE`. Doc 8 B.2 Module 1 progressive text discusses the mechanical significance of posterior dental extractions. The B.2 text was adapted to the B.7 modifier voice. Shipped text:

"Your history of posterior dental extractions is relevant context — loss of posterior teeth, particularly wisdom teeth, can alter jaw mechanics and loading patterns over time, and is worth noting as part of your profile."

Code location: `lib/scoring/profile-paragraph/section3-paragraphs.ts` → `dentalExtractionsModifier()`.

**Gap 2 — jawSurgery modifier (§3 step 3)**

Doc 8 B.7 Section 3 does not provide modifier text for `ctx_jaw_surgery = TRUE`. Doc 8 B.2 Module 1 text was used verbatim (tone matches B.7 without adaptation). Shipped text:

"Your history of jaw surgery is relevant context — post-surgical changes to joint mechanics can produce lasting alterations in how the jaw loads and moves."

Code location: `lib/scoring/profile-paragraph/section3-paragraphs.ts` → `jawSurgeryModifier()`.

**Gap 3 — sedentaryOccupation modifier (§3 step 4)**

Doc 8 B.7 Section 3 does not provide modifier text for `ctx_sedentary_occupation = TRUE`. Doc 8 B.3 Module 2 text was used verbatim (tone matches B.7 without adaptation). Shipped text:

"Your occupation involves sustained postures that place continuous load on the cervical spine. Addressing this daily load through workstation changes and movement habits — covered in Phases 2 and 4 — is an important part of making the protocol work durable rather than temporary."

Code location: `lib/scoring/profile-paragraph/section3-paragraphs.ts` → `sedentaryOccupationModifier()`.

**Gap 4 — oneSidedSport modifier (§3 step 4)**

Doc 8 B.7 Section 3 does not provide modifier text for `ctx_one_sided_sport = TRUE`. Doc 8 B.3 Module 2 text was adapted to the B.7 modifier voice (reviewer-approved rewrite during M5b pre-work). Shipped text:

"Your history of one-sided sport or asymmetric activity is worth factoring in — repetitive single-side loading can reinforce cervical tension on the dominant side. This is addressed alongside your protocol work in Phase 4's postural correction section."

Code location: `lib/scoring/profile-paragraph/section3-paragraphs.ts` → `oneSidedSportModifier()`.

**Gap 5 — mildNervousSystemModifier (§3 step 5)**

Doc 8 B.7 Section 4 provides explicit text for members with three or more nervous system flags (the high-NS branch). It does not provide text for members with one or two NS flags (the mild branch). Doc 13 §4.4 step 5 branches `IF nsFlags >= HIGH_NS_FLAG_THRESHOLD / ELSE IF nsFlags >= 1` — the ELSE IF branch needs text that Doc 8 does not supply. Reviewer-authored during M5b pre-work. Shipped text:

"Your assessment identified some nervous system involvement — not enough to indicate the full Phase 4 breath work as an immediate priority, but worth keeping in mind as you progress. The Phase 4 breath work is accessible from the start if you find stress or anxiety is amplifying your tinnitus during Phase 3."

Code location: `lib/scoring/profile-paragraph/section3-paragraphs.ts` → `mildNervousSystemModifier()`.

**Gap 6 — STRUCTURAL_ASYMMETRY output text (§4 — Doc 13 §3.4)**

Doc 13 §3.4 defines 5 asymmetry pattern values. Doc 8 Module 5 provides explicit output text for 4 of them (Output 1 Consistent Ipsilateral → UNILATERAL_COHERENT; Output 2 Contralateral → handled separately as an additive pattern flag; Output 3 Mixed → MIXED_ASYMMETRY; Output 4 No Significant Asymmetry → NO_ASYMMETRY). STRUCTURAL_ASYMMETRY (all findings same side, tinnitus not clearly lateralised) has no explicit Doc 8 output. Reviewer-authored during M5b pre-work. Shipped text:

"Your assessment shows a consistent structural pattern on your [dominant side] side — [findings on that side]. Your tinnitus presentation does not clearly lateralise to match this pattern, which limits the confidence of the lateralisation — but the structural findings are real and your protocol will apply side-specific emphasis where relevant throughout Phase 3."

Code location: `lib/scoring/profile-paragraph/section4-asymmetry.ts` → STRUCTURAL_ASYMMETRY case in `asymmetryTextByPattern()`.

**Gap 7 — SINGLE_FINDING output text (§4 — Doc 13 §3.4)**

SINGLE_FINDING (only one asymmetric finding) has no explicit Doc 8 output. Reviewer-authored during M5b pre-work. Shipped text:

"Your assessment identified one asymmetric finding — [finding with side]. A single finding is noted and will influence your protocol where relevant, but does not establish a strong lateralised pattern overall."

Code location: `lib/scoring/profile-paragraph/section4-asymmetry.ts` → SINGLE_FINDING case in `asymmetryTextByPattern()`.

**Discard behaviour — NS modifier and low-confidence wrapper interaction (§3 steps 5 and 6)**

Doc 13 §4.4 pseudocode step 6 reads `paragraph = lowConfidenceWrapper(edgeCaseFlags.lowConfidence, paragraph)` — an assignment, not concatenation. The wrapper text REPLACES the entire base paragraph plus all contextual modifiers accumulated in steps 1–5. This means that when a low-confidence edge case fires AND nervous system modifier text was added in step 5 (because `nsFlags >= 1`), the NS modifier text is discarded. The wrapper text does not reference nervous system involvement because the low-confidence wrapper is self-contained.

This is the literal pseudocode behaviour and is shipped as-is. The reviewer judgement is that a low-confidence member seeing a mild-NS sentence immediately followed by "your assessment did not produce strong findings" would be incongruous — the replace-rather-than-append behaviour is correct for the member experience, not a bug.

Strong-single-finding note (step 7) appends AFTER the wrapper by design — that finding is a separate signal worth surfacing even in low-confidence cases.

Code location: `lib/scoring/profile-paragraph/section3-paragraphs.ts` → comment above `lowConfidenceWrapper()` call in `generateSection3_PersonalisedParagraph()`.

**Post-launch review actions**

- After 100+ profile paragraph generations, sample member feedback specifically on the 7 gap-sourced/authored texts to check for clarity and tone consistency with the Doc 8 B.7 verbatim templates.
- If tone drift is reported, revise in place — these texts are not locked in the same way as verbatim Doc 8 content and can be updated without a scientific review.
- If new evidence emerges about posterior dental extractions, one-sided sport, or mild nervous system involvement mechanisms, update the corresponding modifier text and reflect here.

---

## PHASE F — Exercise Library

### F1. EXERCISE LIBRARY CATEGORY SLUGS — DECISION

Documents 12 §7.5 and 14 §4.7 define different category structures.

**Decision: use the six URL slugs from Document 14 §4.7.** These are the actual routes.

The six categories and their URL slugs:
| Slug | Display name |
|---|---|
| `jaw-release` | Jaw Release |
| `cervical-release` | Cervical Release |
| `resistance-training` | Resistance Training |
| `postural` | Postural |
| `nervous-system` | Nervous System |
| `breathing` | Breathing |

The Document 12 §7.5 filter row uses different groupings (e.g. "Jaw and TMJ", "Assessment").
Those are display labels on the **exercise library home search filters only** — they are not
category pages. The filter row in Doc 12 is a UI filter, not a route structure. The six routes
above are the six category pages.

The exercise content file (Doc 12 §7.8) uses `category: "jaw-tmj"` in its example — update
this to `category: "jaw-release"` to match the route structure.

The "Assessment" filter in Doc 12 §7.5 shows Phase 1 self-assessment exercises only — these
live in the main exercise library pages, not a separate category route. Implement the
Assessment filter as a client-side filter on the `/exercise-library` home page, not a route.

---

### F2. CONDENSED VIEW VIDEO — COLLAPSED BY DEFAULT ON /SESSION

**Doc 12 §6.5 says:** "Demonstration video (embedded)" in the condensed view structure.
**Doc 13 §5.8 same implication.**

**Correct behaviour for /session:** The demonstration video in condensed view is NOT
embedded by default. It is collapsed behind a "Watch demonstration ▸" expand link
(13px, 500 weight, primary teal). Tapping expands the VideoSlot inline (max-height +
opacity transition, 250ms). Collapses on next page load — not persisted.

**Rationale:** Members repeat the same exercises daily for 12 weeks. Auto-loading the
video iframe on every session visit creates unnecessary loading and visual noise for
exercises they have already watched. The expand link gives access without the cost.

**Scope:** /session condensed view ONLY. The following contexts continue to embed video
directly as the default:
- Full-view (first visit to an exercise in /session) — unchanged
- /exercise-library/[category]/[slug] — unchanged
- Phase 1 assessment module videos — unchanged

**Implementation:** `VideoExpandToggle` client component in
`components/exercise/video-expand-toggle.tsx`. Used in the condensed branch of
`ExerciseView`. No prop gating needed — the library always passes `firstView={true}` and
never reaches the condensed branch. Implemented 2026-05-05.

---

### F3. TFI INFRASTRUCTURE — SHIPPED 2026-05-05

TFI infrastructure shipped 2026-05-05. Replaces deferred §5.1 of
STP_PreLaunch_Changes.md. Implementation differs from original spec:

- Three capture points: intake, Phase 5 completion, and 6-month
  post-completion follow-up. The original spec's Phase 3 entry and
  Phase 5 entry (G.9) captures are dropped per founder decision —
  these intermediate points add limited research value over the
  cleaner before/after/durability structure.
- Intake and Phase 5 completion captures: live at launch via
  /tracker card and /tfi page.
- Six-month follow-up: capture_point value 'follow_up_6m' exists
  in schema, but the email trigger and UI flow are deferred to a
  post-launch build (must ship before first cohort hits 6 months
  post-Phase 5, which is realistically 9+ months from launch).
- Intake capture trigger: phase1_assessment.created_at set, not
  "during Phase 1 onboarding" as originally specced.
- Member-initiated optional via /tracker card, dismissible per
  capture point.

---

### F4. ONBOARDING STEP 3 REDESIGNED — SHIPPED 2026-05-05

Onboarding Step 3 redesigned 2026-05-05. Replaces the broken
"Take the assessment" button that pointed to the non-existent V2
/test route (https://stp-v2-eight.vercel.app/test).

Step 3 now forks on whether a ?result= URL param is present:

- No param (Case B): member sees both sections simultaneously —
  "Take the assessment" (links to https://somatictinnitusproject.com/test,
  same tab) and "Already taken the test" (three radio options).
  Continue button is disabled until a radio is selected.

- Param present (Case A): fork hidden, only the radio section shown with
  the param result pre-selected. Subtitle reads "We carried your result
  from the test — confirm this is correct". Member can change the
  selection before continuing.

?result= URL param pre-fill (a → A, b → B, c → C, case-insensitive)
behaviour is preserved unchanged from the original design.

Classification is written to phase1_assessment.classification via upsert
at app/api/onboarding/save-classification. If a phase1_assessment row
exists, only classification and updated_at are updated (created_at is
not overwritten). If no row exists, one is inserted with other columns
NULL — remaining columns are populated by Phase 1 modules.

Radio labels (exact): "A — Likely somatic", "B — Possibly somatic",
"C — Unlikely somatic".

---

## PHASE G — Analytics

### G1. CORRELATION THRESHOLD — 14 LOGS, NOT 28 DAYS

**Document 15, Document 14 §5.8, and some prose in Document 12 say "28 days".**
**Document 12 §5.10 and Document 13 §9.3 say 14 logs (`CORRELATION_MINIMUM_LOGS: 14`).**

**Decision: 14 logs.** The named constant `SCORING_THRESHOLDS.CORRELATION_MINIMUM_LOGS`
in `/content/scoring-thresholds.ts` is the source of truth. Its value is 14.

The threshold is a **log count**, not a day count. A member who logs every day for 14 days
and a member who logs sporadically over 3 weeks both qualify at exactly 14 logs.

All UI copy should say "14 days of logging" (which at daily logging = 14 logs) to be
both technically accurate (log count) and readable to the member.

The threshold message before 14 logs reads (from Doc 12 §5.10):
> "Personalised insights appear after 14 days of logging. You have [N] logs so far —
> [14-N] more to go."

Do not use "28 days" anywhere in the codebase.

---

## PHASE H — Stripe Integration

### H1. WEBHOOK ROUTE — USE APP ROUTER RAW BODY PATTERN

Document 14 §1.5 includes:
```javascript
export const config = { api: { bodyParser: false } }
```

**This is Pages Router syntax. It does not work in Next.js 15 App Router.**

The correct App Router pattern for reading raw body for Stripe signature verification:

```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(request: Request) {
  const rawBody = await request.text()  // NOT request.json()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return Response.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  // Process event...
  return Response.json({ received: true }, { status: 200 })
}
// Do NOT export config object — it is not used in App Router
```

Add this correction explicitly to the Phase H handoff prompt.

---

### H2. EMAILOCTOPUS INTEGRATION — SHIPPED 2026-05-05

EmailOctopus integration shipped 2026-05-05. Implementation differs from
Doc 14 §3 spec:

- Three automated emails only: welcome (on onboarding completion), Phase 5
  completion, and deferred 6-month TFI follow-up. Subscription confirmation,
  payment failed, subscription cancelled, phase completion (1–4), and 30-day
  re-engagement emails dropped or deferred.
- Transactional send mechanism: EmailOctopus 1.6 has no direct
  "send to one contact" API. Sends use tag-based automation triggers.
  EMAILOCTOPUS_WELCOME_TEMPLATE_ID and EMAILOCTOPUS_COMPLETION_TEMPLATE_ID
  env vars hold trigger tag names, not UUID template IDs. Configure matching
  automations in the EO dashboard (trigger on tag add, remove tag after send).
- Tag-based segmentation: v2_member, founding_member, pre_stripe_member,
  paid_member (paid_member is future — unused while STRIPE_ENABLED=false).
- Send fail-open: any EmailOctopus error is logged but never blocks member
  action. Welcome email fires from /api/onboarding/complete (fire-and-forget).
  Phase 5 completion email fires via next/server after() from the
  markPhase5Complete server action.
- Client code lives in lib/emailoctopus/client.ts — server-side only, never
  imported from client components.

---

### H3. FREE-FOR-LIFE ACCESS TIER — SHIPPED 2026-05-05

Free-for-life access tier shipped 2026-05-05. New is_free_for_life BOOLEAN
column on memberships (NOT NULL DEFAULT FALSE). Migration backfills
existing founding members to is_free_for_life = TRUE.

- Pre-Stripe-launch joiners: when STRIPE_ENABLED env var is not 'true',
  the /onboarding/payment page (Branch 2) flags the member as
  is_free_for_life = TRUE, status = 'active', plan_type = 'free_pre_stripe'
  via the service client and redirects to /onboarding/welcome. No payment
  is collected.
- Founding member badge: only is_founding_member = TRUE shows a badge in
  member-facing UI. Free-for-life non-founders see no badge.
- Access check: canAccessPlatform() now checks is_free_for_life alongside
  is_founding_member. All membership selects updated to include
  is_free_for_life. proxy.ts updated to allow cancelled free-for-life
  members through.
- When Stripe ships post-launch (STRIPE_ENABLED=true), new signups go
  through the paid flow. Existing free-for-life members stay free forever —
  do not migrate them to paid.
- plan_type 'free_pre_stripe': if a CHECK constraint exists on plan_type,
  add this value to the allowed list. See migration
  20260505000002_free_for_life.sql for the ALTER statement template.

---

## PHASE K — Testing & Launch

### K1. FOUNDING MEMBER SEEDING SCRIPT IS ALREADY WRITTEN

Document 14 §2.1 contains the complete seeding script at `scripts/seed-founding-members.js`.
It reads `waitlist.csv`, lowercases all emails, batch-inserts in chunks of 100, uses upsert
(safe to re-run), and logs a count verification at the end.

Steps before running:
1. Export V1 waitlist from EmailOctopus as CSV, save as `waitlist.csv` at project root
2. Run: `node scripts/seed-founding-members.js`
3. Spot-check 5–10 emails in Supabase table editor
4. Confirm all `claimed` values are FALSE
5. Confirm row count matches CSV export count

**Do not launch until this passes completely.** Founding members who hit the payment screen
are a bad experience and cannot be recovered gracefully after the fact.

---

## ONGOING — ALL PHASES

### ALL1. COMMUNITY QUERIES — is_deleted = FALSE IS MANDATORY

Every single query that fetches community_posts or community_replies must include
`WHERE is_deleted = FALSE`. No exceptions. If Claude Code ever writes a community
query without this filter, stop and correct it before continuing.

### ALL2. FOUNDING MEMBER — STRIPE IS NEVER QUERIED

`is_founding_member = TRUE` means Stripe is never touched for that member. Not on login,
not on middleware check, not on dashboard load, not on any feature access check. If you
ever see a Stripe API call in a code path that starts with `is_founding_member = TRUE`,
that is a bug.

During Phase H testing: sign in as a founding member test account, open network tab,
navigate everywhere. Zero requests to `api.stripe.com` is the pass condition.

### ALL3. THREE SHELLS ONLY

Every page uses exactly one of: `AuthShell`, `OnboardingShell`, `PublicShell`.
No shell logic (nav, padding, max-width) is ever rebuilt inside a page component.

### ALL4. ALL INPUTS MINIMUM 16px FONT SIZE

Enforced in globals.css. Never override below 16px on any input, textarea, or select.
This prevents iOS Safari auto-zoom on focus, which is one of the most disruptive mobile bugs.

### ALL5. ALL THRESHOLD VALUES FROM scoring-thresholds.ts

No magic numbers in scoring, analytics, or phase advancement logic. Every threshold is a
named export from `/content/scoring-thresholds.ts`. If a value is needed that isn't there,
add it to that file first.

### ALL6. SUPABASE_SERVICE_ROLE_KEY — SERVER-SIDE ONLY

Never in client components. Never prefixed with NEXT_PUBLIC_. Never returned from an API route.
Used only in: webhook handlers, server components doing elevated operations, API routes
that need to bypass RLS (founding member check, membership creation, EmailOctopus adds).

---

## PHASE E — Framework Content

### E6. PHASE 1 MODULE SUBMISSION API ROUTES

Document 14 §4.10 lists `/api/framework/advance-session` and `/api/framework/advance-phase`
but no Phase 1 module submission routes. E1b introduces one route per module under the
pattern `/api/framework/phase-1/module-N` and `/api/framework/phase-1/asymmetry`. Each
route writes module-specific columns to phase1_assessment, recomputes tmj_raw_score and
cerv_raw_score per Document 13 §1.10, then calls incrementCurrentSession inline per
Document 13 §7.8.

### E7. THREE-STATE AND FOUR-STATE INPUT COLLAPSE TO SCHEMA

Phase 1 form inputs collapse to schema column types server-side at route submission. Rules:
- Yes/Sometimes/No (history questions): `Yes` + `Sometimes` → TRUE, `No` → FALSE.
  Matches Doc 13 §1.2 intake scoring semantics.
- Yes/No/Unsure (jaw drift only): `Yes` → TRUE, `No` → FALSE, `Unsure` → NULL.
  Direction column NULL unless primary is `Yes`.
- Yes/No (all others): `Yes` → TRUE, `No` → FALSE.
  Side/direction column NULL unless primary is `Yes`.

### E8. PHASE1_ASSESSMENT ROW CREATION ON B.1 ACKNOWLEDGE

Document 13 §1.10 progressive save pattern is pure UPDATE and assumes the row exists.
Row creation happens in the B.1 acknowledge handler which inserts an empty
phase1_assessment row (user_id only) before calling incrementCurrentSession. Subsequent
module submissions are pure UPDATEs. Insert is idempotent via ON CONFLICT DO NOTHING —
requires UNIQUE constraint on phase1_assessment.user_id (migration
`20260423000000_phase1_assessment_user_unique.sql` applied).

### E9. M1/M2 MOVED FROM INTAKE IMPORT TO LIVE PHASE 1 QUESTIONS

**Decision D1/D2 (M7 sub-step 2.5):** M1 (jaw opening) and M2 (jaw protrusion) are now
performed live in-platform during Phase 1, not imported from the intake test.

**Schema change:** Two new BOOLEAN columns added to phase1_assessment:
- `tmj_m1_jaw_opening BOOLEAN NULL`
- `tmj_m2_jaw_protrusion BOOLEAN NULL`

Migration: `supabase/migrations/20260423010000_phase1_tmj_m1_m2.sql`
Apply in Supabase SQL editor before testing Module 1.

**Scoring change (Doc 13 §1.3/§1.4):** `calculateTmjRawScore` reads
`assessment.tmj_m1_jaw_opening === true` and `assessment.tmj_m2_jaw_protrusion === true`
directly. The user intake fallback (`user.m1_score > 0`, `user.m2_score > 0`) is removed
for these two fields only. The overlapping indicator rule (§1.2) still applies to
S1/S6/S7/S8 — those fallbacks are unchanged.

**Content change:** Questions 1 and 2 in Module 1 are the movement tests. Sub-heading
"Movement Tests" appears above Q1–Q2. "Physical Assessment" sub-heading above Q3–Q7.

### E10. MODULE 1 MECHANISM PARAGRAPH REORDER

**Original Doc 8 §B.2 order:** P1 anatomy, P2 trigeminal pathway, P3 real-time tinnitus
change, P4 muscles, P5 most people don't have jaw pain.

**V2 platform order:** P1 anatomy, P2 trigeminal pathway, P3 most people don't have jaw
pain (MOVED FROM P5), P4 real-time tinnitus change (was P3), P5 muscles (was P4).

**Rationale:** Normalisation paragraph ("most people don't experience significant jaw pain")
now appears before the diagnostic indicators to reduce pre-assessment anxiety.
All paragraph text is verbatim from Doc 8. Order only.

### E11. VIDEO SLOT AND SCROLL PROGRESS BAR COMPONENTS INTRODUCED

**VideoSlot** (`components/ui/VideoSlot.tsx`): placeholder component for all 7 physical
assessment questions in Module 1. Accepts `videoId?: string | null`. When null (always for
now): renders surface-raised placeholder with play icon and "Video coming soon" label per
Doc 11 §F14. Cloudflare Stream embed (Doc 14) plugs in without refactor when IDs are ready.

**ScrollProgressBar** (`components/ui/ScrollProgressBar.tsx`): fixed 2px bar at viewport
top, fills primary colour as member scrolls. Reusable. Mounted in Session1OpeningClient
(label "Module 1 — Section 1 of 7") and Session2ModuleOneClient (label "Module 1 — Section
2 of 7"). Mount in each subsequent module session client as it is built.

### E12. TMJ INTAKE-ONLY INDICATORS S2 AND S5 NOW SOURCED FROM PHASE 1 ASSESSMENT

Document 13 §1.3 TMJ scoring reference originally sourced S2 (morning soreness, 2 pts) and
S5 (joint sounds, 4 pts) from `user.s2_score` and `user.s5_score` respectively. The V1
intake test does not persist individual M/S scores — only A/B/C classification is carried
forward — so these columns are always NULL for V2 members. Indicators silently scored 0
despite correct Phase 1 answers.

Fix (consistent with E9 M1/M2 fix): `calculateTmjRawScore` now reads
`assessment.tmj_joint_sounds === true` (+4 pts) and
`assessment.tmj_morning_soreness === true` (+2 pts) directly. Intake fallback removed for
these two indicators.

Point values, tiers, module maximum (30) unchanged. Strictly a data source correction.

The overlapping indicator rule in §1.2 (S1/S6/S7/S8) remains as-is — those four work
correctly via `user.s1_score`, `user.s6_score`, `user.s7_score`, `user.s8_score` fallbacks.
Only intake-source indicators without an existing overlapping rule entry needed this fix.

### E13. CERVICAL M3/M4/M5 DATA SOURCE FIX — FULL SCOPE

V1 intake never persisted individual M/S scores. `user.m3_score`, `user.m4_score`,
`user.m4_asymmetric`, `user.m5_score` are always NULL for V2 members. Four new
BOOLEAN columns added to phase1_assessment via M8 migration:

- cerv_m3_neck_curl
- cerv_m4_head_rotation
- cerv_m4_asymmetric_side
- cerv_m5_chin_tuck

All three files that read these intake columns updated to read Phase 1 assessment
columns instead:

- lib/scoring/cerv-score.ts — scoring (M3 +4, M4 +4, M5 +2; asymmetric is edge-case
  flag not a scoring input)
- lib/scoring/edge-cases.ts — checkSingleStrongMovement cervical block (M3, M4)
- lib/scoring/profile-paragraph/section2-findings.ts — cervical findings block
  (M3 narrative, M4 narrative with asymmetric qualifier)

Point values, tiers, module maximum (28) unchanged. Strictly a data source
correction. Overlapping indicator rule §1.2 (S7/S8) unchanged — already sourced
correctly from Phase 1 columns with intake fallback.

### E14. EXTENSION OF E9 — M1/M2 STALE READS IN EDGE CASES AND PROFILE PARAGRAPH

E9's scope was limited to calculateTmjRawScore in tmj-score.ts. Two further files
read user.m1_score / user.m2_score for V2 members where those values are always
NULL:

- lib/scoring/edge-cases.ts — checkSingleStrongMovement TMJ block
- lib/scoring/profile-paragraph/section2-findings.ts — jaw findings block

Both updated to read assessment.tmj_m1_jaw_opening and assessment.tmj_m2_jaw_protrusion
respectively. Behaviour unchanged for members who answered the Phase 1 questions;
fix restores correct behaviour for all V2 members (previously these indicators
never fired).

### E15. EXTENSION OF E12 — S2/S5 STALE READS IN PROFILE PARAGRAPH

E12's scope was limited to calculateTmjRawScore in tmj-score.ts. The profile
paragraph jaw findings block in lib/scoring/profile-paragraph/section2-findings.ts
also read user.s2_score and user.s5_score:

- Morning soreness sentence: was `tmj_morning_soreness = TRUE OR s2_score > 0`,
  now `tmj_morning_soreness = TRUE` only. s2_score branch removed — intake path
  no longer exists anywhere in the pipeline.
- Joint sounds sentence: was `s5_score > 0`, now `tmj_joint_sounds = TRUE`.

Both target columns already exist on phase1_assessment and are written by M7
Module 1 submission route.

### E16. FLOOR LYING RELIEF TEST REMOVED FROM PHASE 1 MODULE 2

Doc 8 B.3 originally included the floor lying relief test as the final cervical
indicator (graduated 'clear' / 'slight' / 'none' scoring, max 3 pts). The test
requires lying supine for at least 5 minutes in a quiet environment — a real
friction for members assessing during a work break, on a commute, or in a
chaotic household. Adding "unable to perform" semantics introduced score
amplification through dynamic-max recalculation; treating absence as 0 pts
silently down-scored members near profile-type boundaries.

The mechanism the floor relief test demonstrates — passive postural unloading
producing tinnitus reduction — is structurally a Phase 4 maintaining-factors
intervention, not a Phase 1 diagnostic. Phase 4 is the appropriate home: a
daily-decompression / passive-postural-relief technique introduced alongside
the active workstation, postural, and breath-work content.

Changes:
- Removed cerv_floor_relief_test from Module 2 content file (8 questions
  remain: M3, M4, M5, suboccipital, SCM, upper trap, rotation range, forward
  head posture).
- Removed cerv_floor_relief_test column from phase1_assessment via M8
  migration drop statement (no V2 member data exists in this column —
  pre-launch).
- Removed cerv_floor_relief_test from Phase1AssessmentRow type and all
  blankAssessment test helpers.
- Removed the scoring branch from calculateCervRawScore in cerv-score.ts.
- Removed the narrative branches from section2-findings.ts and section3
  paragraph generation.
- Removed graduated scoring entirely from the cervical module — every
  remaining cervical indicator is binary. Doc 13 §1.6 is no longer applicable.
- CERVICAL_MODULE_MAXIMUM in scoring-thresholds.ts changed from 28 to 25.
- Tier thresholds (PROTOCOL_ASSIGNMENT_MINIMUM 20%, SINGLE_DRIVER_HIGH_THRESHOLD
  60%, etc.) unchanged — percentage thresholds are scale-invariant. Raw-score
  point counts producing each percentage shift proportionally.
- P3 of B.3 mechanism prose: "in the intake test" → "in the movement tests in
  this module" (already applied in 8.3 file write).

Doc 13 §1.5–1.7 should be read with this removal in mind. §1.6 (graduated
scoring example using floor relief) no longer applies.

Phase 4 content addition queued for E3 build: "Daily Decompression — Floor
Lying" or equivalent subsection in Phase 4 content, sourced from Doc 8 B.3
floor relief instructions (lines 443–455). Frame as a relief technique, not
a diagnostic test.

### E17. CERV_FLOOR_RELIEF_TEST COLUMN NOT DROPPED DESPITE E16

**Status: open — cleanup before M11 (now M12).**

E16 specified that the floor lying relief test was removed from Module 2 entirely, with `CERVICAL_MODULE_MAXIMUM` reduced from 28 to 25. The scoring code was updated and the M2 client component dropped the input. However, the `cerv_floor_relief_test` column was NOT dropped from the live `phase1_assessment` table.

The `Phase1AssessmentRow` type in `lib/scoring/types.ts` does NOT list this column (correctly per E16). No code reads or writes it. It's dead schema.

**Fix:**
```sql
ALTER TABLE phase1_assessment DROP COLUMN cerv_floor_relief_test;
```

Run a grep first to confirm no code references it:
grep -rn "cerv_floor_relief_test" lib/ app/ content/
Should return zero matches before dropping.

---

### E18. post_dominant_chewing_side VARCHAR(10) TIGHT AGAINST FUTURE VALUES

**Status: open — cosmetic, deferred.**

The `post_dominant_chewing_side` column on `phase1_assessment` is `VARCHAR(10)`. Doc 8 §B.4 specifies three valid values: `'left'` (4 chars), `'right'` (5 chars), `'no_preference'` (13 chars).

During the M9a smoke test, submitting "No clear preference" caused Postgres error 22001 (string_data_right_truncation) because `'no_preference'` overflowed VARCHAR(10).

**Fixed at runtime:** the M3 derive function (`derivePosturalSubmitPayload` in `content/framework/phase-1/b4-module-3-postural.ts`) translates `'no_preference'` → `null` before the route writes the column. NULL is the semantically correct sentinel because Doc 13 §4.3 reads `IF assessment.post_dominant_chewing_side IS NOT NULL` — NULL means "no asymmetric chewing pattern," which is exactly what "no clear preference" represents.

The column is tight against any future values longer than 10 chars. Consider widening to VARCHAR(20) when convenient. Not blocking.

---

### E19. Q5 + Q6 IN MODULE 4 — DOC 8 / DOC 7 / DOC 13 DISAGREE ON PERSISTENCE

**Status: open — content/scoring decision needed before launch.**

Doc 8 §B.5 includes six self-assessment questions in the Nervous System module (M4). Q1–Q4 persist to corresponding `ns_*` columns. Q5 (unconscious tension patterns) and Q6 (relaxation variability) are presented as full-bodied questions with mechanism explainers and output table flags, but:

- Doc 7 has no `ns_unconscious_tension` or `ns_relaxation_variability` columns
- Doc 13 §4.4 step 5 (high-NS modifier) reads only the four primary NS columns (Q1, Q2, Q3, Q4) — Q5/Q6 have no consumer
- Doc 8's output table for Q5 says it "flags Phase 3 resting jaw position retraining and adapted PMR"; for Q6 says it's a "positive prognostic" for the profile paragraph — but neither flag exists in the codebase

Currently Q5 and Q6 are UI-only inputs in M4. Captured for member self-awareness during the assessment, not stored.

**Decision needed:** add the two columns + update Doc 13 §4.4 (and possibly Phase 3/4 content selection logic) to consume them, OR simplify Doc 8 §B.5 to remove Q5/Q6's "flags" framing since nothing actually flags. Defer until post-launch when member feedback shows whether the Q5/Q6 mechanism explainers are valuable on their own.

---

### E20. S-COLUMN INTAKE READS REMOVED FROM generateAndSaveProfile

**Status: fixed during M10c smoke test.**

Same root pattern as E9/E12/E13/E14/E15 (M-column intake reads). V1 intake only persisted aggregate scores (`tmj_score`, `cerv_score`, `symptom_score`, `movement_score`, `total_score`, `classification`). The granular per-question intake columns Doc 7 specified — `s1_score`, `s2_score`, `s5_score`, `s6_score`, `s7_score`, `s8_score` — were never built on the live `users` table.

The `generateAndSaveProfile` orchestrator (`lib/scoring/generate-and-save-profile.ts`) was reading these columns at runtime and threw `column "s1_score" does not exist` (Postgres 42703) during the first end-to-end M5 submit on production.

**Fix:** changed the SELECT on `users` from `s1_score, s6_score, s7_score, s8_score, symptom_score` to just `symptom_score` (which exists and is read by `checkLowConfidenceEdgeCase`). Set all S-column fields in `userIntake` to null. The S-column fallback paths in `tmj-score.ts` and `cerv-score.ts` are now dead code post-erratum but preserved structurally — Phase 1 module routes validate the overlapping-indicator questions are answered directly, so the IS-NULL fallback path no longer fires in practice.

Pattern matches E9/E12/E13/E14/E15. Now the S-columns too.

---

### E21. ctx_stomach_sleeping COLUMN MISSING — DOC 8 §B.7 SECTION 7 CONDITIONAL HARDCODED FALSE

**Status: open — schema or content decision needed before launch.**

Doc 8 §B.7 Section 7 contains a conditional paragraph for members with confirmed stomach sleeping (a maintaining factor):

> Stomach sleeping confirmed: sleep position change tonight, not at the end of Phase 2

This text is rendered by `Session7ProfileOutputClient.tsx` when `showStomachSleepingNote === true`. However, no `ctx_stomach_sleeping` column exists on `phase1_assessment` — the assessment never captures this flag.

In `app/framework/[phase]/[session]/page.tsx` session-7 branch, `showStomachSleepingNote` is currently hardcoded to `false` with a TODO comment. The companion `showSustainedDeskLoadNote` reads from `post_sustained_desk_load` which exists.

**Decision needed:**
1. Add a `ctx_stomach_sleeping BOOLEAN NULLABLE` column to `phase1_assessment`, add the question to Module 3 or 4 (likely Module 3 sleep/posture group), update the M3 client and route to capture it, OR
2. Remove the stomach sleeping conditional from Doc 8 §B.7 Section 7 entirely.

Defer until post-launch member content review. Currently the conditional never fires.

---

### E22. framework_progress SCHEMA GAPS — phase1_completed_at AND protocol_option WERE MISSING

**Status: fixed during M11 smoke test.**

Doc 7 specified `framework_progress.phase1_completed_at` (TIMESTAMPTZ) and `framework_progress.protocol_option` (SMALLINT, 1/2/3/NULL). Three V2 pages already SELECTed `phase1_completed_at` (dashboard, programme-overview, framework phase index). Neither column existed on the live database.

`advancePhase1` (added in M11c) failed at runtime with Postgres error PGRST204 (column not found in schema cache) when trying to UPDATE these columns.

**Fix:** ran the migration during the M11 smoke test:
```sql
ALTER TABLE framework_progress
  ADD COLUMN IF NOT EXISTS phase1_completed_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS protocol_option SMALLINT NULL CHECK (protocol_option IN (1, 2, 3));
```

Plus a follow-on preventive migration for the four future-phase columns (Phase 2/3/4/5 will need these for their own advancement triggers per Doc 13 §7.3/§7.4/§7.5/§7.6):
```sql
ALTER TABLE framework_progress
  ADD COLUMN IF NOT EXISTS phase2_completed_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS phase3_completed_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS phase4_completed_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS phase5_completed_at TIMESTAMPTZ NULL;
```

All five `phaseN_completed_at` columns and `protocol_option` confirmed present on `framework_progress` after migration.

Build implication for Phase 2+: future phase advancement helpers (`advancePhase2`, `advancePhase3`, `advancePhase4`, `advancePhase5`) can write to these columns directly without further migrations.

---

### E23. PHASE 1 MAINTAINING FACTOR / HABIT FLAG SCHEMA AND CAPTURE GAPS — RESOLVED BY DESIGN DECISION

**Status: RESOLVED (M12c-pre).** This entry remains in errata as a record
of the design decision, not as a pending fix.

**Original concern (logged M12b):** Doc 8 Phase 2 C.1 maintaining-factor
list and Doc 8 Phase 2 C.2/C.3/C.4 "Flagged for your profile" per-habit
labels reference flag columns that either don't exist on `phase1_assessment`
or are not captured by current Phase 1 module behaviour.

**Gap analysis (M12c-pre):**

Type 1 — Question specified in Doc 8 Phase 1 Module 5 §3 "Daily Posture
Patterns", capture never built in V2:

- `post_low_screen_positioning` (referenced by C.3 H2)
- `ctx_stomach_sleeping` (also tracked under E21; referenced by C.3 H3)
- `post_bag_carrying` (referenced by C.3 H4)
- `tmj_jaw_posture_habits` (referenced by C.2 H6)
- `post_high_sustained_sitting_load` (referenced by C.3 H5)
- `post_asymmetric_sitting` (referenced by C.3 H7)

Type 2 — Habit referenced by Doc 8 Phase 2 system notes, no Phase 1
question specified anywhere in Doc 8:

- `gum_chewing` (Doc 8 P2 C.2 H3 system note assumes column; no Doc 8 P1
  capture mechanism specified)
- `object_chewing` (Doc 8 P2 C.2 H4 — same)
- `phone_shoulder` (Doc 8 P2 C.2 H7 — same)
- `phone_posture` (Doc 8 P2 C.3 H1 — same; OR fallback via
  post_sustained_desk_load works)
- `tinnitus_worse_driving` (Doc 8 P2 C.3 H6 system note references this
  flag from cervical module history questions, but no such column exists)
- `high_intensity_exercise` (Doc 8 P2 C.4 H1 system note; OR fallback via
  ns_flag_count >= 3 covers this)
- `high_caffeine` (Doc 8 P2 C.4 H2 system note — same; ns fallback covers)
- `alcohol_pattern` (Doc 8 P2 C.4 H2 system note — same; ns fallback covers)

Type 3 — V1 intake S-columns (s1_score etc) referenced by Doc 8 fallback
rules, never imported into V2:

- `users.s1_score` and related — fallback path in Doc 13 §1.2 is dead in
  V2 (also tracked under E20)

**Design decision: ACCEPT THE PARTIAL STATE.**

Rationale:

1. All habit content and mechanism notes render in full for every member
   across C.1 through C.8.
2. "Flagged for your profile" labels fire correctly for habits whose
   underlying data is captured by current Phase 1 modules. Other habits
   remain silent — members read the content and self-assess.
3. Adding 7+ additional Phase 1 questions to support supplementary visual
   labels would expand Phase 1 by ~15% for personalisation emphasis, not
   core content. Phase 1 is already specified as the longest single phase
   of the framework.
4. Selective label firing preserves trust in the labels that do appear.
   A label that always means something is more useful than a label that
   sometimes means something.

**Implementation:**

- C.1 personalisation (M12b): 8 maintaining factors surface (4 postural +
  4 nervous-system). The 4 Doc-8-listed-but-uncaptured factors remain
  silent.
- C.2 per-habit labels (M12c): H1, H2, H5 fire correctly when their
  underlying conditions are met. H3, H4, H6, H7 are PERMANENTLY silent.
- C.3 per-habit labels (M12d): H1 fires (via post_sustained_desk_load), H4
  fires (via post_shoulder_asymmetry), H7 fires (via
  post_shoulder_asymmetry). H2, H3, H5, H6 are PERMANENTLY silent.
- C.4 per-habit labels (M12e): both H1 and H2 fire when ns_flag_count >= 3
  (3 or more of the 4 ns_* boolean columns confirmed). The Doc 8
  system note's alternate triggers (high_intensity_exercise,
  high_caffeine, alcohol_pattern) are PERMANENTLY missing per E23; the
  ns flag fallback covers both habits.
- Flag-check helpers (`getC2HabitFlag`, `getC3HabitFlag`, `getC4HabitFlag`)
  annotate permanently-silent habits with `// PERMANENT — no Phase 1
  capture per E23 design decision`. C.4 helpers additionally export
  `countNsFlags` for ns flag counting, reusable by future Phase 4 nudges.

**No further action required.** This is not a pre-launch fix item.

---

---

## M12i — NUDGE 2 SECTION TRIGGER

Document 13 §9.2 says Nudge 2 (`phase4_sleep`) triggers at the
Phase 2 sleep foundations section, identified as C.5. The build has
Sleep Foundations at C.7. Diet Foundations is at C.5.

**Decision: trigger Nudge 2 at C.7.** The trigger is content-section
bound, not number-bound. C.7 is where Sleep Foundations content
lives in this build, so the nudge fires there.

Doc 13 §9.2 referenced section number is the errata. The section
ID logic in `/lib/framework/nudges.ts` uses 'C7' for `phase4_sleep`.

No code change to Doc 13 needed — this errata document captures the
divergence.

---

## PHASE 3 — PRIMARY DRIVER PROTOCOLS (M13)

### P3-0. PRE-LAUNCH OVERRIDES DOCUMENT 8 — READ THIS FIRST

`STP_PreLaunch_Changes.md` in the project root is the source of truth for
all Phase 3 content and structural decisions. **Where pre-launch and Document 8
conflict, pre-launch wins. Without exception.**

Document 8 Part D (TMJ) and Part E (Cervical) were authored before the
pre-launch evidence review. Several exercises in Doc 8 contain content
that has been corrected, reframed, or removed by pre-launch. Do not
write the Doc 8 version of any content listed in section P3-1 below.

If Claude Code finds itself writing copy that matches Doc 8 phrasing
on any of the items in P3-1, that is a bug. Stop and re-read pre-launch
before continuing.

---

### P3-1. THE TWELVE IN-SCOPE PRE-LAUNCH ITEMS FOR PHASE 3

These are the only pre-launch items implemented during the Phase 3 build.
All other pre-launch items are out of scope here and handled in their
respective phase builds.

| Pre-launch ref | Doc 8 section affected | Override type | Sub-step |
|---|---|---|---|
| **1.1** Golgi tendon organ correction | D.6 masseter, E.5 suboccipital, any release content explaining autogenic inhibition | Content edit — replace "muscle spindle signalling" with "Golgi tendon organ feedback" | M13m, M13s |
| **1.2** 90-second softening | D.5 temporalis, D.6 masseter, E.5 suboccipital, any release content using 90-second framing | Content edit — replace the 60-second binary framing with the softer phrasing in pre-launch §1.2 verbatim | M13m, M13s |
| **1.5** Lateral pterygoid honest framing | D.8 lateral pterygoid release | Content addition — append the evidence note from pre-launch §1.5 verbatim after existing technique instructions | M13n |
| **1.6** TMJ distraction clinician reframing | D.10 TMJ distraction | Content addition — prepend the clinician-vs-self paragraph from pre-launch §1.6 verbatim at exercise opening; keep rest of content intact | M13n |
| **1.7** Hyoid removed from protocol | D.11 hyoid and suprahyoid release | Structural — REMOVE from `buildTmjReleaseList`. Do NOT author D.11 content during Phase 3. Library-bound only (Phase F). | M13d, M13n |
| **1.8** SNAG → chin-tuck-rotation | E.11 upper cervical mobilisation | Structural — REPLACE exercise entirely. Discard the SNAG-style content from Doc 8. Build chin-tuck-rotation per pre-launch §1.8 verbatim. Likely rename ID to `E11_chin_tuck_rotation`. | M13t |
| **1.9** DCF self-palpation fidelity check | E.13 deep cervical flexor training | Content addition — insert the self-palpation paragraph from pre-launch §1.9 verbatim BEFORE the existing "common mistake" warning | M13v |
| **4.1** Sustained-pressure timer | D.5 temporalis, D.6 masseter, E.5 suboccipital | New feature — `<SustainedPressureTimer>` component replaces the static "Complete" button on these three exercises only | M13f, M13m, M13s |
| **4.2** Shorter session option | /session, dashboard, Exercise interface | New feature — `shorter_session_eligible` + `rotation_slot` per exercise; rotation logic; secondary CTA on dashboard; three composition rules per pre-launch §4.2 | M13c, M13i, M13j |
| **4.3** 7-day resistance gate | D.13 + E.12 acknowledge buttons | New gate — minimum 7 days from `phase2_completed_at` before resistance acknowledge button is active. Runs alongside (not instead of) self-report criteria. | M13b, M13o, M13u |
| **4.5** Thoracic removed from protocol | E.10 thoracic mobility | Structural — REMOVE from `buildCervReleaseList`. Do NOT author E.10 content during Phase 3. Library-bound only (Phase F). | M13d, M13s |

**Out of scope for Phase 3** (handled in other phase builds — do NOT bake
into Phase 3 work): pre-launch §1.3 caffeine, §1.4 supplements, §1.10
PMR cleanup, §1.11 F.8 high-NS routing, §1.12 bimodal stimulation, all
§2.x scoring, all §3.x onboarding additions, §4.4 heat duration (no change
required), §5.1 TFI infrastructure, §6.1 pricing tier.

---

### P3-2. EXERCISE ID NAMING — DOC 8 LETTERS WIN OVER DOC 13 §5.5

Document 13 §5.5 names the protocol-specific exercise lists with IDs
that are off-by-one (TMJ) and off-by-two (cervical) relative to Doc 8
section letters. This is authoring drift in Doc 13.

**Decision: code IDs match Doc 8 section letters exactly.**

The corrected lists:

```typescript
// buildTmjReleaseList — post pre-launch
[
  'D4_heat_application',
  'D5_temporalis_release',
  'D6_masseter_release',
  'D7_intraoral_pterygoid_release',
  'D8_lateral_pterygoid_release',
  'D9_auriculotemporal_nerve_mob',
  'D10_tmj_distraction',
  // D11 hyoid REMOVED per pre-launch §1.7
  // D12 resting position is a daily habit, not a session exercise
]

// buildCervReleaseList — post pre-launch
[
  // E10 thoracic REMOVED per pre-launch §4.5
  // No warm-up replacement — E5 suboccipital leads
  'E5_suboccipital_tennis_ball',
  'E6_scm_stretching',
  'E7_levator_scapulae_stretching',
  'E8_upper_trap_scalene_release',
  'E9_suboccipital_specific_stretching',
  'E11_chin_tuck_rotation',  // entirely new exercise per pre-launch §1.8
]

// buildReducedCervList — Option 3 secondary cervical for TMJ-primary profiles
TMJ_PRIMARY_WITH_SECONDARY:    ['E5_suboccipital_tennis_ball']
TMJ_PRIMARY_STRONG_SECONDARY:  [
  'E5_suboccipital_tennis_ball',
  'E6_scm_stretching',
  'E9_suboccipital_specific_stretching',
]

// buildReducedTmjList — Option 3 secondary TMJ for cervical-primary profiles
CERV_PRIMARY_WITH_SECONDARY:   ['D6_masseter_release']
CERV_PRIMARY_STRONG_SECONDARY: ['D6_masseter_release', 'D7_intraoral_pterygoid_release']

// buildLowConfidenceList
['D6_masseter_release', 'E5_suboccipital_tennis_ball']

// buildTmjResistanceList
['D14_jaw_symmetry_retraining',
 'D15_progressive_resistance',
 'D16_eccentric_jaw_control',
 'D17_condylar_repositioning']
// D18 functional integration and D19 timeline expectations are reading
// sections in framework view, NOT daily session exercises.

// buildCervRetainingList
['E13_deep_cervical_flexor_training',
 'E14_cervical_rotation_holds',
 'E15_cervical_proprioception']
// E16 timeline expectations is a reading section, NOT a daily session exercise.
```

If Doc 13 §5.5 and the table above conflict, the table above wins.

---

### P3-3. CERVICAL RELEASE OPENING — NO WARM-UP REPLACEMENT

Pre-launch §4.5 removes E.10 thoracic mobility, which had been the
warm-up opener for the cervical release sequence. **No replacement
warm-up is added.** E.5 suboccipital tennis ball release leads directly.

The 10-minute supine hold is itself gradual in onset and the member is
lying down throughout — adding heat or a separate warm-up exercise is
not required. Doc 12 §6.6 combined-session order ("Heat application
(TMJ members)") remains TMJ-only — heat is not extended to cervical.

---

### P3-4. FIRST-VIEW TRACKING — EXERCISES ONLY, NOT ORIENTATION SECTIONS

`exercises_viewed` JSONB tracks first-view state for **session exercises
only**. Orientation and reading sections (D.1, D.2, D.3, D.12, D.18,
D.19, E.1, E.2, E.3, E.4, E.16) always render full content on every visit.

Member can revisit any orientation section from the Phase 3 session list
(Doc 12 §3.11) and gets the full content every time. No condensed view
exists for orientation sections.

`exercises_viewed` keys are exercise IDs only:
`D4_heat_application`, `D5_temporalis_release`, `D6_masseter_release`, etc.

---

### P3-5. TMJ RESISTANCE LIST — FOUR DAILY EXERCISES, NOT THREE

Document 13 §5.5 lists `buildTmjResistanceList` with three IDs (D14,
D15, D16-as-condylar). **This is wrong.** Doc 8 has four resistance
exercises and one of them (D16 eccentric jaw control) is missing from
Doc 13's list, and Doc 13 mislabels D17-condylar as D16.

**Correct daily resistance list — four exercises:**
- D14 jaw symmetry retraining
- D15 progressive resistance
- D16 eccentric jaw control
- D17 condylar repositioning

D18 functional integration and D19 timeline expectations are reading
sections accessible via framework view — not daily session exercises.

---

### P3-6. RESISTANCE ACKNOWLEDGE — DUAL GATE

The acknowledge button on D.13 and E.12 must satisfy both:
1. Self-report (the readiness signals from D.3 / E.4 — implicit, member
   judges based on content, no UI gate)
2. **7-day minimum** from `phase2_completed_at` (pre-launch §4.3 —
   `RESISTANCE_PHASE_MINIMUM_DAYS = 7` from `/content/scoring-thresholds.ts`)

If `NOW() - phase2_completed_at < 7 days`, the button is inactive and
displays:

> Minimum one week of release work before resistance phase begins —
> you can advance from [date].

Where [date] is `phase2_completed_at + 7 days` formatted as a calendar date.

The button activating does NOT mean the member should advance. The
content above the button (D.13 / E.12 prose) carries the self-report
criteria. The 7-day gate is a floor, not a recommendation.

---

### P3-7. SHORTER SESSION COMPOSITION — EXACT RULES

Per pre-launch §4.2, the shorter session option (route: `/session?mode=short`)
composes exercises by `tmj_protocol_assigned`, `cerv_protocol_assigned`,
calendar day-of-week rotation, and resistance phase state.

**No heat in shorter sessions** — heat is treated as preparation, not
treatment. Skipping heat is the largest time saving and the most defensible.

**Rotation rule:** calendar day-of-week (e.g. JavaScript `Date.getDay()`).
Same supporting exercise on the same weekday for every member. Implementation
is a pure function of `dayOfWeek`. No per-member counter or anchored-to-start
date logic.

Three compositions:

**Single-driver TMJ** (~7–10 min):
- D6 masseter (every day) + 1 supporting exercise rotating by calendar day-of-week
- D5 temporalis: Mon, Thu
- D7 intraoral pterygoid: Tue, Fri (included for ALL TMJ members — not gated on Phase 1 finding)
- D8 lateral pterygoid: Wed, Sat
- D9 auriculotemporal: Sun

**Single-driver cervical** (~17–20 min):
- E5 suboccipital (every day) + 2 cervical triumvirate rotating by day
- E6 SCM: Mon, Thu
- E8 upper trap: Tue, Fri
- E7 levator: Wed, Sat
- E9 suboccipital stretch: Sun
- E13 DCF if in retraining phase

**Dual-driver** (~25–30 min):
- D6 masseter (every day)
- E5 suboccipital (every day)
- One cervical triumvirate exercise rotating by day
- One TMJ supporting exercise rotating by day
- One additional cervical supporting exercise rotating by day
- E13 DCF if in retraining phase

**Streak handling:** shorter sessions count toward the daily streak the
same as full sessions.

**Analytics:** track shorter-session frequency in `session_logs.exercises_completed`
context, do NOT surface count to member.

---

### P3-8. SUSTAINED-PRESSURE TIMER — TECHNICAL CONSTRAINTS

Per pre-launch §4.1, three exercises use `<SustainedPressureTimer>`:

| Exercise | Configuration |
|---|---|
| D5 temporalis | 3 × 90s with 5s transition tone between positions, end-of-hold chime, end-of-sequence chime. Total: 4m 50s. |
| D6 masseter | Same as D5: 3 × 90s with transitions and chimes |
| E5 suboccipital | Single 10-minute hold. Optional 30s warning chime. Audio routed right channel only (member is supine). |

**iOS Safari constraints:**
- Audio context MUST be initialised on the user's tap of "Start guided session"
- Pre-loaded audio file (single chime) for all events
- Cannot autoplay sound

**State persistence:**
- Timer state (current position, elapsed seconds within position) saved
  to localStorage on every interval tick
- Stale-state rule: if the saved state's date is not today's calendar date,
  discard and start fresh. Same rule as `session_in_progress` JSONB
  per Doc 13 §5.9. Cross-midnight resumption is intentionally NOT supported.
- App close / navigation away mid-session same calendar day → returning
  to the exercise shows "Resume from position N at MM:SS" option
- Component is reusable — same component, different position arrays
  and durations.

---

### P3-9. SHELL ASSIGNMENT FOR /session

The `/session` page uses `AuthShell` like every other authenticated
member page. The page itself replaces the dashboard's "Start today's
session" CTA — it is not a modal, not a separate shell. Header / nav /
footer come from AuthShell. Page-internal layout (G2 sticky session
header, G1 exercise cards, G3 completion screen) per Doc 11 §G.

---

### P3-10. PHASE 4 NUDGE LINKS — PHASE 4 OVERVIEW PLACEHOLDER

The contextual nudges in M13x reference Phase 4 sections that do not
exist yet. For Phase 3 build:

- Nudges render correctly with their copy from Doc 12 §6.9
- Deep-link target is `/framework/phase-4` (overview page)
- Phase 4 build (later) will replace nudge targets with section-specific
  deep links

Do NOT skip nudge implementation in Phase 3 because the deep link is
imperfect. The nudge dismissal state (`nudges_dismissed` JSONB) needs
to be working so the Phase 4 build doesn't double-fire dismissed nudges.
```

---

### P3-11. SCHEMA STATE AT M13a START

Verified 2026-04-28 via PostgREST column-probe (service role key). SQL editor
access not available — presence confirmed by SELECT, not by information_schema.

**framework_progress — all 6 Task-1 columns confirmed present:**
- `exercises_viewed` JSONB NOT NULL ✅
- `session_in_progress` JSONB NULLABLE ✅
- `nudges_dismissed` JSONB NOT NULL ✅
- `resistance_phase_start` TIMESTAMPTZ NULLABLE ✅
- `phase4_first_accessed` TIMESTAMPTZ NULLABLE ✅
- `phase5_outcome_type` VARCHAR(30) NULLABLE ✅ (CHECK constraint not verifiable without SQL editor)

Migration-added columns also confirmed: `phase2_habits_acknowledged` ✅,
`phase3_first_accessed` ✅.

**Known schema deviation — `framework_progress.tmj_protocol_assigned` and
`cerv_protocol_assigned` are absent.** Both live on `phase1_assessment` instead.
The app already reads from `phase1_assessment` for protocol assignment.
Phase 3 session construction must do the same — read `tmj_protocol_assigned`
and `cerv_protocol_assigned` from `phase1_assessment.user_id = user.id`, not
from `framework_progress`. No remediation needed.

**session_logs — table exists, all columns present.** RLS partial verification:
- Unauthenticated SELECT: 0 rows (RLS active) ✅
- Unauthenticated INSERT: rejected with policy violation ✅
- Full two-account authenticated test (Task 4 Tests 1–6): NOT completed —
  requires authenticated user JWTs. Manual verification in Supabase SQL editor
  recommended before launch.

**users — all three required columns confirmed:** `is_admin` ✅,
`onboarding_completed` ✅, `onboarding_step` ✅.

**phase1_assessment — all Phase 3-relevant columns present except:**
- `low_confidence_flag`: MISSING — computed at runtime by
  `checkLowConfidenceEdgeCase()`, never persisted. Phase 3 session construction
  must recompute from normalised scores, not read a stored flag. Not a bug.
- `cerv_floor_relief_test`: still present (E17 open — dead column, pending drop).

**Scoring thresholds:** `PHASE3_MINIMUM_WEEKS: 4` was already present.
`RESISTANCE_PHASE_MINIMUM_DAYS: 7` added by M13a.

**`STP_PreLaunch_Changes.md` confirmed present** at project root. File was
not found in the first M13a session due to a glob pattern mismatch (case
sensitivity). File was read in full during M13a review. All preamble
requirements satisfied.

---

### P3-12. LOW-CONFIDENCE DETECTION — RUNTIME COMPUTATION, NOT STORED FLAG

Document 13 §5.4 instructs the session construction algorithm to read
`phase1Assessment.low_confidence_flag IS NOT NULL`. **This is wrong.**
The column does not exist on `phase1_assessment` and was never persisted.
Verified during M13a Item 3 audit on 2026-04-28.

Low-confidence is detected at runtime by reading `tmj_normalised_score`
and `cerv_normalised_score` (both confirmed present, both never null
after profile generation):

```typescript
const isLowConfidence =
  (assessment.tmj_normalised_score ?? 0) < SCORING_THRESHOLDS.PROTOCOL_ASSIGNMENT_MINIMUM &&
  (assessment.cerv_normalised_score ?? 0) < SCORING_THRESHOLDS.PROTOCOL_ASSIGNMENT_MINIMUM
```

`PROTOCOL_ASSIGNMENT_MINIMUM` is 20 (already in `SCORING_THRESHOLDS`).

The two low-confidence subtypes Doc 13 §3.1 distinguishes
(`LOW_CONFIDENCE_SYMPTOM_DOMINANT` vs `LOW_CONFIDENCE_LOW_ALL`) have
identical session composition — both route to `buildLowConfidenceList`.
The subtype distinction is irrelevant for session construction. Do NOT
add a runtime check for symptom_score in M13d.

When buildSessionExerciseList encounters a low-confidence member,
the standard `protocol_option` branching is skipped entirely and
`buildLowConfidenceList` is returned with resistance exercises appended
if `resistance_phase_start IS NOT NULL` (rare for low-confidence members
but logic must handle it).

If Doc 13 §5.4 and this section conflict, this section wins.

---

### P3-13. PHASE 1 FLAG GAPS — SILENT-OMISSION POLICY

Phase 3 content (Doc 8 Part D and Part E) references Phase 1 flag columns
in profile modifier blocks that are not persisted to `phase1_assessment`.
Verified during M13a Item 5 audit on 2026-04-28.

**The five missing flags** with no proxy column on `phase1_assessment`:

| Flag referenced in Doc 8 | Phase 3 content using it | DB status |
|---|---|---|
| `masseter_tenderness` | D.6 masseter profile modifier | Missing — `tmj_masseter_asymmetry` exists but captures palpation difference, not tenderness; not equivalent |
| `temporalis_tenderness` | D.5 temporalis profile modifier | Missing — no proxy. No Phase 1 question on temporalis at all |
| `intraoral_pterygoid_tenderness` | D.7 intraoral pterygoid profile modifier | Missing — no proxy. Module 1 Q5 captures external lateral pterygoid only |
| `temporal_headache` | D.5 temporalis profile modifier | Missing — no proxy |
| `ear_fullness` | D.5 / D.9 profile modifiers | Missing — no proxy |

**The one proxy-acceptable flag:**

| `nocturnal_clenching` | D.12 resting position profile modifier | Encoded as `tmj_morning_soreness` — sufficient proxy. Doc 8 D.12 modifier already references morning soreness as the surfacing symptom. |

**Decision:** silent omission. No Phase 1 backfill, no schema additions.

The five missing-flag profile modifier blocks DO NOT RENDER for any
member. Exercise content still renders in full — only the personalisation
block tied to the missing flag is omitted. Every member still gets the
full exercise instructions, demonstration video, mechanism explanation,
and complete button.

`nocturnal_clenching` modifier on D.12 reads `tmj_morning_soreness` as
its trigger. Doc 8 D.12 prose for this modifier already aligns with
morning soreness phrasing.

**Implementation requirement for M13m, M13n, M13s, M13t, M13v:**

Profile modifier rendering must defensively handle missing flag columns.
The pattern is optional chaining with fallback to "block omitted",
not "throw on missing column read":

```typescript
// Pattern — modifier renders only if flag is true
{phase1.tmj_masseter_tenderness === true && (
  <ProfileModifier title="Masseter Tenderness Confirmed">
    {/* modifier content */}
  </ProfileModifier>
)}

// For the five missing flags, the column reference resolves to
// `undefined`, the strict equality check fails, the modifier block
// is silently omitted. No error, no warning, no UI artifact.
```

Do NOT use `phase1.tmj_masseter_tenderness === undefined` to render
a placeholder. Do NOT log warnings. Do NOT surface the gap to the member.
Silent omission means silent — the member experience is identical to
that of a member who answered "no" on the question (had it been asked).

If pre-launch §1.x or Doc 8 references one of the five missing flags
in profile modifier copy that is otherwise required (e.g. a "this
modifier always renders" block tied to a missing flag), flag the conflict
and stop — do not invent a rendering rule. Escalate to Oliver.

This policy is closed for Phase 3 launch. Re-evaluate post-launch
once outcome data accumulates.

---

### P3-14. PROTOCOL ASSIGNMENT BOOLEANS — READ FROM phase1_assessment, NOT framework_progress

Document 13 §5.4 instructs the session construction algorithm to read
`tmj_protocol_assigned` and `cerv_protocol_assigned` from `framework_progress`.
**This is wrong.** Both columns live on `phase1_assessment`, not on
`framework_progress`. Verified during M13a Item 3 audit on 2026-04-28.

The earlier app code already reads protocol assignment from
`phase1_assessment` for existing functionality (Phase 1 → Phase 2
transition, dashboard rendering). Phase 3 session construction must do
the same.

**Correct read path for buildSessionExerciseList:**

```typescript
// Fetch in parallel on /session page load
const { data: phase1 } = await supabase
  .from('phase1_assessment')
  .select('profile_type, tmj_protocol_assigned, cerv_protocol_assigned, tmj_normalised_score, cerv_normalised_score, ...')
  .eq('user_id', userId)
  .single()

const { data: progress } = await supabase
  .from('framework_progress')
  .select('current_phase, protocol_option, resistance_phase_start, exercises_viewed, session_in_progress, nudges_dismissed, phase4_first_accessed, ...')
  .eq('user_id', userId)
  .single()

// In the algorithm:
const tmjAssigned    = phase1.tmj_protocol_assigned          // NOT progress.tmj_protocol_assigned
const cervAssigned   = phase1.cerv_protocol_assigned         // NOT progress.cerv_protocol_assigned
const protocolOption = progress.protocol_option              // ✓ on framework_progress
const resistanceStart= progress.resistance_phase_start       // ✓ on framework_progress
const currentPhase   = progress.current_phase                // ✓ on framework_progress
const profileType    = phase1.profile_type                   // ✓ on phase1_assessment
```

**Do NOT** add `tmj_protocol_assigned` or `cerv_protocol_assigned` columns
to `framework_progress` to match Doc 13 §5.4. The existing read path
from `phase1_assessment` is the canonical source. Adding duplicate columns
introduces sync risk (the two could drift) and Doc 13 itself §2.3 says
the booleans are written to `phase1_assessment` at profile generation
and "copied to framework_progress on Phase 1 completion" — but that copy
was never implemented and is not needed.

If Doc 13 §5.4 and this section conflict, this section wins.

---

### P3-15. PHASE 4 EXERCISES — EXPLICIT OPT-IN, NOT AUTO-APPEND

Document 13 §5.4 instructs the session construction algorithm to append
Phase 4 exercises to the daily session list when:

```
IF currentPhase = 4 OR frameworkProgress.phase4_first_accessed IS NOT NULL
  exercises.push(...getPhase4Exercises(phase1Assessment))
```

**This is wrong.** Auto-appending Phase 4 exercises to a member's
daily session because they navigated to Phase 4 content even once
makes the session length unpredictable, removes member agency, and
mistakes engagement (reading the content) for intent (practising the
exercise daily).

**Decision: Phase 4 exercises are added to the daily session only when
the member explicitly opts each one in.** The member reads Phase 4
content as supplementary material. On any Phase 4 exercise section,
an explicit "Add to my daily session" button appears. Tapping it
adds that exercise ID to the member's `phase4_exercises_added` array.
Tapping again ("Remove from daily session") removes it.

**Schema change required (first task of M13d):**

Add column to `framework_progress`:
- `phase4_exercises_added` JSONB NOT NULL DEFAULT `'[]'::jsonb`

The array stores Phase 4 exercise IDs the member has opted into
(e.g. `["F5_breath_work", "F8_neutralisation"]`). Default is empty —
no Phase 4 exercises appear in /session for any member by default,
regardless of `phase4_first_accessed` state.

**Correct read path for buildSessionExerciseList:**

```typescript
// At the end of buildSessionExerciseList, after release/resistance:

const phase4Added = progress.phase4_exercises_added ?? []
exercises.push(...phase4Added)

// Phase 4 exercises always appear last in the session list, after
// release and resistance work, in the order the member added them.
```

**What this means for the existing logic:**

- `phase4_first_accessed` timestamp is still recorded on first
  navigation per Doc 13 §7.5 — useful for analytics and contextual
  nudges, but does NOT drive session list inclusion
- `currentPhase = 4` does NOT auto-include Phase 4 exercises (Phase 4
  has no advancement gate per Doc 13 §7.5; there is no "Phase 4 daily
  session" concept distinct from Phase 3's session)
- The `getPhase4Exercises(phase1Assessment)` function referenced in
  Doc 13 §5.4 is NOT implemented. Phase 4 content render decisions
  (which exercises to show a member based on their Phase 1 flags)
  remain at the Phase 4 content layer, not the session-construction
  layer

**Implementation notes for Phase 4 build (later phase):**

- Each Phase 4 exercise section page checks `phase4_exercises_added`
  for its ID
- If present: button reads "Remove from my daily session"; on tap,
  remove ID from JSONB array
- If absent: button reads "Add to my daily session"; on tap, append
  ID to JSONB array
- Optimistic UI pattern (per Phase 2 lesson): local state updates
  immediately, POST fires in background, silent failure
- The button is on Phase 4 content sections only — Phase 3 release
  and resistance exercises are not opt-in, they are in `/session`
  by default per protocol assignment

**Rationale:** Phase 4 is supplementary, not mandatory. Some Phase 4
content is exercises (breath work, neutralisation), some is habits
(sleep position, workstation setup) that don't belong in `/session`
at all. Member agency over what they practice daily is preserved by
explicit opt-in. Default-empty preserves session length predictability
across all members.

If Doc 13 §5.4 and this section conflict, this section wins.

---

### P3-16. RESISTANCE PHASE — BOTH DRIVERS, REGARDLESS OF PROTOCOL OPTION

Document 13 §5.4 and Document 8 imply that Sequential (Option 1)
members in resistance phase see only their assigned driver's
resistance work plus the OTHER driver's release work as a delayed
add. This is wrong.

**Decision: once `resistance_phase_start IS NOT NULL`, both resistance
lists are appended to the daily session regardless of protocol_option
or which driver is assigned.** Sequential members converge with
Parallel and Prioritised Parallel members at the resistance phase
boundary.

**Logic in buildSessionExerciseList:**

```typescript
// Release-phase branching uses protocol_option (different per option)
// Resistance-phase appending is uniform across all options:

if (resistanceStart !== null) {
  if (cervAssigned) {
    exercises = [...exercises, ...buildCervRetainingList()]
  }
  if (tmjAssigned) {
    exercises = [...exercises, ...buildTmjResistanceList()]
  }
}
```

The protocol_assigned booleans (read from phase1_assessment per P3-14)
determine which resistance lists apply. For DUAL_DRIVER and
TMJ_PRIMARY_* / CERV_PRIMARY_* members on Option 3, both booleans are
true and both resistance lists append. For Option 1 single-driver
members, only their assigned driver's resistance list appends — they
do NOT pick up the other driver's release work as a delayed add.

**What this means for Sequential members:**

- TMJ_DOMINANT, Option 1, release phase: TMJ release only (7 IDs)
- TMJ_DOMINANT, Option 1, resistance phase: TMJ release + TMJ
  resistance (11 IDs)
- CERV_DOMINANT, Option 1, release phase: cervical release only (6 IDs)
- CERV_DOMINANT, Option 1, resistance phase: cervical release +
  cervical retraining (9 IDs)

The cervical/TMJ "other driver" never enters a Sequential member's
session — that's the whole point of choosing Sequential.

**What this means for Doc 8 D-series and E-series content:**

D.13 and E.12 resistance phase introduction copy may reference "the
other driver enters" or similar phrasing. This phrasing is wrong for
Sequential members and should NOT be authored into D.13 / E.12 content
in M13o / M13u. The acknowledge button on these sections triggers
resistance for the assigned driver only.

If Doc 13 §5.4 or Doc 8 D.13/E.12 conflict with this section, this
section wins.

---

### P3-17. SUSTAINED-PRESSURE TIMER DEFERRED TO POST-LAUNCH

Pre-launch §4.1 specifies a sustained-pressure timer for three exercises:
D5 temporalis release, D6 masseter release, E5 suboccipital tennis ball
release. The timer was intended to enforce 90-second holds (D5/D6) and
the 10-minute hold (E5) because members tend to under-time these.

**Decision: timer deferred to post-launch. Three exercises use the
standard CompleteButton with explicit time guidance in their content.**

**Rationale:**

- Members are already using a stopwatch for other timed exercises
  (E6/E7/E9 cervical stretches at 30s each, resistance phase holds).
  Adding a built-in timer for only three of twenty exercises creates
  inconsistency. Either every exercise has a guided timer or none do.
  None is the simpler ship.
- The timer is the most technically substantial component in M13
  (audio handling, state persistence, iOS quirks, cross-day staleness,
  mobile background-tab behaviour). Deferring removes that complexity
  from launch QA surface.
- Post-launch member data will reveal whether under-timing is actually
  a problem. If session logs show D6 completing in <60 seconds on
  average across members, the timer becomes evidence-driven; if not,
  it stays as a non-priority.
- The Exercise type's `timer: TimerConfig | null` field stays in place
  so a future build can populate it without schema changes.

**Build implications:**

- Delete /components/exercise/timer-slot.tsx (was a stub for M13f)
- Modify /components/exercise/exercise-view.tsx — remove the
  `exercise.timer !== null` branch, always render `<CompleteButton>`
- Exercise content for D5, D6, E5 (built in M13m and M13s) MUST include
  explicit time guidance:
  - D5: "Hold for 90 seconds at each position. Use your phone's
    stopwatch or count steady seconds. Three positions: front,
    middle, back of temporalis."
  - D6: same 90-second framing.
  - E5: "Lie on the ball for 10 minutes. Set a timer on your phone
    so you don't have to track time."
- The TimerConfig type in /content/exercises/_types.ts remains. All
  exercise content files in M13m, M13n, M13s, M13t, M13v MUST set
  `timer: null` for the present build.
- Pre-launch §4.1 timer section is documented as a post-launch
  enhancement, not part of the launch build.

**Post-launch path (NOT in scope for current M13 build):**

- Track per-exercise completion duration in session_logs
- After 4-8 weeks of post-launch data, evaluate whether members are
  under-timing D5/D6/E5
- If yes: build a sustained-pressure timer feature (what was M13f)
  and replace the CompleteButton with it for those three exercises
- If no: the explicit time guidance in copy is sufficient

**Sub-step plan change:**

- M13f (sustained-pressure timer) is removed from the M13 plan
- M13 total sub-steps: 24 (was 25)
- Sub-steps continue at M13g (next sub-step)

If pre-launch §4.1 and this section conflict, this section wins.

---

### P3-18 — /session card interaction model: active card only

**Doc 12 §6.6 says:** "Tapping a card expands it in place to show exercise content. All other cards remain visible. Expanded card shows content and Complete button."

**Decision:** In the M13g /session implementation, ONLY the active card is interactive and expanded. Completed and upcoming cards are read-only — no onClick, no expand-on-tap behaviour.

**Rationale:** Allowing arbitrary expand on upcoming cards adds state-management complexity (multi-card expansion, scroll position tracking, completion order ambiguity) without serving the daily-session use case. Members work through exercises in order — they don't skip ahead. Letting them peek at upcoming exercises mid-session creates more friction than value, and "tap to expand a completed card to review what was just done" is a niche use case better served by the exercise library.

**Implementation:** Active card renders <ExerciseView>. Completed cards render checkmark + struck-through name. Upcoming cards render exercise name only. No click handlers on completed or upcoming cards.

**Reversibility:** This decision can be reversed by adding click handlers and per-card expand state to SessionClient. The data flow already supports it (each card gets a unique ID, ExerciseView is stateless). If member feedback indicates expand-on-tap is wanted post-launch, ~20 lines of additional state in SessionClient covers it.

---

### P3-19 — framework_progress schema drift from Doc 7

Doc 7 §2.x (framework_progress table definition) does not match the live
production schema. Where Doc 7 and the live database conflict, the live
database is the authority.

Specific drifts confirmed via information_schema query against
stp-v2-eight (production):

1. **`started_at` does not exist; `phase_started_at` exists in its place.**
   Doc 7 says `started_at TIMESTAMPTZ NOT NULL DEFAULT now()`.
   Live DB has `phase_started_at TIMESTAMPTZ NULL DEFAULT NULL`.
   Both the column name AND the constraints differ.

2. **`protocol VARCHAR NULL` exists in the live DB but not in Doc 7.**
   No code reads or writes this column anywhere in the codebase. Probable
   leftover from an early build iteration. Not removed in this errata
   to avoid scope creep — flag for a future cleanup sub-step.

3. **`phase2_habits_acknowledged JSONB NOT NULL DEFAULT '{}'`** exists
   in the live DB. Added in migration 20260426000000. Not in Doc 7.
   Used by Phase 2 advancement flow — keep.

4. **`phase3_first_accessed TIMESTAMPTZ NULL`** exists in the live DB.
   Added in migration 20260427000000. Not in Doc 7. Used for Phase 3
   nudge logic. Keep.

5. **`phase4_exercises_added JSONB NOT NULL DEFAULT '[]'`** exists in the
   live DB. Added in migration 20260428000000 per errata P3-15. Not in
   Doc 7 directly but documented in P3-15. Keep.

**Decision:** Doc 7 is non-authoritative for framework_progress. The
canonical schema is the live database state. When writing any code that
reads framework_progress, run a Supabase information_schema query against
`framework_progress` first or grep an existing code reference; do not
trust Doc 7's column list.

**Forward-looking remediation in M13i.A:**
- Apply NOT NULL DEFAULT now() to phase_started_at (matching Doc 7's intent)
- Backfill the 8 existing seeded rows with sensible phase_started_at values
- Update the seed script to populate phase_started_at explicitly per user

The `protocol` dead column is NOT addressed in M13i.A — flagged for
post-launch cleanup.

---

### P3-20 — Dashboard silent-fail mode on schema-mismatched .select()

**Symptom:** All seeded test users rendered the dashboard as Phase 1
("Day 1 — Identification / P1 ACTIVE") regardless of their actual
current_phase value.

**Root cause:** /app/dashboard/page.tsx line 27 selected `started_at`
from framework_progress. The column does not exist (per P3-19) — it is
named `phase_started_at`. Postgres returned error 42703 ("column does
not exist"). Supabase's JS client returned `data: null, error: <object>`.

The dashboard read `progress?.current_phase ?? 1` and fell through to
the default `1` without any error path. The phase status, dayLine,
welcomeHeading, sessionHref, and PhaseProgressionCard all rendered as
if the user were a brand-new Phase 1 member.

**Discovery context:** Surfaced during M13h verification. The dashboard
had been silently broken for every seeded user since the column was
either renamed or never created in line with Doc 7.

**Fix in M13i.A:**
1. Change the dashboard select from `started_at` → `phase_started_at`
2. Update the destructured field name and downstream variable references
3. Add explicit error logging when the framework_progress fetch returns
   an error, so silent-fail cannot recur.

**Lessons-learned forward rule:**
Any new dashboard or server-component query against framework_progress
or other production tables must be tested against the live schema before
merge. Supabase's JS client does NOT throw on missing columns — it
returns null data and a populated error field. If error-handling is
absent, the dashboard will silently render defaults.

This pattern (silent fall-through on null fetched data) is a known
launch-blocker risk for any future page that fetches member data without
explicit error logging. Audit other server components for the same
pattern before launch.

---

### P3-21. RESISTANCE PHASE — REDUCED SECONDARY LISTS FOR _WITH_SECONDARY PROFILES ON OPTION 3

**Supersedes:** P3-16 for Option 3 `_WITH_SECONDARY` profiles only. P3-16 still governs all
other profile types and all other protocol options.

**Problem:** `TMJ_PRIMARY_WITH_SECONDARY` and `CERV_PRIMARY_WITH_SECONDARY` members on Option 3
(Prioritised Parallel) were receiving the full resistance list for their secondary driver,
which is disproportionate given that the secondary protocol has reduced emphasis during release.

**Decision:** For Option 3 `_WITH_SECONDARY` profiles in the resistance phase:
- `TMJ_PRIMARY_WITH_SECONDARY` → full TMJ resistance + **reduced** cervical retraining (E13, E14 only — E15 excluded)
- `CERV_PRIMARY_WITH_SECONDARY` → full cervical retraining + **reduced** TMJ resistance (D14, D15 only — D17 excluded even if gating flags are set)

`_STRONG_SECONDARY`, `DUAL_DRIVER`, and single-driver profiles continue to receive full lists per P3-16.

**New builder functions in `lib/session/build-session.ts`:**

```typescript
export function buildReducedCervRetainingList(profileType: string): string[] {
  if (profileType === 'TMJ_PRIMARY_WITH_SECONDARY') {
    return ['E13_deep_cervical_flexor_training', 'E14_cervical_rotation_holds']
  }
  return []
}

export function buildReducedTmjResistanceList(profileType: string): string[] {
  if (profileType === 'CERV_PRIMARY_WITH_SECONDARY') {
    return ['D14_jaw_symmetry_retraining', 'D15_progressive_resistance']
  }
  return []
}
```

**Updated resistance branch in `buildSessionExerciseList`:**

```typescript
if (resistanceStart !== null) {
  if (protocolOption === 3 && profileType === 'TMJ_PRIMARY_WITH_SECONDARY') {
    exercises = [...exercises, ...buildTmjResistanceList(phase1)]
    exercises = [...exercises, ...buildReducedCervRetainingList(profileType)]
  } else if (protocolOption === 3 && profileType === 'CERV_PRIMARY_WITH_SECONDARY') {
    exercises = [...exercises, ...buildCervRetainingList()]
    exercises = [...exercises, ...buildReducedTmjResistanceList(profileType)]
  } else {
    if (cervAssigned) exercises = [...exercises, ...buildCervRetainingList()]
    if (tmjAssigned) exercises = [...exercises, ...buildTmjResistanceList(phase1)]
  }
}
```

**Session count impact:**
- C8 (TMJ_PRIMARY_WITH_SECONDARY + Option 3 + resistance + D.17): 13 IDs → 12 IDs
- C20 (CERV_PRIMARY_WITH_SECONDARY + Option 3 + resistance): 12 IDs
- All other existing test cases: unchanged

---




### P3-22. TFI PHASE 5 CAPTURE — REVISED TRIGGER, PLACEMENT, AND COMPLETION FLOW (2026-05-07)

**Supersedes:** Doc 13 §5.1 and Doc 12 wherever they describe TFI Phase 5 trigger conditions
or Phase 5 completion gating.

**Changes from original design:**

1. **Capture point renamed:** `'completion'` → `'phase5_completion'` in `tfi_responses.capture_point`,
   `framework_progress.tfi_dismissals` keys, all API routes, and all client types.
   If any `capture_point = 'completion'` rows exist in production, run:
   ```sql
   UPDATE tfi_responses SET capture_point = 'phase5_completion' WHERE capture_point = 'completion';
   ```

2. **New trigger condition for Phase 5 TFI card** (replaces `phase5_completed_at IS NOT NULL`):
   - `current_phase = 5`
   - AND no `tfi_responses` row with `capture_point = 'phase5_completion'`
   - AND no `'phase5_completion'` key in `tfi_dismissals`
   - AND there EXISTS a `tfi_responses` row with `capture_point = 'intake'`

   The fourth condition is mandatory. An endpoint TFI without an intake baseline has no
   research value for before/after analysis. Members who dismissed intake are excluded.

3. **New display surface:** TFI Phase 5 card now appears at the top of `/framework/phase-5`
   (in addition to `/tracker`) from the moment the member enters Phase 5. One dismissal
   on either surface sets `tfi_dismissals['phase5_completion']` and removes the card
   from both surfaces.

4. **Phase 5 completion is now self-attested:** An "I've finished the framework" button
   at the bottom of `/framework/phase-5` calls `markPhase5Complete()` directly. Members
   do not need to acknowledge every reading to mark completion. The existing G.8 path
   (`marksPhaseCompleteFlag`) still works and is now idempotent (won't double-fire email).

5. **Shared TFI card component:** `components/tfi/TfiCaptureCard.tsx` is the single source
   for TFI card rendering on both /tracker and /framework/phase-5. Updated copy:
   - Intake heading: "Tinnitus Functional Index" (was "Help future members")
   - Dismiss: "Skip for now" text button (was X icon)

6. **`markPhase5Complete` is now idempotent and throws on DB error:**
   Checks `phase5_completed_at` before writing — no-op if already set. Throws so
   `Phase5CompleteButton` can surface the failure to the member.

---

### Doc 13 §2.2 — Profile Classification Divergences

**Status:** Approved. Doc 13 §2.2 should be updated to match.

The Doc 13 §2.2 pseudocode contained four gaps where real score
combinations fell through all named branches and hit the fallback,
producing incorrect single-driver classifications for members with two
meaningful drivers. All four were identified by exhaustive enumeration
of all 806 integer-raw-score combinations (TMJ raw 0–30, CERV raw 0–25)
and approved for implementation.

**Divergence 1 — Both-high dual driver (addition to spec)**

Doc 13 §2.2 has no branch for the case where both normalised scores
exceed SINGLE_DRIVER_HIGH_THRESHOLD (60). The dual-driver branch that
follows requires |diff| <= DUAL_DRIVER_MAX_DIFFERENCE (15), which
correctly rejects mixed-range pairs like (80, 35). But a pair like
(73.33, 92.00) — gap 18.67 — passed both single-driver checks (neither
score was below 20) and failed dual-driver (gap > 15), then fell to the
fallback and was returned as CERV_DOMINANT.

Fix: added a pre-check immediately after the single-driver branches —
if both tmjNorm > 60 AND cervNorm > 60, return DUAL_DRIVER regardless
of gap. Real example: the first member to complete Phase 1 received
CERV_DOMINANT with a 73.33 TMJ score and 6 confirmed jaw findings.

**Divergence 2 — Dual driver: strict > 30 changed to >= 30**

Doc 13 uses strict `>` on both scores for the dual-driver check
(`tmjNorm > DUAL_DRIVER_MIN_SCORE AND cervNorm > DUAL_DRIVER_MIN_SCORE`).
A score of exactly 30 (TMJ raw 9/30, CERV raw 7.5/25 — the latter not
reachable; TMJ raw 9 is reachable) fell between this branch and the
primary-with-secondary branch (which required secondary < 30 strict).
Score pairs like (45, 30) with diff <= 15 were returned as TMJ_DOMINANT
via fallback instead of DUAL_DRIVER.

Fix: both sides of the dual-driver check changed to `>=`.

**Divergence 3 — Primary-strong-secondary: lead >= 50 and MAX 50 → 60**

Doc 13 uses `tmjNorm > PRIMARY_STRONG_SECONDARY_LEAD (> 50)` and caps
the secondary at `<= PRIMARY_STRONG_SECONDARY_MAX (was 50)`.

3a. A lead score of exactly 50 (TMJ raw 15/30) with a secondary of 32
    and diff of 18 (> 15, so not dual) fell to the fallback and was
    returned as TMJ_DOMINANT. Fix: lead check changed to `>= 50`.

3b. A secondary score of 51–60 exceeded the old MAX of 50 but was not
    close enough to the lead for dual-driver (gap > 15). Fix:
    PRIMARY_STRONG_SECONDARY_MAX raised from 50 to 60 in
    scoring-thresholds.ts. The both-high check (Divergence 1) handles
    the case where secondary exceeds 60, so no overlap is introduced.

**Divergence 4 — Primary-with-secondary: secondary < 30 changed to <= 30**

Doc 13 uses strict `<` for the secondary bound in the primary-with-
secondary branch (`cervNorm < PRIMARY_STRONG_SECONDARY_MIN`, i.e. < 30).
Combined with Divergence 2's original `>` on the dual-driver check, a
secondary score of exactly 30 sat in a dead zone — excluded from dual
(not > 30) and excluded from primary-with (not < 30) — and fell to the
fallback. Fix: secondary bound changed to `<= DUAL_DRIVER_MIN_SCORE`
(<= 30) on both the TMJ-primary and CERV-primary branches.

**Verification**

All 806 integer-raw-score combinations (TMJ raw 0–30, CERV raw 0–25)
were enumerated programmatically. After all four fixes, no combination
where both scores >= 30 reaches the fallback. The fallback is now only
reachable when one score is below PROTOCOL_ASSIGNMENT_MINIMUM (< 20),
in which case the fallback correctly returns the non-negligible driver
as dominant (which is also what the single-driver checks would return
if the lead cleared > 60; the fallback handles the case where it does
not).

**Validation**

14-case pass/fail script: `npx tsx scripts/validate-classification.ts`
Result: 14/14 PASS (2026-05-06)

Files changed:
- `lib/scoring/classify.ts` — operator changes + pseudocode comment updated
- `content/scoring-thresholds.ts` — PRIMARY_STRONG_SECONDARY_MAX: 50 → 60

---

---

## P3-23 — Community space "Introduce Yourself" renamed to "Your Journey" (2026-05-07)

**Doc 12 §X.X — Community section "Introduce Yourself" replaced with "Your Journey".**

Broader scope covers intros, setbacks, plateaus, and mixed updates. Introduction-only sections
are underused in practice; members tend to lurk first and post first in a content section.
Setback and plateau content needs a designated home for member retention.

Slug change: `'introduce-yourself'` → `'your-journey'`

Migration required in Supabase SQL editor (or via `supabase db push`):
`supabase/migrations/20260507000002_community_rename_introduce_yourself_space.sql`

Files changed:
- `content/community-spaces.ts` — slug, name, description
- `app/community/_components/SpacesList.tsx` — SPACE_ICONS key
- `lib/community/__tests__/queries.test.ts` — slug reference

The hand/wave (Hand) icon is kept. If a footsteps/path icon is preferred in future,
update SPACE_ICONS key `'your-journey'` in SpacesList.tsx.

---

*Built to help people. Designed to last.*
*SOMATIC TINNITUS PROJECT — V2 Errata & Build Instructions*
