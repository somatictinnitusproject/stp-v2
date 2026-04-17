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

*Built to help people. Designed to last.*
*SOMATIC TINNITUS PROJECT — V2 Errata & Build Instructions*
