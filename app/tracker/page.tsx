export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AuthShell from '@/components/shells/AuthShell'
import { canAccessPlatform } from '@/lib/auth/access'
import { getCurrentStreak } from '@/lib/streak'
import { fetchTrackerData } from '@/lib/tracker/queries'
import { isEditable } from '@/lib/tracker/edit-window'
import TrackerClient from './TrackerClient'

export default async function TrackerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('status, is_founding_member')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership || !canAccessPlatform(membership)) redirect('/subscription')

  // Compute today once — passed to fetchTrackerData to avoid drift between queries
  const today = new Date().toISOString().split('T')[0]

  const [trackerData, streak] = await Promise.all([
    fetchTrackerData(user.id, supabase, today),
    getCurrentStreak(user.id, supabase),
  ])

  const {
    todayLog,
    hasYesterdayLog,
    priorLogCount,
    recentLogDates,
    showWeeklyNudge,
    daysSinceCreation,
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
        streak={streak}
      />
    </AuthShell>
  )
}
