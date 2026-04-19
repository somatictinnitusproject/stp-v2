import type { SupabaseClient } from '@supabase/supabase-js'

const DAY_MS = 86_400_000

// All date arithmetic uses UTC throughout. log_date values are stored as UTC DATE
// by Postgres and compared as ISO strings (YYYY-MM-DD). Migration to user-local
// dates is a post-launch task — do not change this without updating the tracker
// submission path and the Postgres CURRENT_DATE defaults at the same time.

function toUtcDateString(ts: number): string {
  return new Date(ts).toISOString().split('T')[0]
}

function parseDateMs(s: string): number {
  return new Date(s + 'T00:00:00Z').getTime()
}

export async function getCurrentStreak(
  userId: string,
  supabase: SupabaseClient
): Promise<{ current: number; longest: number }> {
  const { data, error } = await supabase
    .from('progress_logs')
    .select('log_date')
    .eq('user_id', userId)
    .order('log_date', { ascending: false })

  if (error) throw new Error(`getCurrentStreak: ${error.message}`)

  if (!data || data.length === 0) {
    return { current: 0, longest: 0 }
  }

  // Deduplicate (UNIQUE constraint makes this redundant, but safe)
  const dateSet = new Set<string>(data.map(r => r.log_date as string))
  // Sorted newest → oldest
  const sorted = [...dateSet].sort().reverse()

  const todayStr     = toUtcDateString(Date.now())
  const yesterdayStr = toUtcDateString(Date.now() - DAY_MS)

  // Current streak: walk backwards from today (or yesterday if today unlogged)
  let current = 0
  if (dateSet.has(todayStr) || dateSet.has(yesterdayStr)) {
    let cursor = dateSet.has(todayStr) ? todayStr : yesterdayStr
    while (dateSet.has(cursor)) {
      current++
      cursor = toUtcDateString(parseDateMs(cursor) - DAY_MS)
    }
  }

  // Longest streak: single pass over all dates
  let longest = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    const gap = parseDateMs(sorted[i - 1]) - parseDateMs(sorted[i])
    if (gap === DAY_MS) {
      run++
      if (run > longest) longest = run
    } else {
      run = 1
    }
  }

  return { current, longest }
}
