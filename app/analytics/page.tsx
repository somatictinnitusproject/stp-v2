export const dynamic = 'force-dynamic'

// app/analytics/page.tsx
// ─────────────────────────────────────────────────────────────────
// /analytics — server component. AuthShell + membership-gated via
// canAccessPlatform(). Parallel fetch of all three data sources.
//
// Error state (D3): progress_logs fetch failure → full-page error.
//   framework_progress / phase1_assessment failures degrade to null.
// Empty state (D4): 0 logs → full-page prompt to go log.
// ─────────────────────────────────────────────────────────────────

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import AuthShell from '@/components/shells/AuthShell'
import { canAccessPlatform } from '@/lib/auth/access'
import type { ProgressLog, AnalyticsData } from '@/lib/analytics/types'
import type { FrameworkProgressRow, Phase1AssessmentRow } from '@/lib/scoring/types'
import AnalyticsPageClient from './AnalyticsPageClient'
import RefreshButton from './RefreshButton'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('status, is_founding_member')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership || !canAccessPlatform(membership)) redirect('/subscription')

  const [
    { data: logsRaw, error: logsError },
    { data: frameworkProgress, error: progressError },
    { data: phase1Assessment, error: phase1Error },
  ] = await Promise.all([
    supabase
      .from('progress_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('log_date', { ascending: true }),
    supabase
      .from('framework_progress')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('phase1_assessment')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (progressError) {
    console.error(
      '[analytics] framework_progress fetch failed:',
      progressError.message,
      'user:',
      user.id
    )
  }
  if (phase1Error) {
    console.error(
      '[analytics] phase1_assessment fetch failed:',
      phase1Error.message,
      'user:',
      user.id
    )
  }

  if (logsError) {
    console.error(
      '[analytics] progress_logs fetch failed:',
      logsError.message,
      'user:',
      user.id
    )
    return (
      <AuthShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
          <h1 className="text-[22px] font-semibold text-text-heading mb-2">
            Something went wrong loading your analytics.
          </h1>
          <p className="text-[15px] text-text-body mb-6">Please refresh the page.</p>
          <RefreshButton />
        </div>
      </AuthShell>
    )
  }

  const logs = (logsRaw ?? []) as ProgressLog[]

  if (logs.length === 0) {
    return (
      <AuthShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
          <TrendingUp size={48} className="text-text-muted mb-4" />
          <h1 className="text-[22px] font-semibold text-text-heading mb-2">
            Your progress will appear here
          </h1>
          <p className="text-[15px] text-text-body mb-6">
            Once you start logging daily, your trend, insights, and personal bests will build up
            here.
          </p>
          <Link
            href="/tracker"
            className="bg-primary hover:bg-primary-hover text-white text-[15px] font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Go to tracker
          </Link>
        </div>
      </AuthShell>
    )
  }

  const data: AnalyticsData = {
    logs,
    frameworkProgress: frameworkProgress as FrameworkProgressRow | null,
    phase1Assessment: phase1Assessment as Phase1AssessmentRow | null,
  }

  return (
    <AuthShell>
      <AnalyticsPageClient data={data} />
    </AuthShell>
  )
}
