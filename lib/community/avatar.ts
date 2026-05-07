// Deterministic avatar colour derivation from username.
// The same username always renders the same colour across the
// platform — no DB column needed, no per-render randomness.
//
// Logic: charCode of first character of username, modulo 6,
// indexed 1–6. Empty or invalid usernames fall back to slot 1.

const AVATAR_SLOT_COUNT = 6

export type AvatarSlot = 1 | 2 | 3 | 4 | 5 | 6

export function getAvatarSlot(username: string | null | undefined): AvatarSlot {
  if (!username || username.length === 0) return 1
  const code = username.charCodeAt(0)
  const slot = (code % AVATAR_SLOT_COUNT) + 1
  return slot as AvatarSlot
}

// Returns the Tailwind background class for a username's avatar.
export function getAvatarBgClass(username: string | null | undefined): string {
  const slot = getAvatarSlot(username)
  return `bg-avatar-${slot}`
}

// Returns the first character of the username for the avatar circle.
// Stripped of any leading non-alphanumeric.
export function getAvatarInitials(username: string | null | undefined): string {
  if (!username) return '?'
  const cleaned = username.replace(/^[^a-z0-9]+/i, '')
  if (cleaned.length === 0) return '?'
  return cleaned.slice(0, 1).toUpperCase()
}
