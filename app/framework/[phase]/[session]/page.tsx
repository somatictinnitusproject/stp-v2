import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AuthShell from '@/components/shells/AuthShell'
import { PHASE_NAMES, getMaxSessionsForPhase } from '@/content/framework-manifest'
import { B1_OPENING } from '@/content/framework/phase-1/b1-opening'
import Session1OpeningClient from './Session1OpeningClient'
import { B2_MODULE_1_TMJ } from '@/content/framework/phase-1/b2-module-1-tmj'
import Session2ModuleOneClient from './Session2ModuleOneClient'
import { B3_MODULE_2_CERV } from '@/content/framework/phase-1/b3-module-2-cervical'
import Session3ModuleTwoClient from './Session3ModuleTwoClient'
import { B4_MODULE_3_POSTURAL } from '@/content/framework/phase-1/b4-module-3-postural'
import Session4ModuleThreeClient from './Session4ModuleThreeClient'
import { B5_MODULE_4_NS } from '@/content/framework/phase-1/b5-module-4-ns'
import Session5ModuleFourClient from './Session5ModuleFourClient'
import { B6_MODULE_5_ASYMMETRY } from '@/content/framework/phase-1/b6-module-5-asymmetry'
import Session6ModuleFiveClient from './Session6ModuleFiveClient'
import type { ConsolidatedFinding } from './Session6ModuleFiveClient'
import { B7_PROFILE_OUTPUT } from '@/content/framework/phase-1/b7-profile-output'
import Session7ProfileOutputClient from './Session7ProfileOutputClient'
import type { ProfileOutputProps } from './Session7ProfileOutputClient'
import { getRecommendedProtocolOption } from '@/lib/scoring'
import { checkLowConfidenceEdgeCase } from '@/lib/scoring'
import type { ProfileType } from '@/lib/scoring'

type Props = { params: Promise<{ phase: string; session: string }> }

export default async function SessionPage({ params }: Props) {
  const { phase: phaseParam, session: sessionParam } = await params
  console.log('[session-page] params', { phaseParam, sessionParam })
  const phase = parseInt(phaseParam.replace('phase-', ''), 10)
  const session = parseInt(sessionParam.replace('session-', ''), 10)
  console.log('[session-page] parsed', { phase, session, max: getMaxSessionsForPhase(phase) })

  if (isNaN(phase) || phase < 1 || phase > 5) { console.log('[session-page] 404 phase bounds'); notFound() }
  if (isNaN(session) || session < 1 || session > getMaxSessionsForPhase(phase)) { console.log('[session-page] 404 session bounds'); notFound() }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  console.log('[session-page] user', user?.id ?? 'none')
  if (!user) { console.log('[session-page] redirect login'); redirect('/login') }

  const { data: progress } = await supabase
    .from('framework_progress')
    .select('current_phase, current_session, phase4_first_accessed')
    .eq('user_id', user.id)
    .maybeSingle()

  console.log('[session-page] progress', progress)

  // No progress row means onboarding is incomplete
  if (!progress) { console.log('[session-page] redirect dashboard (no progress)'); redirect('/dashboard') }

  const currentPhase = progress.current_phase

  // Access control — Doc 12 Section 6.3, redirect per Doc 13 Section 7.1
  const phase4Accessible = currentPhase >= 2
  const isLocked = phase === 4 ? !phase4Accessible : phase > currentPhase
  console.log('[session-page] access', { currentPhase, isLocked })
  if (isLocked) { console.log('[session-page] redirect locked'); redirect(`/framework/phase-${currentPhase}`) }

  // Write phase4_first_accessed on first navigation to any Phase 4 content — Doc 13 §7.5
  if (phase === 4 && progress && !progress.phase4_first_accessed) {
    await supabase
      .from('framework_progress')
      .update({ phase4_first_accessed: new Date().toISOString() })
      .eq('user_id', user.id)
  }

  // ── Phase 1 session rendering ────────────────────────────────────────────────

  console.log('[session-page] reached rendering', { phase, session })

  if (phase === 1 && session === 1) {
    console.log('[session-page] rendering session-1 opening')
    return (
      <AuthShell>
        <Session1OpeningClient content={B1_OPENING} />
      </AuthShell>
    )
  }

  if (phase === 1 && session === 2) {
    console.log('[session-page] rendering session-2 module-1')
    return (
      <AuthShell>
        <Session2ModuleOneClient content={B2_MODULE_1_TMJ} />
      </AuthShell>
    )
  }

  if (phase === 1 && session === 3) {
    console.log('[session-page] rendering session-3 module-2')
    return (
      <AuthShell>
        <Session3ModuleTwoClient content={B3_MODULE_2_CERV} />
      </AuthShell>
    )
  }

  if (phase === 1 && session === 4) {
    console.log('[session-page] rendering session-4 module-3')
    return (
      <AuthShell>
        <Session4ModuleThreeClient content={B4_MODULE_3_POSTURAL} />
      </AuthShell>
    )
  }

  if (phase === 1 && session === 5) {
    console.log('[session-page] rendering session-5 module-4')
    return (
      <AuthShell>
        <Session5ModuleFourClient content={B5_MODULE_4_NS} />
      </AuthShell>
    )
  }

  if (phase === 1 && session === 6) {
    console.log('[session-page] rendering session-6 module-5')

    const { data: assessmentRow, error: m5FetchError } = await supabase
      .from('phase1_assessment')
      .select(`
        tmj_jaw_drift, tmj_jaw_drift_direction,
        tmj_masseter_asymmetry, tmj_masseter_dominant_side,
        tmj_pterygoid_tenderness, tmj_pterygoid_tender_side,
        cerv_suboccipital_asymmetric, cerv_suboccipital_tender_side,
        cerv_scm_asymmetry, cerv_scm_dominant_side,
        cerv_trap_asymmetry, cerv_trap_dominant_side,
        cerv_rotation_restriction, cerv_restricted_side,
        post_shoulder_asymmetry, post_elevated_side
      `)
      .eq('user_id', user.id)
      .maybeSingle()

    if (m5FetchError) {
      console.error('[session-page] M5 assessment fetch failed', m5FetchError)
      // Fall through to default stub on fetch failure rather than crash the page.
      // The stub renders the phase/session header — member can navigate back.
    }

    // Build findings array — order MUST match B6_MODULE_5_ASYMMETRY.consolidatedFindings
    // index for index, since the M10b client renders findings[i] alongside content.consolidatedFindings[i].
    const a = assessmentRow ?? null
    const findings: ConsolidatedFinding[] = [
      { label: 'Jaw drift on opening',
        side: (a?.tmj_jaw_drift === true && a.tmj_jaw_drift_direction) ? a.tmj_jaw_drift_direction : null },
      { label: 'Masseter dominant side',
        side: (a?.tmj_masseter_asymmetry === true && a.tmj_masseter_dominant_side) ? a.tmj_masseter_dominant_side : null },
      { label: 'Pterygoid tenderness dominant side',
        side: (a?.tmj_pterygoid_tenderness === true && a.tmj_pterygoid_tender_side) ? a.tmj_pterygoid_tender_side : null },
      { label: 'Suboccipital tenderness dominant side',
        side: (a?.cerv_suboccipital_asymmetric === true && a.cerv_suboccipital_tender_side) ? a.cerv_suboccipital_tender_side : null },
      { label: 'SCM dominant side',
        side: (a?.cerv_scm_asymmetry === true && a.cerv_scm_dominant_side) ? a.cerv_scm_dominant_side : null },
      { label: 'Upper trapezius dominant side',
        side: (a?.cerv_trap_asymmetry === true && a.cerv_trap_dominant_side) ? a.cerv_trap_dominant_side : null },
      { label: 'Cervical rotation restricted side',
        side: (a?.cerv_rotation_restriction === true && a.cerv_restricted_side) ? a.cerv_restricted_side : null },
      { label: 'Elevated shoulder',
        side: (a?.post_shoulder_asymmetry === true && a.post_elevated_side) ? a.post_elevated_side : null },
    ]

    return (
      <AuthShell>
        <Session6ModuleFiveClient content={B6_MODULE_5_ASYMMETRY} findings={findings} />
      </AuthShell>
    )
  }

  if (phase === 1 && session === 7) {
    console.log('[session-page] rendering session-7 profile-output')

    // 1. Fetch assessment row — completed_at indicates profile is generated
    const { data: assessment, error: m11FetchError } = await supabase
      .from('phase1_assessment')
      .select(`
        profile_paragraph, profile_type, completed_at,
        tmj_normalised_score, cerv_normalised_score,
        tmj_protocol_assigned, cerv_protocol_assigned,
        post_dominant_chewing_side, post_sustained_desk_load
      `)
      .eq('user_id', user.id)
      .maybeSingle()

    if (m11FetchError) {
      console.error('[session-page] M11 assessment fetch failed', m11FetchError)
      // Fall through to stub on fetch failure
    }

    // 2. Defensive — if no completed assessment, redirect to session 6 to complete M5
    if (!assessment || assessment.completed_at === null) {
      console.log('[session-page] M11 no completed assessment, redirecting to session-6')
      redirect('/framework/phase-1/session-6')
    }

    // 3. Fetch user intake symptom_score for low-confidence recheck
    const { data: userRow } = await supabase
      .from('users')
      .select('symptom_score')
      .eq('id', user.id)
      .maybeSingle()

    // 4. Recompute low-confidence flag from persisted norms
    //    (same logic the orchestrator ran at profile generation; not persisted, recomputed here)
    const tmjNorm = assessment.tmj_normalised_score ?? 0
    const cervNorm = assessment.cerv_normalised_score ?? 0
    const userIntake = {
      m1_score: null, m2_score: null, m3_score: null,
      m4_score: null, m4_asymmetric: null, m5_score: null,
      s1_score: null, s2_score: null, s5_score: null,
      s6_score: null, s7_score: null, s8_score: null,
      symptom_score: userRow?.symptom_score ?? null,
    }
    const lowConfidence = checkLowConfidenceEdgeCase(tmjNorm, cervNorm, userIntake)

    // 5. Determine variant
    //    - 'acknowledge' if low-confidence OR single driver (one protocol false)
    //    - 'options' otherwise (both protocols assigned AND not low-confidence)
    const bothProtocols =
      assessment.tmj_protocol_assigned === true &&
      assessment.cerv_protocol_assigned === true
    const variant: ProfileOutputProps['variant'] =
      lowConfidence !== null || !bothProtocols ? 'acknowledge' : 'options'

    // 6. Determine recommendedOption + profileTypePattern (only meaningful for 'options')
    let recommendedOption: ProfileOutputProps['recommendedOption'] = null
    let profileTypePattern: ProfileOutputProps['profileTypePattern'] = null
    if (variant === 'options' && assessment.profile_type) {
      recommendedOption = getRecommendedProtocolOption(assessment.profile_type as ProfileType)
      // Map profile_type to recommendation rationale pattern
      switch (assessment.profile_type) {
        case 'DUAL_DRIVER':
          profileTypePattern = 'dual'
          break
        case 'TMJ_PRIMARY_STRONG_SECONDARY':
        case 'CERV_PRIMARY_STRONG_SECONDARY':
          profileTypePattern = 'primary_strong_secondary'
          break
        case 'TMJ_PRIMARY_WITH_SECONDARY':
        case 'CERV_PRIMARY_WITH_SECONDARY':
          profileTypePattern = 'primary_with_secondary'
          break
        // TMJ_DOMINANT and CERV_DOMINANT shouldn't reach here — they go to 'acknowledge'
        // since one of the protocol booleans is false. Defensive fallback:
        default:
          profileTypePattern = null
      }
    }

    // 7. Build maintaining-factors flags for Section 7 conditional block
    const showStomachSleepingNote = false // TODO: Doc 7 has no ctx_stomach_sleeping column
                                          //   — Doc 8 §B.7 Section 7 references this flag but
                                          //   no schema field exists. Always false until
                                          //   schema decision made. Defer to E21.
    const showSustainedDeskLoadNote = assessment.post_sustained_desk_load === true

    return (
      <AuthShell>
        <Session7ProfileOutputClient
          content={B7_PROFILE_OUTPUT}
          profileParagraph={assessment.profile_paragraph ?? ''}
          variant={variant}
          recommendedOption={recommendedOption}
          profileTypePattern={profileTypePattern}
          showStomachSleepingNote={showStomachSleepingNote}
          showSustainedDeskLoadNote={showSustainedDeskLoadNote}
        />
      </AuthShell>
    )
  }

  // ── Default stub — non-Phase-1 phases (Phase 2 / 3 / 4 / 5 stubs until those phases are built) ──

  console.log('[session-page] rendering default stub')
  return (
    <AuthShell>
      <div className="max-w-[680px] mx-auto pt-10 pb-16">

        <p className="text-[12px] font-medium text-primary uppercase tracking-wide mb-3">
          Phase {phase} · Session {session}
        </p>
        <h1 className="text-[28px] md:text-[36px] font-bold text-text-heading mb-6">
          {PHASE_NAMES[phase]}
        </h1>

        {/* TODO Phase E: replace with real session content.
            Session content lives in /content/framework/*.ts — static TypeScript constants.
            Render: mechanism explanation, profile modifier blocks, technique instructions,
            demonstration video, complete button. See Doc 12 Section 6.5 for full view spec. */}
        <div className="bg-surface rounded-[12px] border border-border p-6">
          <p className="text-[14px] text-text-muted text-center py-8">
            Session content — Phase E.
          </p>
        </div>

      </div>
    </AuthShell>
  )
}
