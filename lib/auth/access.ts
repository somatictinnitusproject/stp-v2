export function canAccessPlatform(membership: {
  is_founding_member: boolean
  is_free_for_life: boolean
  status: string
}): boolean {
  if (membership.is_founding_member === true) return true
  if (membership.is_free_for_life === true) return true
  return membership.status === 'active' || membership.status === 'past_due'
}

export function isFoundingMember(membership: {
  is_founding_member: boolean
}): boolean {
  return membership.is_founding_member === true
}

// Community gate: full platform access AND Phase 1 completed.
// Phase 1 completion is signalled by phase1_completed_at being a
// non-null timestamp on framework_progress.
//
// Returns false if either condition fails. Used by every
// community route's page-level access check.
export function canAccessCommunity(
  membership: { is_founding_member: boolean; is_free_for_life: boolean; status: string },
  frameworkProgress: { phase1_completed_at: string | null } | null,
): boolean {
  if (!canAccessPlatform(membership)) return false
  if (frameworkProgress === null) return false
  return frameworkProgress.phase1_completed_at !== null
}
