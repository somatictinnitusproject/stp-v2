// /lib/scoring/profile-family.ts
// ─────────────────────────────────────────────────────────────────────────────
// Resolve a Phase 1 profile_type to its family bucket for content dispatch.
// Three buckets: TMJ_DOMINANT, CERV_DOMINANT, DUAL_DRIVER. Mixed-driver
// profiles map to the family of their primary driver per Doc 8 Phase 5 G.5
// maintenance protocol authoring.
//
// Returns null for empty string, unknown values, or members with no
// profile_type set. Null causes profile_variant blocks to silently omit,
// matching the rest of the framework's silent-omission philosophy.
// ─────────────────────────────────────────────────────────────────────────────

export type ProfileFamily = 'TMJ_DOMINANT' | 'CERV_DOMINANT' | 'DUAL_DRIVER'

export function resolveProfileFamily(profileType: string | null | undefined): ProfileFamily | null {
  switch (profileType) {
    case 'TMJ_DOMINANT':
    case 'TMJ_PRIMARY_STRONG_SECONDARY':
    case 'TMJ_PRIMARY_WITH_SECONDARY':
      return 'TMJ_DOMINANT'
    case 'CERV_DOMINANT':
    case 'CERV_PRIMARY_STRONG_SECONDARY':
    case 'CERV_PRIMARY_WITH_SECONDARY':
      return 'CERV_DOMINANT'
    case 'DUAL_DRIVER':
      return 'DUAL_DRIVER'
    default:
      return null
  }
}
