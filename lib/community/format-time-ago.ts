// Format a timestamp as a human-readable relative time.
// Returns: "just now", "5 minutes ago", "2 hours ago",
// "yesterday", "3 days ago", "2 weeks ago", "5 months ago",
// "2 years ago".
//
// Pure function — takes the comparison "now" as a parameter
// so tests can pin a fixed date.

export function formatTimeAgo(
  timestamp: string,
  now: Date = new Date(),
): string {
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 45) return 'just now'

  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`

  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return diffHr === 1 ? '1 hour ago' : `${diffHr} hours ago`

  const diffDay = Math.floor(diffHr / 24)
  if (diffDay === 1) return 'yesterday'
  if (diffDay < 7) return `${diffDay} days ago`

  const diffWk = Math.floor(diffDay / 7)
  if (diffWk < 5) return diffWk === 1 ? '1 week ago' : `${diffWk} weeks ago`

  const diffMo = Math.floor(diffDay / 30)
  if (diffMo < 12) return diffMo === 1 ? '1 month ago' : `${diffMo} months ago`

  const diffYr = Math.floor(diffDay / 365)
  return diffYr === 1 ? '1 year ago' : `${diffYr} years ago`
}
