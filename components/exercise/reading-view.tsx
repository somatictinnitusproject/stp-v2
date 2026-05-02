'use client'

// /components/exercise/reading-view.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Renders a ReadingSection in the /session card list.
// Always shows full content — no condensed view (per errata P3-4).
// Profile modifiers use the same silent-omission logic as ExerciseView (P3-13).
// Dynamic ContentBlocks ({ type: 'dynamic' }) are resolved inline from member
// data passed via props — no data fetching here.
//
// Acknowledge button reuses CompleteButton with label="Acknowledge".
// onAcknowledge is wired from SessionClient.handleComplete (same path as
// exercise completion, calls /api/session/complete then /api/session/finalise).
// ─────────────────────────────────────────────────────────────────────────────

import type { ReadingSection } from '@/content/framework/phase-3/types'
import type { Phase1AssessmentRow } from '@/lib/scoring/types'
import type { ContentBlock as ContentBlockType } from '@/content/exercises/_types'
import { ContentBlock } from './content-block'
import { ProfileModifierBlock } from './profile-modifier-block'
import { CompleteButton } from './complete-button'
import { filterQualifyingModifiers } from './_helpers'
import { protocolAssignmentText } from '@/lib/scoring/profile-paragraph/section5-protocol'

// ── Protocol option callback text — constructed from b7-profile-output option names.
const PROTOCOL_OPTION_TEXT: Record<number, string> = {
  1: 'You selected Option 1: Sequential. Your jaw protocol runs fully first — cervical work begins once the release phase is complete.',
  2: 'You selected Option 2: Parallel. Both protocols run simultaneously from your first session.',
  3: 'You selected Option 3: Prioritised Parallel. Full primary protocol daily plus your key secondary exercises.',
}

interface ReadingViewProps {
  section: ReadingSection
  phase1: Phase1AssessmentRow
  protocolOption: number | null
  onAcknowledge?: () => Promise<void>
  reviewMode?: boolean
}

export default function ReadingView({
  section,
  phase1,
  protocolOption,
  onAcknowledge,
  reviewMode = false,
}: ReadingViewProps) {
  const profileType = phase1.profile_type ?? ''
  const qualifyingModifiers = filterQualifyingModifiers(section.profileModifiers ?? [], phase1)

  const protocolAssignment = protocolAssignmentText[profileType] ?? ''
  const protocolOptionText =
    protocolOption !== null ? (PROTOCOL_OPTION_TEXT[protocolOption] ?? '') : null

  return (
    <div className="max-w-reading mx-auto pt-space-5 pb-space-6 space-y-6">
      {/* Section heading */}
      <div>
        <h2 className="text-heading-3 font-semibold text-text-heading">{section.title}</h2>
      </div>

      {/* Content blocks — dynamic blocks resolved inline */}
      <div className="space-y-4">
        {section.content.map((block, idx) => {
          if (block.type === 'dynamic') {
            if (block.source === 'protocol_assignment' && protocolAssignment) {
              return (
                <p key={idx} className="text-body text-text-body leading-relaxed font-medium">
                  {protocolAssignment}
                </p>
              )
            }
            if (block.source === 'protocol_option' && protocolOptionText) {
              return (
                <p key={idx} className="text-body text-text-body leading-relaxed">
                  {protocolOptionText}
                </p>
              )
            }
            if (block.source === 'phase4_confirmed_flags') {
              const confirmedFlags: string[] = []
              if (phase1.post_sustained_desk_load === true)
                confirmedFlags.push('Sustained desk load confirmed')
              if (phase1.post_shoulder_asymmetry === true) {
                const side = phase1.post_elevated_side
                confirmedFlags.push(
                  side
                    ? `Shoulder asymmetry confirmed (elevated ${side} side)`
                    : 'Shoulder asymmetry confirmed (elevated side)'
                )
              }
              if (phase1.cerv_forward_head_posture === true)
                confirmedFlags.push('Forward head posture confirmed')
              if (phase1.ns_stress_tinnitus_correlation === true)
                confirmedFlags.push('High stress-tinnitus correlation confirmed')
              if (phase1.ns_hypervigilance === true)
                confirmedFlags.push('Hypervigilance pattern identified')
              if (phase1.ns_anxiety_loop === true)
                confirmedFlags.push('Anxiety-tinnitus loop identified')
              if (phase1.ns_sleep_disruption === true)
                confirmedFlags.push('Significant sleep disruption identified')

              if (confirmedFlags.length === 0) {
                return (
                  <p key={idx} className="text-body text-text-body leading-relaxed">
                    Your Phase 1 assessment did not identify specific maintaining factors — Phase 4 still covers postural and nervous system content that supports and consolidates Phase 3 work.
                  </p>
                )
              }
              return (
                <div key={idx} className="space-y-2">
                  <p className="text-body text-text-body leading-relaxed">
                    Your Phase 1 assessment identified the following maintaining factors as confirmed for you:
                  </p>
                  <ul className="list-disc list-outside pl-5 space-y-1 text-body text-text-body leading-relaxed">
                    {confirmedFlags.map((flag, i) => (
                      <li key={i}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )
            }
            // Unknown source — silently omit
            return null
          }
          // Suppress acknowledge_prompt blocks in reviewMode (inline expand on /framework/phase-3)
          if (block.type === 'acknowledge_prompt' && reviewMode) {
            return null
          }
          return <ContentBlock key={idx} block={block as ContentBlockType} />
        })}
      </div>

      {/* Profile modifier blocks — after main content, before acknowledge button */}
      {qualifyingModifiers.map((mod, idx) => (
        <ProfileModifierBlock key={idx} title={mod.title} content={mod.content} />
      ))}

      {/* Acknowledge button — hidden in reviewMode (re-reading after acknowledgement).
          Label defaults to "Acknowledge"; Phase 4 practical sections (F.3, F.4, F.6+)
          override via section.acknowledgeLabel = "Done". */}
      {!reviewMode && onAcknowledge && (
        <CompleteButton onComplete={onAcknowledge} label={section.acknowledgeLabel ?? 'Acknowledge'} />
      )}
    </div>
  )
}
