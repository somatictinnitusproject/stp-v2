// C.9 — Phase 2 → Phase 3 Transition Screen
// Source: Document 8 Part C section C.9. Verbatim member-facing prose.
//
// Displayed once on first Phase 3 entry only — subsequent logins go
// directly to Phase 3 current session.
//
// The [jaw / cervical / jaw and cervical] placeholder in the body is
// filled from the member's profile_type via mapProfileTypeToTransitionCallback.

import type { ProfileType } from '@/lib/scoring'

// ── Content types ────────────────────────────────────────────────────────────

export type C9Transition = {
  headline: string
  bodyParagraph1: string
  bodyParagraph2Template: string  // contains {profileCallback}
  ctaLabel: string
}

// ── Content constant ──────────────────────────────────────────────────────────

export const C9_TRANSITION: C9Transition = {
  headline: 'Your foundations are in place.',
  bodyParagraph1:
    'You\u2019ve worked through the habits, diet, and sleep foundations ' +
    'that clear the path for effective protocol work. Phase 3 begins now.',
  bodyParagraph2Template:
    'What follows is the targeted intervention \u2014 the specific ' +
    'release and retraining work aimed directly at your ' +
    '{profileCallback} driver pathway. This is where the primary work happens.',
  ctaLabel: 'Begin Phase 3',
}

// ── Profile-type → callback string ──────────────────────────────────────────
//
// Maps profile_type to the [jaw / cervical / jaw and cervical] phrase
// used in body paragraph 2. Returns 'jaw and cervical' as a safe
// fallback if profile_type is null/undefined or unrecognised — covers
// all 7 profile types.

export function mapProfileTypeToTransitionCallback(
  profileType: ProfileType | null | undefined,
): string {
  if (!profileType) return 'jaw and cervical'
  switch (profileType) {
    case 'TMJ_DOMINANT':
    case 'TMJ_PRIMARY_STRONG_SECONDARY':
    case 'TMJ_PRIMARY_WITH_SECONDARY':
      return 'jaw'
    case 'CERV_DOMINANT':
    case 'CERV_PRIMARY_STRONG_SECONDARY':
    case 'CERV_PRIMARY_WITH_SECONDARY':
      return 'cervical'
    case 'DUAL_DRIVER':
      return 'jaw and cervical'
    default:
      return 'jaw and cervical'
  }
}
