---
name: supabase-rls
description: Somatic Tinnitus Project Supabase rules, RLS policies, and database patterns. Use when writing any database query, API route, server-side Supabase call, auth logic, middleware, or when working with any database table.
---

# Somatic Tinnitus Project — Supabase & RLS Rules

## Client Setup Rules

Always use `@supabase/ssr` — never `@supabase/supabase-js` directly.

```typescript
// Server component or API route
import { createServerClient } from '@supabase/ssr'

// Client component
import { createBrowserClient } from '@supabase/ssr'
```

Two keys — use the correct one for the context:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — client-side and standard server components. Subject to RLS.
- `SUPABASE_SERVICE_ROLE_KEY` — server-side API routes only for elevated operations.
  Bypasses RLS. **Never prefix with NEXT_PUBLIC_. Never pass to client. Never return from an API route.**

Use service role key for: webhook handlers, founding member check, membership creation,
EmailOctopus add-to-list, seeding scripts.

---

## Schema Correction — Critical

`cerv_floor_relief_test` is **VARCHAR(10)** not BOOLEAN.
Valid values: `'clear'` (3pts), `'slight'` (1pt), `'none'` (0pts). NULL = 0pts.

---

## Complete Table List — 11 Tables

The schema has 11 tables total. Document 7 defines the first 7. Document 12 adds 4 more.

1. `users` — identity, intake test scores, computed classification
2. `phase1_assessment` — deep assessment data, profile output
3. `progress_logs` — daily tracker submissions
4. `triggers` — reference table for trigger tag options
5. `progress_log_triggers` — junction: logs to trigger selections
6. `framework_progress` — phase/session position, protocol assignment, JSONB state
7. `memberships` — membership state and Stripe data
8. `founding_member_emails` — pre-launch seeded, server-side only
9. `consents` — health data and research consent (Doc 12 §2.5)
10. `session_logs` — completed daily session records (Doc 12 §6.12)
11. `community_posts` — community post content
12. `community_replies` — community reply content

Additional columns added by Doc 12 on existing tables:
- `users`: `onboarding_completed`, `onboarding_step`, `is_admin`
- `framework_progress`: `exercises_viewed`, `session_in_progress`, `nudges_dismissed`,
  `resistance_phase_start`, `phase4_first_accessed`, `phase5_outcome_type`

---

## RLS Policies Per Table

### users
- SELECT: `auth.uid() = id`
- UPDATE: `auth.uid() = id`
- INSERT: service role only (created via API route on signup)
- DELETE: service role only

### phase1_assessment
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- DELETE: service role only

### progress_logs
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- DELETE: service role only

### progress_log_triggers
- SELECT: `EXISTS (SELECT 1 FROM progress_logs WHERE id = log_id AND user_id = auth.uid())`
- INSERT: same EXISTS check
- DELETE: same EXISTS check (also handled by CASCADE from progress_logs)

### triggers (reference table)
- SELECT: all authenticated members (public read — no sensitive data)
- INSERT/UPDATE/DELETE: service role only

### framework_progress
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- DELETE: service role only

### memberships
- SELECT: `auth.uid() = user_id`
- INSERT: **service role only** — members never insert their own membership row
- UPDATE: **service role only** — status updates only via Stripe webhook handler
- DELETE: service role only

⚠️ The memberships INSERT and UPDATE being service-role-only is the most security-sensitive
policy in the schema. Verify explicitly: attempt to INSERT a memberships row from the client
with a valid session and confirm it is rejected.

### founding_member_emails
- SELECT: service role only
- INSERT: service role only (seeded before launch)
- UPDATE: service role only (sets claimed = TRUE on founding member signup)
- DELETE: service role only

This table is never exposed to the client under any circumstances.

### consents
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- DELETE: service role only

### session_logs
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: service role only
- DELETE: service role only

### community_posts
- SELECT: authenticated members can read all posts WHERE `is_deleted = FALSE`
- INSERT: `auth.uid() = user_id`
- UPDATE: **service role only** — soft delete (is_deleted) and pin (is_pinned) are handled
  server-side via API routes, not direct client updates
- DELETE: service role only — never hard delete, always soft delete

### community_replies
- SELECT: authenticated members can read all replies WHERE `is_deleted = FALSE`
- INSERT: `auth.uid() = user_id`
- UPDATE: **service role only** — soft delete handled server-side
- DELETE: service role only — never hard delete

---

## Community Query Rule — Mandatory

**Every single query on community_posts or community_replies must include WHERE is_deleted = FALSE.**
No exceptions. A query without this filter is a bug.

```typescript
// Correct
const { data } = await supabase
  .from('community_posts')
  .select('*')
  .eq('space', spaceSlug)
  .eq('is_deleted', false)   // ← mandatory
  .order('created_at', { ascending: false })

// Wrong — missing is_deleted filter
const { data } = await supabase
  .from('community_posts')
  .select('*')
  .eq('space', spaceSlug)
```

---

## Middleware Pattern

Order matters. Apply checks in this exact sequence:

```typescript
// middleware.ts
// 1. Static assets and API routes — allow through immediately
// 2. Public routes (/, /login, /signup, /reset-password, /terms, /privacy, /test) → allow
// 3. No session → redirect to /login (store requested URL in redirectAfterLogin cookie, maxAge 300s)
// 4. /onboarding/* and /subscription → always allow authenticated users through
// 5. onboarding_completed = FALSE → redirect to /onboarding
// 6. membership row missing → redirect to /onboarding
// 7. status = 'cancelled' AND is_founding_member = FALSE → redirect to /subscription
// 8. All other authenticated requests → allow through

// IMPORTANT: past_due passes through to all routes — never blocked
// Only cancelled blocks access
```

Founding member check in middleware:
```typescript
if (membership.is_founding_member === true) {
  return NextResponse.next()  // never check Stripe status for founding members
}
```

---

## Founding Member Rule

`is_founding_member = TRUE` means Stripe is **never** queried for that member. Not on login,
not on middleware, not on dashboard load, not on any feature access check. Zero Stripe calls
for founding members, anywhere in the codebase.

---

## Founding Member Email Check — Use .maybeSingle()

```typescript
// Correct — .maybeSingle() returns null data (not error) when no row found
const { data: foundingRow } = await supabaseServiceRole
  .from('founding_member_emails')
  .select('claimed')
  .eq('email', cleanEmail)
  .maybeSingle()

// foundingRow === null → not a founding member → paid member path
// foundingRow.claimed === false → founding member, not yet claimed → set is_founding_member = TRUE
// foundingRow.claimed === true → already claimed → return duplicate account error
```

Never use `.single()` for this query — it throws an error when no row is found, which is
the normal case for most signups.

---

## Two-Account RLS Test

Run before marking any phase complete:

1. Sign in as Account A. Create progress logs and Phase 1 assessment data.
2. Sign in as Account B.
3. Attempt to read Account A's `progress_logs`, `phase1_assessment`, `framework_progress`,
   `memberships` via direct Supabase queries.
4. All must return empty or error. Any data returned = RLS is broken.

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` in a client component | Service role in API routes only. Use anon key client-side. |
| `.single()` when row may not exist | Use `.maybeSingle()` — returns null, not error, on no rows |
| RLS policy column name mismatch | Check exact column name — `id` on users table, `user_id` on all others |
| Forgetting to enable RLS on a new table | RLS is disabled by default. Enable explicitly after every CREATE TABLE. |
| Reading session client-side on first render | Always read session server-side and pass as prop. Avoids hydration mismatch. |
| Not awaiting cookies() | App Router requires `await cookies()` in server components and API routes |
| Community query missing is_deleted filter | Every community query must include `.eq('is_deleted', false)` |
