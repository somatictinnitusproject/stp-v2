export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AuthShell from '@/components/shells/AuthShell'
import { canAccessPlatform } from '@/lib/auth/access'
import { getCurrentStreak } from '@/lib/streak'
import { fetchTrackerData } from '@/lib/tracker/queries'
import { isEditable } from '@/lib/tracker/edit-window'
import TrackerClient from './TrackerClient'

type TfiCapturePoint = 'intake' | 'completion'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TrackerPage({ searchParams }: PageProps) {
  const { tfi_success: rawTfiSuccess } = await searchParams
  const showTfiSuccess = rawTfiSuccess === '1'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('status, is_founding_member, is_free_for_life')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership || !canAccessPlatform(membership)) redirect('/subscription')

  // Compute today once — passed to fetchTrackerData to avoid drift between queries
  const today = new Date().toISOString().split('T')[0]

  const [trackerData, streak, tfiState] = await Promise.all([
    fetchTrackerData(user.id, supabase, today),
    getCurrentStreak(user.id, supabase),
    fetchTfiState(user.id, supabase),
  ])

  const {
    todayLog,
    hasYesterdayLog,
    priorLogCount,
    recentLogDates,
    showWeeklyNudge,
    daysSinceCreation,
    hasEligibleRetroactiveDays,
  } = trackerData

  // State 1 = no log today. State 2 = logged today.
  // State 3 is entered client-side when the user clicks "Edit today's log".
  const state: 1 | 2 = todayLog ? 2 : 1

  // Show "Missed yesterday?" only when: no today log, no yesterday log, has prior history
  const showYesterdayLink = !todayLog && !hasYesterdayLog && priorLogCount > 0

  return (
    <AuthShell>
      <TrackerClient
        today={today}
        state={state}
        todayLog={todayLog}
        isEditable={todayLog ? isEditable(new Date(todayLog.created_at)) : false}
        priorLogCount={priorLogCount}
        recentLogDates={recentLogDates}
        showYesterdayLink={showYesterdayLink}
        showWeeklyNudge={showWeeklyNudge}
        daysSinceCreation={daysSinceCreation}
        hasEligibleRetroactiveDays={hasEligibleRetroactiveDays}
        streak={streak}
        activeTfiCapturePoint={tfiState}
        showTfiSuccess={showTfiSuccess}
      />
    </AuthShell>
  )
}

/**
 * Determines which TFI capture point (if any) should be shown on /tracker.
 * Checks intake first, then completion. Returns null if neither applies.
 *
 * Logic:
 *   intake  — phase1_assessment.created_at set AND no intake response AND not dismissed
 *   completion — phase5_completed_at set AND no completion response AND not dismissed
 */
async function fetchTfiState(
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<TfiCapturePoint | null> {
  const [
    { data: phase1 },
    { data: framework },
    { data: responses },
  ] = await Promise.all([
    supabase
      .from('phase1_assessment')
      .select('created_at')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('framework_progress')
      .select('phase5_completed_at, tfi_dismissals')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('tfi_responses')
      .select('capture_point')
      .eq('user_id', userId),
  ])

  const submittedPoints = new Set<string>(
    (responses ?? []).map((r: { capture_point: string }) => r.capture_point),
  )
  const dismissals = (framework?.tfi_dismissals ?? {}) as Record<string, string>

  // Intake: phase1 completed, not yet submitted, not dismissed.
  if (
    phase1?.created_at &&
    !submittedPoints.has('intake') &&
    !dismissals['intake']
  ) {
    return 'intake'
  }

  // Completion: phase5 completed, not yet submitted, not dismissed.
  if (
    framework?.phase5_completed_at &&
    !submittedPoints.has('completion') &&
    !dismissals['completion']
  ) {
    return 'completion'
  }

  return null
}
