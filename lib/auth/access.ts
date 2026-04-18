export function canAccessPlatform(membership: {
  is_founding_member: boolean
  status: string
}): boolean {
  if (membership.is_founding_member === true) return true
  return membership.status === 'active' || membership.status === 'past_due'
}

export function isFoundingMember(membership: {
  is_founding_member: boolean
}): boolean {
  return membership.is_founding_member === true
}
