import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AuthShell from '@/components/shells/AuthShell'
import LoudnessSparkline from '@/components/dashboard/LoudnessSparkline'
import PhaseProgressionCard from '@/components/dashboard/PhaseProgressionCard'
import { getDailyFocusLine } from '@/content/focus-lines'
import { PHASE_NAMES, getMaxSessionsForPhase } from '@/content/framework-manifest'
import { buildSessionExerciseList } from '@/lib/session/build-session'
import { getExerciseById } from '@/content/exercises/_lookup'
import { getTodayStatus, type TodayStatus } from '@/lib/session/get-today-status'
import type { FrameworkProgressRow, Phase1AssessmentRow } from '@/lib/scoring/types'
import ShorterSessionLink from '@/components/dashboard/ShorterSessionLink'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  // First: framework_progress (needed for the session_logs phase filter)
  const { data: progress, error: progressError } = await supabase
    .from('framework_progress')
    .select('current_phase, current_session, phase1_completed_at, phase2_completed_at, phase3_completed_at, phase4_completed_at, phase5_completed_at, resistance_phase_start, phase_started_at, session_in_progress, protocol_option, phase4_exercises_added, exercises_viewed')
    .eq('user_id', user.id)
    .maybeSingle()

  if (progressError) {
    console.error('[dashboard] framework_progress fetch failed:', progressError.message, 'user:', user.id)
  }

  // Then: everything else in parallel
  const [
    { data: profile, error: profileError },
    { data: todayLog, error: todayLogError },
    { data: sparklineLogs, error: sparklineError },
    { data: membership, error: membershipError },
    { data: todaysSessionLog, error: sessionLogError },
  ] = await Promise.all([
    supabase.from('users').select('display_name').eq('id', user.id).maybeSingle(),
    supabase
      .from('progress_logs')
      .select('tinnitus_score, jaw_tension, neck_tension, stress_level, sleep_quality')
      .eq('user_id', user.id)
      .eq('log_date', today)
      .maybeSingle(),
    supabase
      .from('progress_logs')
      .select('tinnitus_score, log_date')
      .eq('user_id', user.id)
      .order('log_date', { ascending: false })
      .limit(14),
    supabase
      .from('memberships')
      .select('status, is_founding_member')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('session_logs')
      .select('completed_at')
      .eq('user_id', user.id)
      .eq('session_date', today)
      .eq('phase', progress?.current_phase ?? 0)
      .maybeSingle(),
  ])

  if (profileError) {
    console.error('[dashboard] users fetch failed:', profileError.message, 'user:', user.id)
  }
  if (todayLogError) {
    console.error('[dashboard] progress_logs (today) fetch failed:', todayLogError.message, 'user:', user.id)
  }
  if (sparklineError) {
    console.error('[dashboard] progress_logs (sparkline) fetch failed:', sparklineError.message, 'user:', user.id)
  }
  if (membershipError) {
    console.error('[dashboard] memberships fetch failed:', membershipError.message, 'user:', user.id)
  }
  if (sessionLogError) {
    console.error('[dashboard] session_logs fetch failed:', sessionLogError.message, 'user:', user.id)
  }

  const displayName = profile?.display_name ?? 'there'
  const firstName = displayName.split(' ')[0]
  const currentPhase = progress?.current_phase ?? 1
  const currentSession = progress?.current_session ?? 1
  const resistancePhaseStart = progress?.resistance_phase_start ?? null
  const phase5CompletedAt = progress?.phase5_completed_at ?? null
  const phaseStartedAt = progress?.phase_started_at ?? null

  const completedAtMap: Record<number, boolean> = {
    1: !!progress?.phase1_completed_at,
    2: !!progress?.phase2_completed_at,
    3: !!progress?.phase3_completed_at,
    4: !!progress?.phase4_completed_at,
    5: !!progress?.phase5_completed_at,
  }

  const isPastDue = membership?.status === 'past_due' && !membership?.is_founding_member

  // Day count calculation
  const dayCount = phaseStartedAt
    ? Math.floor((Date.now() - new Date(phaseStartedAt).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 1

  // First visit: phase_started_at within 5 minutes of now
  const isFirstVisit = phaseStartedAt
    ? Date.now() - new Date(phaseStartedAt).getTime() < 5 * 60 * 1000
    : false

  // Day line construction
  let dayLine: string
  if (isFirstVisit) {
    dayLine = "Day 1 — Let's begin · Identification Phase"
  } else if (currentPhase === 3) {
    const suffix = resistancePhaseStart ? 'Release & Resistance' : 'Release Phase'
    dayLine = `Day ${dayCount} — ${PHASE_NAMES[currentPhase]} · ${suffix}`
  } else {
    dayLine = `Day ${dayCount} — ${PHASE_NAMES[currentPhase]}`
  }

  // Welcome heading
  const welcomeHeading = isFirstVisit
    ? `Welcome, ${firstName}`
    : `Welcome back, ${firstName}`

  // Reverse sparkline data so chart renders oldest to newest
  const chartLogs = [...(sparklineLogs ?? [])].reverse()
  const sparklineLast = chartLogs.length > 0 ? chartLogs[chartLogs.length - 1].tinnitus_score : null
  const sparklineAvg = chartLogs.length > 0
    ? (chartLogs.reduce((sum, l) => sum + l.tinnitus_score, 0) / chartLogs.length).toFixed(1)
    : null

  const maxSessions = getMaxSessionsForPhase(currentPhase)

  // Phase 3 only: compute exercise list metrics and today's session status
  let totalExerciseCount = 0
  let estimatedMinutesRemaining = 0
  let todayStatus: TodayStatus | null = null
  let tmjProtocolAssigned = false

  if (currentPhase === 3 && progress) {
    const { data: assessment } = await supabase
      .from('phase1_assessment')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (assessment) {
      tmjProtocolAssigned = assessment.tmj_protocol_assigned === true
      const ids = buildSessionExerciseList(
        progress as unknown as FrameworkProgressRow,
        assessment as unknown as Phase1AssessmentRow,
      )
      const exercises = ids.map(id => getExerciseById(id))

      // Optional exercises (D.4 heat) excluded from ~min total to match
      // session-client behaviour. totalExerciseCount remains based on
      // ids.length so the dashboard chip shows all clickable items.
      const nonOptionalExercises = exercises.filter(ex => !ex.optional)
      totalExerciseCount = ids.length
      const totalMinutes = nonOptionalExercises.reduce((sum, ex) => sum + (ex.estimatedMinutes ?? 0), 0)

      // For in-progress: minutes remaining = non-optional exercises not yet
      // completed.
      const sip = progress.session_in_progress as { session_date: string; completed_exercises: string[] } | null
      if (sip && sip.session_date === today) {
        const completedSet = new Set(sip.completed_exercises ?? [])
        estimatedMinutesRemaining = nonOptionalExercises
          .filter(ex => !completedSet.has(ex.id))
          .reduce((sum, ex) => sum + (ex.estimatedMinutes ?? 0), 0)
      } else {
        estimatedMinutesRemaining = totalMinutes
      }
    }

    todayStatus = getTodayStatus({
      sessionInProgress: progress.session_in_progress as Record<string, unknown> | null,
      todaysSessionLog,
      totalExerciseCount,
      today,
    })
  }

  const exercisesViewed = (progress?.exercises_viewed ?? {}) as Record<string, boolean>

  // Reading rows for Phase 3 TMJ members (M13l). Three orientation sections
  // displayed above "Daily release practice". Acknowledged → done state.
  const tmjReadingRows = [
    { id: 'D1_phase3_opening', label: 'Phase 3 Opening and Orientation', minutes: 5 },
    { id: 'D2_forewarning', label: 'Forewarning: What to Expect in the First Week', minutes: 4 },
    { id: 'D3_release_intro', label: 'Release Phase Introduction', minutes: 4 },
  ]

  const focusLine = progress
    ? getDailyFocusLine({
        current_phase: currentPhase,
        current_session: currentSession,
        phase5_completed_at: phase5CompletedAt,
        resistance_phase_start: resistancePhaseStart,
      })
    : ''

  // Session CTA destination — Phase 3 routes to /session
  const sessionHref = phase5CompletedAt
    ? '/framework/phase-5/maintenance'
    : isFirstVisit
    ? '/framework/phase-1/session-1'
    : currentPhase === 3
    ? '/session'
    : currentPhase === 4
    ? `/framework/phase-${currentPhase}`
    : `/framework/phase-${currentPhase}/session-${currentSession}`

  const sessionLabel = phase5CompletedAt
    ? 'View maintenance protocol'
    : isFirstVisit
    ? 'Begin Phase 1'
    : "Start today's session"

  // Hide session button when today's Phase 3 session is done
  const showSessionButton = todayStatus?.kind !== 'done'

  const scores = todayLog
    ? [
        { label: 'Loudness', value: todayLog.tinnitus_score },
        { label: 'Jaw', value: todayLog.jaw_tension },
        { label: 'Neck', value: todayLog.neck_tension },
        { label: 'Stress', value: todayLog.stress_level },
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
        <div className={`grid grid-cols-1 ${showSessionButton ? 'md:grid-cols-2' : ''} gap-3 md:gap-5 mb-5`}>
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
          {showSessionButton && (
            <div className="flex flex-col gap-2">
              <Link
                href={sessionHref}
                className="flex items-center justify-center h-12 md:h-[52px] rounded-lg text-[15px] md:text-[16px] font-medium text-white bg-[#1A1A2E] hover:opacity-90 transition-opacity no-underline"
              >
                {sessionLabel}
              </Link>
              {currentPhase === 3 && <ShorterSessionLink />}
            </div>
          )}
        </div>
      ) : (
        <div className={`grid grid-cols-1 ${showSessionButton ? 'md:grid-cols-2' : ''} gap-3 md:gap-5 mb-5`}>
          <Link
            href="/tracker"
            className="flex items-center justify-center h-12 md:h-[52px] rounded-lg text-[15px] md:text-[16px] font-medium text-white bg-primary hover:bg-primary-hover transition-colors no-underline"
          >
            Log today
          </Link>
          {showSessionButton && (
            <div className="flex flex-col gap-2">
              <Link
                href={sessionHref}
                className="flex items-center justify-center h-12 md:h-[52px] rounded-lg text-[15px] md:text-[16px] font-medium text-white bg-[#1A1A2E] hover:opacity-90 transition-opacity no-underline"
              >
                {sessionLabel}
              </Link>
              {currentPhase === 3 && <ShorterSessionLink />}
            </div>
          )}
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

        {currentPhase === 3 && todayStatus ? (
          <>
            {/* D.1 / D.2 / D.3 orientation rows — TMJ members only (M13l) */}
            {tmjProtocolAssigned && tmjReadingRows.map(({ id, label, minutes }) => {
              const done = !!exercisesViewed[id]
              return done ? (
                <div key={id} className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" stroke="#4A9B8E" strokeWidth="1.5"/>
                      <polyline points="6,10 9,13 14,8" stroke="#4A9B8E" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span className="text-[14px] line-through text-text-muted">{label}</span>
                  </div>
                  <span className="text-[12px] text-text-muted">Completed</span>
                </div>
              ) : (
                <Link
                  key={id}
                  href="/session"
                  className="flex items-center justify-between px-5 py-4 border-b border-border no-underline hover:bg-surface-raised transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" stroke="#1A1A2E" strokeWidth="1.5"/>
                      <polygon points="8,7 13,10 8,13" fill="#1A1A2E"/>
                    </svg>
                    <span className="text-[14px] font-semibold text-text-heading">{label}</span>
                  </div>
                  <span className="text-[12px] text-text-muted">~{minutes} min</span>
                </Link>
              )
            })}

            {/* Daily release practice row */}
            {todayStatus.kind === 'done' ? (
              <div className="flex items-center justify-between px-5 py-4 border-b border-border last:border-b-0">
                <div className="flex items-center gap-3">
                  <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="9" stroke="#4A9B8E" strokeWidth="1.5"/>
                    <polyline points="6,10 9,13 14,8" stroke="#4A9B8E" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="text-[14px] text-text-muted">Daily release practice</span>
                </div>
                <span className="text-[12px] text-text-muted">Completed</span>
              </div>
            ) : (
              <Link
                href="/session"
                className="flex items-center justify-between px-5 py-4 border-b border-border last:border-b-0 no-underline hover:bg-surface-raised transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="9" stroke="#1A1A2E" strokeWidth="1.5"/>
                    <polygon points="8,7 13,10 8,13" fill="#1A1A2E"/>
                  </svg>
                  <span className="text-[14px] font-semibold text-text-heading">Daily release practice</span>
                </div>
                <span className="text-[12px] text-text-muted">
                  {todayStatus.kind === 'in_progress'
                    ? `${todayStatus.completedCount} of ${todayStatus.totalCount} · ~${estimatedMinutesRemaining} min`
                    : `~${estimatedMinutesRemaining} min`}
                </span>
              </Link>
            )}
          </>
        ) : currentPhase === 3 ? (
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
