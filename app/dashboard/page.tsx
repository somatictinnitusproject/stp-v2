import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AuthShell from '@/components/shells/AuthShell'
import LoudnessSparkline from '@/components/dashboard/LoudnessSparkline'
import PhaseProgressionCard from '@/components/dashboard/PhaseProgressionCard'
import { getDailyFocusLine } from '@/content/focus-lines'
import { PHASE_NAMES, getMaxSessionsForPhase } from '@/content/framework-manifest'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const [
    { data: profile },
    { data: progress },
    { data: todayLog },
    { data: sparklineLogs },
    { data: membership },
  ] = await Promise.all([
    supabase.from('users').select('display_name').eq('id', user.id).maybeSingle(),
    supabase
      .from('framework_progress')
      .select('current_phase, current_session, phase1_completed_at, phase2_completed_at, phase3_completed_at, phase4_completed_at, phase5_completed_at, resistance_phase_start, started_at')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('progress_logs')
      .select('loudness, jaw_tension, neck_tension, stress, sleep_quality')
      .eq('user_id', user.id)
      .eq('log_date', today)
      .maybeSingle(),
    supabase
      .from('progress_logs')
      .select('loudness, log_date')
      .eq('user_id', user.id)
      .order('log_date', { ascending: false })
      .limit(14),
    supabase
      .from('memberships')
      .select('status, is_founding_member')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  const displayName = profile?.display_name ?? 'there'
  const firstName = displayName.split(' ')[0]
  const currentPhase = progress?.current_phase ?? 1
  const currentSession = progress?.current_session ?? 1
  const resistancePhaseStart = progress?.resistance_phase_start ?? null
  const phase5CompletedAt = progress?.phase5_completed_at ?? null
  const startedAt = progress?.started_at ?? null

  const completedAtMap: Record<number, boolean> = {
    1: !!progress?.phase1_completed_at,
    2: !!progress?.phase2_completed_at,
    3: !!progress?.phase3_completed_at,
    4: !!progress?.phase4_completed_at,
    5: !!progress?.phase5_completed_at,
  }

  const isPastDue = membership?.status === 'past_due' && !membership?.is_founding_member

  // Day count calculation
  const dayCount = startedAt
    ? Math.floor((Date.now() - new Date(startedAt).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 1

  // First visit: started_at within 5 minutes of now
  const isFirstVisit = startedAt
    ? Date.now() - new Date(startedAt).getTime() < 5 * 60 * 1000
    : false

  // Day line construction
  let dayLine: string
  if (isFirstVisit) {
    dayLine = "Day 1 \u2014 Let's begin \u00B7 Identification Phase"
  } else if (currentPhase === 3) {
    const suffix = resistancePhaseStart ? 'Release & Resistance' : 'Release Phase'
    dayLine = `Day ${dayCount} \u2014 ${PHASE_NAMES[currentPhase]} \u00B7 ${suffix}`
  } else {
    dayLine = `Day ${dayCount} \u2014 ${PHASE_NAMES[currentPhase]}`
  }

  // Welcome heading
  const welcomeHeading = isFirstVisit
    ? `Welcome, ${firstName}`
    : `Welcome back, ${firstName}`

  // Reverse sparkline data so chart renders oldest to newest
  const chartLogs = [...(sparklineLogs ?? [])].reverse()
  const sparklineLast = chartLogs.length > 0 ? chartLogs[chartLogs.length - 1].loudness : null
  const sparklineAvg = chartLogs.length > 0
    ? (chartLogs.reduce((sum, l) => sum + l.loudness, 0) / chartLogs.length).toFixed(1)
    : null

  const maxSessions = getMaxSessionsForPhase(currentPhase)

  const focusLine = progress
    ? getDailyFocusLine({
        current_phase: currentPhase,
        current_session: currentSession,
        phase5_completed_at: phase5CompletedAt,
        resistance_phase_start: resistancePhaseStart,
      })
    : ''

  // Session CTA destination
  const sessionHref = phase5CompletedAt
    ? '/framework/phase-5/maintenance'
    : isFirstVisit
    ? '/framework/phase-1/session-1'
    : currentPhase === 3 || currentPhase === 4
    ? `/framework/phase-${currentPhase}`
    : `/framework/phase-${currentPhase}/session-${currentSession}`

  const sessionLabel = phase5CompletedAt
    ? 'View maintenance protocol'
    : isFirstVisit
    ? 'Begin Phase 1'
    : "Start today's session"

  const scores = todayLog
    ? [
        { label: 'Loudness', value: todayLog.loudness },
        { label: 'Jaw', value: todayLog.jaw_tension },
        { label: 'Neck', value: todayLog.neck_tension },
        { label: 'Stress', value: todayLog.stress },
        { label: 'Sleep', value: todayLog.sleep_quality },
      ]
    : []

  return (
    <AuthShell>

      {/* Past-due banner */}
      {isPastDue && (
        <div className="mb-5 rounded-lg bg-error-tint border border-error px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-[14px] text-error">
            Your payment is overdue. Please update your payment details to keep your access.
          </p>
          <Link href="/subscription" className="text-[13px] text-error underline font-medium whitespace-nowrap">
            Update payment &rarr;
          </Link>
        </div>
      )}

      {/* Welcome + Today's Focus */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 mb-5">
        <div>
          <h1 className="text-[28px] font-bold text-text-heading leading-tight">
            {welcomeHeading}
          </h1>
          <p className="text-[15px] text-text-muted mt-1">{dayLine}</p>
        </div>
        {focusLine && (
          <div className="md:text-right md:max-w-[320px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted mb-1">
              Today&apos;s Focus
            </p>
            <p className="text-[15px] text-text-body leading-snug">{focusLine}</p>
          </div>
        )}
      </div>

      {/* Action buttons row */}
      {todayLog ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 mb-5">
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex justify-between gap-2 mb-2">
              {scores.map(({ label, value }) => (
                <div key={label} className="flex-1 text-center">
                  <p className="text-[10px] font-medium text-text-muted uppercase tracking-[0.05em]">{label}</p>
                  <p className="text-[22px] font-bold text-text-heading leading-none mt-1">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 text-[12px] text-primary">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="#4A9B8E" strokeWidth="1.5"/>
                <polyline points="6,10 9,13 14,8" stroke="#4A9B8E" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Logged today</span>
              <span className="text-text-muted mx-1">&middot;</span>
              <Link href="/tracker" className="text-primary hover:underline">Edit today&apos;s log</Link>
            </div>
          </div>
          <Link
            href={sessionHref}
            className="flex items-center justify-center h-12 md:h-[52px] rounded-lg text-[15px] md:text-[16px] font-medium text-white bg-[#1A1A2E] hover:opacity-90 transition-opacity no-underline"
          >
            {sessionLabel}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 mb-5">
          <Link
            href="/tracker"
            className="flex items-center justify-center h-12 md:h-[52px] rounded-lg text-[15px] md:text-[16px] font-medium text-white bg-primary hover:bg-primary-hover transition-colors no-underline"
          >
            Log today
          </Link>
          <Link
            href={sessionHref}
            className="flex items-center justify-center h-12 md:h-[52px] rounded-lg text-[15px] md:text-[16px] font-medium text-white bg-[#1A1A2E] hover:opacity-90 transition-opacity no-underline"
          >
            {sessionLabel}
          </Link>
        </div>
      )}

      {/* Sparkline + Phase progression */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

        <Link href="/analytics" className="block bg-surface border border-border rounded-xl p-4 no-underline">
          <p className="text-[13px] font-semibold text-text-heading mb-3">Loudness &mdash; last 14 days</p>
          {chartLogs.length >= 2 ? (
            <>
              <LoudnessSparkline logs={chartLogs} />
              <div className="flex justify-between mt-1">
                <span className="text-[12px] text-text-muted">Latest: {sparklineLast}</span>
                <span className="text-[12px] text-text-muted">14-day avg: {sparklineAvg}</span>
              </div>
            </>
          ) : (
            <div className="h-[80px] flex items-center justify-center">
              <p className="text-[13px] text-text-muted">Start logging daily to see your trend here.</p>
            </div>
          )}
        </Link>

        <PhaseProgressionCard
          currentPhase={currentPhase}
          completedAtMap={completedAtMap}
          resistancePhaseStart={resistancePhaseStart}
        />

      </div>

      {/* Session list */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="px-5 pt-[18px] pb-3 border-b border-border">
          <h2 className="text-[16px] font-semibold text-text-heading">
            Phase {currentPhase} &mdash; {PHASE_NAMES[currentPhase]}
          </h2>
        </div>

        {currentPhase === 3 ? (
          <div className="px-5 py-4">
            <p className="text-[14px] text-text-muted">Phase 3 session list &mdash; populate in Phase E.</p>
          </div>
        ) : (
          Array.from({ length: maxSessions }, (_, i) => {
            const sessionNum = i + 1
            const isComplete = completedAtMap[currentPhase] || sessionNum < currentSession
            const isActive = sessionNum === currentSession && !completedAtMap[currentPhase]

            return (
              <Link
                key={sessionNum}
                href={`/framework/phase-${currentPhase}/session-${sessionNum}`}
                className="flex items-center justify-between px-5 py-4 border-b border-border last:border-b-0 no-underline hover:bg-surface-raised transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isComplete && (
                    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" stroke="#4A9B8E" strokeWidth="1.5"/>
                      <polyline points="6,10 9,13 14,8" stroke="#4A9B8E" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                  {isActive && (
                    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" stroke="#1A1A2E" strokeWidth="1.5"/>
                      <polygon points="8,7 13,10 8,13" fill="#1A1A2E"/>
                    </svg>
                  )}
                  {!isComplete && !isActive && (
                    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" stroke="#E5E3DF" strokeWidth="1.5"/>
                      <circle cx="10" cy="10" r="2" fill="#E5E3DF"/>
                    </svg>
                  )}
                  <span className={`text-[14px] ${isActive ? 'font-semibold text-text-heading' : 'text-text-muted'}`}>
                    Session {sessionNum}
                  </span>
                </div>
                <span className="text-[12px] text-text-muted">&mdash;</span>
              </Link>
            )
          })
        )}
      </div>

    </AuthShell>
  )
}
