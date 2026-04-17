# Somatic Tinnitus Project — V2

## Critical — Read This First

Before doing anything else in any session, read ERRATA_AND_BUILD_INSTRUCTIONS.md
at the project root. That document overrides all other documents on any point
where they conflict.

## Skills

Skill files are in /skills/. Read the relevant skill before starting work in each area:

- Every session: /skills/git-conventions.md
- Any UI or component work: /skills/design-system.md
- Any database, auth, or API route work: /skills/supabase-rls.md
- Phase E and any framework/scoring work: /skills/scoring-content-architecture.md
- Phase H and any Stripe work: /skills/stripe-safety.md

A structured five-phase rehabilitation platform for somatic tinnitus. Members complete a deep assessment, work through a guided framework, track daily progress, and access an exercise library.

## Stack

- **Framework:** Next.js 15 (App Router)
- **Database + Auth:** Supabase (`@supabase/ssr` — never `@supabase/supabase-js` directly)
- **Styling:** Tailwind CSS (custom tokens only — see below)
- **Deployment:** Vercel
- **Payments:** Stripe Elements
- **Email:** EmailOctopus
- **Video:** Cloudflare Stream
- **Error monitoring:** Sentry (final week only)

## The Single Most Important Rule

**Import all design tokens from `/content/design-tokens.ts`. Never hardcode any colour, spacing, or font value anywhere in the codebase.**

## Project Structure

```
/app                  — Next.js App Router pages and API routes
/components           — Reusable UI components
/content
  /design-tokens.ts   — All design tokens (single source of truth)
  /scoring-thresholds.ts — All scoring constants (never hardcode thresholds)
  /framework          — Phase 1–5 content as TypeScript constants
  /exercises          — Exercise library content as TypeScript constants
/lib                  — Supabase client setup, utilities
middleware.ts         — Auth and membership route protection
```

## Three Shells — Never Build Outside These

Every page uses exactly one of three layout shells. Never rebuild shell logic inside a page file.

- `AuthShell` — all authenticated member pages (dashboard, tracker, framework, etc.)
- `OnboardingShell` — the five-step onboarding sequence
- `PublicShell` — unauthenticated pages (homepage, login, signup, test, results)

## Design Tokens (Quick Reference)

Full token definitions in `/content/design-tokens.ts` and `tailwind.config.js`.

| Token | Value | Usage |
|---|---|---|
| `background` | #F8F7F4 | Page background everywhere |
| `primary` | #4A9B8E | Buttons, links, active states |
| `primary-hover` | #3D8578 | Button hover |
| `surface` | #FFFFFF | Cards, modals, inputs |
| `surface-raised` | #F2F0EC | Nested panels, skeletons |
| `surface-dark` | #1C1C1C | Dark headers only |
| `text-heading` | #1A1A2E | Page and section headings |
| `text-body` | #2D2D2D | All body copy |
| `text-muted` | #6B7280 | Secondary text, labels |
| `border` | #E5E3DF | All borders and dividers |
| `error` | #C0392B | Validation errors only |
| `error-tint` | #FEF3F2 | Error backgrounds |
| `metric-jaw` | #E07B4F | Jaw tension chart line |
| `metric-neck` | #7B6FAB | Neck tension chart line |
| `metric-stress` | #D4A843 | Stress chart line |
| `metric-sleep` | #5B8DB8 | Sleep quality chart line |

Font: **Inter** (Google Fonts). All inputs minimum 16px — never below, prevents iOS zoom.

## Supabase Rules

- Client components: use `createBrowserClient` with `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Server components and API routes: use `createServerClient`
- Elevated operations (webhooks, founding member seeding): use `SUPABASE_SERVICE_ROLE_KEY` — server-side only, never prefix with `NEXT_PUBLIC_`, never return from an API route
- RLS is enabled on every table — all policies scope data to `auth.uid()`
- `past_due` membership status allows full access. Only `cancelled` blocks access.
- `is_founding_member = TRUE` means Stripe is never queried for that member — anywhere, ever

## Content Architecture Rules

- All framework content lives in `/content/framework/*.ts` as TypeScript constants
- All exercise content lives in `/content/exercises/*.ts` as TypeScript constants
- All scoring thresholds are named exports from `/content/scoring-thresholds.ts`
- **The database never stores member-facing text.** It stores position, flags, and progress state only.
- No admin panel — framework content is updated via GitHub push, DB content via Supabase table editor

## Community Rules

- Every community query **must** include `WHERE is_deleted = FALSE` — no exceptions
- Never hard delete `community_posts` or `community_replies` — soft delete only (`is_deleted = TRUE`)
- Oliver's posts and replies: `is_admin = TRUE` renders `OLIVER · FOUNDER` badge
- Avatar colours: `charCode of first username character % 6` → `avatar-1` through `avatar-6`

## Mobile Rules

- Minimum touch target: 44×44px
- All inputs: `font-size: 16px` minimum (iOS zoom prevention — enforced in globals.css)
- Test on actual device — never rely on browser resize
- Force light mode always — both required:
  ```css
  /* globals.css */ :root { color-scheme: light; }
  ```
  ```html
  <!-- layout.tsx --> <meta name="color-scheme" content="light" />
  ```

## Code Style

- Tailwind utility classes only — no inline styles, no CSS modules
- Small focused components — one responsibility per component
- Descriptive variable names throughout
- Brief comment above any non-obvious logic
- Before any significant function: one line explaining what it does and why

## Dev Commands

```bash
npm run dev          # Start development server (localhost:3000)
npx tsc --noEmit     # Type check without building
npm run build        # Production build (run before deploying)
```

## Schema Correction (Critical)

`cerv_floor_relief_test` is **VARCHAR(10)**, not BOOLEAN.
Valid values: `'clear'` (3pts), `'slight'` (1pt), `'none'` (0pts). NULL = 0pts.

## Build Reference

Build phases A–K and all handoff prompts are in **Document 15**.
Open Document 15 at the start of every phase. Use the session reset template at the start of every session after the first.
"Errata and corrections are in ERRATA_AND_BUILD_INSTRUCTIONS.md at project root. Read this before Document 15 on every phase."