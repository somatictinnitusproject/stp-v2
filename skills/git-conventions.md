---
name: git-conventions
description: Somatic Tinnitus Project git commit conventions. Use whenever making a git commit, creating a branch, or writing a pull request description.
---

# Somatic Tinnitus Project — Git Conventions

## Commit Message Format

```
type(scope): short description

Optional body — what and why, not how. Wrap at 72 characters.
```

## Types

| Type | When to use |
|---|---|
| `feat` | New feature or component |
| `fix` | Bug fix |
| `chore` | Setup, config, tooling, dependencies |
| `style` | Visual/styling changes only, no logic change |
| `refactor` | Code restructure, no behaviour change |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `wip` | Work in progress — end of session commit, incomplete |

## Scopes — Use Phase or Feature Name

| Scope | Covers |
|---|---|
| `phase-a` through `phase-k` | Build phase work |
| `auth` | Authentication and session |
| `onboarding` | Onboarding flow |
| `dashboard` | Dashboard components |
| `tracker` | Progress tracker |
| `analytics` | Analytics page |
| `framework` | Framework content system |
| `phase1` | Phase 1 assessment specifically |
| `exercise-library` | Exercise library |
| `community` | Community feature |
| `stripe` | Payment integration |
| `email` | EmailOctopus integration |
| `db` | Database schema or migrations |
| `rls` | RLS policies |
| `middleware` | Next.js middleware |
| `config` | Project configuration |
| `content` | Content TypeScript files in /content |

## Examples

```
feat(phase-a): initialise Next.js project with Supabase and Tailwind
chore(db): apply complete schema — all 11 tables with RLS policies
feat(auth): build signup flow with founding member email check
fix(tracker): correct duplicate submission handling edge case
feat(phase1): implement TMJ module progressive scoring
chore(stripe): complete Stripe dashboard setup before payment build
feat(analytics): suppress correlation insights before 14-log threshold
fix(rls): scope progress_logs select to auth.uid()
wip(framework): phase 1 assessment UI — TMJ module complete, cervical in progress
```

## Branch Naming

```
phase-[letter]/[short-description]
fix/[short-description]
```

Examples:
```
phase-a/environment-and-database
phase-b/auth-and-onboarding
phase-e1/phase1-assessment-scoring
phase-e2/phase2-content
fix/tracker-streak-calculation
fix/founding-member-payment-bypass
```

## Before Every Commit

- Verify `.env.local` is in `.gitignore` and not staged
- Run `git status` and scan every staged file for API keys, tokens, or secrets
- No `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  or `EMAILOCTOPUS_API_KEY` in any staged file
- If a secret was accidentally staged: unstage it immediately, rotate the key,
  assume it is compromised regardless of whether the repo is public or private

```bash
# Check .gitignore contains .env.local before adding any secrets
cat .gitignore | grep .env
# Must show: .env.local
```

## Push to GitHub

Push at the end of every session — even if work is incomplete. This is the recovery
point if something goes wrong. Use `wip(scope): description` if work is mid-flight.

Push before opening a new Claude Code session within a phase. The session reset template
in Document 15 Section 3 assumes the previous session's work is already pushed.

## Session End Checklist

1. Run `npx tsc --noEmit` — fix any TypeScript errors before committing
2. Stage and commit with appropriate type and scope
3. Push to GitHub
4. Fill in the "Last session" and "Next task" fields of the Document 15 session reset
   template while context is fresh — paste it at the top of the next session
