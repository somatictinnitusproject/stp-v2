// Truncate post body for the 120-char preview shown on
// PostCard. Cuts cleanly at a word boundary when possible so
// previews don't end mid-word.

const PREVIEW_MAX = 120

export function getBodyPreview(body: string): string {
  // Collapse newlines into single spaces — preview is one line.
  const flat = body.replace(/\s+/g, ' ').trim()
  if (flat.length <= PREVIEW_MAX) return flat

  // Trim at the last word boundary within the limit.
  const sliced = flat.slice(0, PREVIEW_MAX)
  const lastSpace = sliced.lastIndexOf(' ')
  const trimmed = lastSpace > 60 ? sliced.slice(0, lastSpace) : sliced
  return `${trimmed}…`
}
