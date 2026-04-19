import type { SupabaseClient } from '@supabase/supabase-js'
import { SCORING_THRESHOLDS } from '@/content/scoring-thresholds'

const DAY_MS = 86_400_000

function toUtcDateString(ts: number): string {
  return new Date(ts).toISOString().split('T')[0]
}

export type TodayLog = {
  id: string
  tinnitus_score: number
  jaw_tension: number
  neck_tension: number
  stress_level: number
  sleep_quality: number
  notes: string | null
  created_at: string
  triggerNames: string[]
} | null

export type TrackerQueryResult = {
  todayLog: TodayLog
  hasYesterdayLog: boolean
  priorLogCount: number
  recentLogDates: string[]  // dates within 7-day retroactive window that have a log
  showWeeklyNudge: boolean
  daysSinceCreation: number
}

export async function fetchTrackerData(
  userId: string,
  supabase: SupabaseClient,
  today: string
): Promise<TrackerQueryResult> {
  const todayMs    = new Date(today + 'T00:00:00Z').getTime()
  const yesterday  = toUtcDateString(todayMs - DAY_MS)
  const sixDaysAgo = toUtcDateString(todayMs - 6 * DAY_MS)

  const [
    { data: todayRaw,  error: todayError  },
    { data: yestRaw,   error: yestError   },
    { count: priorCount, error: priorError },
    { data: recentRaw, error: recentError },
    { data: userRow,   error: userError   },
  ] = await Promise.all([
    // Today's full log — nested triggers via FK progress_log_triggers → triggers
    supabase
      .from('progress_logs')
      .select(`
        id, tinnitus_score, jaw_tension, neck_tension, stress_level, sleep_quality, notes, created_at,
        progress_log_triggers ( triggers ( name ) )
      `)
      .eq('user_id', userId)
      .eq('log_date', today)
      .maybeSingle(),

    // Yesterday — existence check only
    supabase
      .from('progress_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('log_date', yesterday)
      .maybeSingle(),

    // Prior log count (logs before today)
    supabase
      .from('progress_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .lt('log_date', today),

    // Logged dates within the 7-day retroactive window (today − 6d through today)
    supabase
      .from('progress_logs')
      .select('log_date')
      .eq('user_id', userId)
      .gte('log_date', sixDaysAgo)
      .lte('log_date', today)
      .order('log_date', { ascending: false }),

    // users.created_at — canonical account creation date for weekly nudge (Doc 12 §4.4)
    supabase
      .from('users')
      .select('created_at')
      .eq('id', userId)
      .maybeSingle(),
  ])

  if (todayError)  throw new Error(`fetchTrackerData todayLog: ${todayError.message}`)
  if (yestError)   throw new Error(`fetchTrackerData yesterdayLog: ${yestError.message}`)
  if (priorError)  throw new Error(`fetchTrackerData priorCount: ${priorError.message}`)
  if (recentError) throw new Error(`fetchTrackerData recentLogs: ${recentError.message}`)
  if (userError)   throw new Error(`fetchTrackerData userRow: ${userError.message}`)

  const priorLogCount  = priorCount ?? 0
  const recentLogDates = (recentRaw ?? []).map(r => r.log_date as string)

  // Computed server-side to avoid client timezone drift (Doc 12 §4.4)
  const accountCreatedAt = userRow?.created_at ?? null
  const daysSinceCreation = accountCreatedAt
    ? Math.floor((Date.now() - new Date(accountCreatedAt).getTime()) / DAY_MS)
    : 0
  const showWeeklyNudge =
    daysSinceCreation > 0 &&
    daysSinceCreation % SCORING_THRESHOLDS.WEEKLY_NUDGE_INTERVAL === 0 &&
    priorLogCount >= SCORING_THRESHOLDS.WEEKLY_NUDGE_MIN_LOGS

  // Supabase TS generics don't resolve deep nested selects without codegen —
  // cast is deliberate and re-typed in the flattened output below.
  let todayLog: TodayLog = null
  if (todayRaw) {
    const triggerNames = ((todayRaw as any).progress_log_triggers ?? [])
      .map((plt: any) => plt.triggers?.name as string | undefined)
      .filter((n: string | undefined): n is string => typeof n === 'string')

    todayLog = {
      id:            todayRaw.id,
      tinnitus_score: todayRaw.tinnitus_score,
      jaw_tension:    todayRaw.jaw_tension,
      neck_tension:   todayRaw.neck_tension,
      stress_level:   todayRaw.stress_level,
      sleep_quality: todayRaw.sleep_quality,
      notes:         todayRaw.notes,
      created_at:    todayRaw.created_at,
      triggerNames,
    }
  }

  return {
    todayLog,
    hasYesterdayLog: !!yestRaw,
    priorLogCount,
    recentLogDates,
    showWeeklyNudge,
    daysSinceCreation,
  }
}
