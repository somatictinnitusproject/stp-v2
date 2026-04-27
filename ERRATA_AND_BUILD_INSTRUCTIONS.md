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

- `post_low_screen_positioning`
- `ctx_stomach_sleeping` (also tracked under E21)
- `post_bag_carrying`
- `tmj_jaw_posture_habits`

Type 2 — Habit referenced by Doc 8 Phase 2 system notes, no Phase 1
question specified anywhere in Doc 8:

- `gum_chewing` (Doc 8 P2 C.2 H3 system note assumes column; no Doc 8 P1
  capture mechanism specified)
- `object_chewing` (Doc 8 P2 C.2 H4 — same)
- `phone_shoulder` (Doc 8 P2 C.2 H7 — same)

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
- C.3, C.4 (M12d): same approach — per-habit labels fire only where
  Phase 1 capture supports them. Decisions documented per-habit when
  those sub-steps land.
- Flag-check helpers (`getC2HabitFlag` and equivalents in C.3/C.4)
  annotate permanently-silent habits with `// PERMANENT — no Phase 1
  capture per E23 design decision`.

**No further action required.** This is not a pre-launch fix item.

---

*Built to help people. Designed to last.*
*SOMATIC TINNITUS PROJECT — V2 Errata & Build Instructions*
