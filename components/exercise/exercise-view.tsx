// /components/exercise/exercise-view.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Server component. Renders a single Phase 3 exercise in either first-view
// (full content) or condensed-view (ExpandToggle + brief summary) mode.
//
// Implements the first-view-vs-condensed-view contract from Doc 12 §6.5.
// Profile modifier silent-omission per errata P3-13 — strict equality filter.
// Timer routing: exercise.timer !== null → TimerSlot stub; null → CompleteButton.
//
// onComplete is a Server Action forwarded from the /session page (M13g).
// No data fetching here — all data comes via props.
// ─────────────────────────────────────────────────────────────────────────────

import type { Exercise, ProfileModifier } from '@/content/exercises/_types'
import type { Phase1AssessmentRow } from '@/lib/scoring/types'
import { ContentBlock, ContentBlockList } from './content-block'
import { ProfileModifierBlock } from './profile-modifier-block'
import { ExpandToggle } from './expand-toggle'
import { TimerSlot } from './timer-slot'
import { CompleteButton } from './complete-button'

interface ExerciseViewProps {
  exercise: Exercise
  phase1: Phase1AssessmentRow
  firstView: boolean          // derived from exercises_viewed[exercise.id] in parent
  onComplete: () => Promise<void>  // Server Action wired by M13g
}

/**
 * Filter profile modifiers to those whose triggerFlag strictly equals
 * triggerValue on the given phase1 row.
 *
 * Per errata P3-13: flags missing from phase1_assessment resolve to
 * undefined at runtime. undefined !== any triggerValue → silently omitted.
 * No error, no warning, no UI artifact.
 *
 * Exported for isolated unit testing (vitest helper-test path).
 */
export function filterQualifyingModifiers(
  modifiers: ProfileModifier[],
  phase1: Phase1AssessmentRow,
): ProfileModifier[] {
  return modifiers.filter(
    (mod) => (phase1 as unknown as Record<string, unknown>)[mod.triggerFlag] === mod.triggerValue
  )
}

export default function ExerciseView({
  exercise,
  phase1,
  firstView,
  onComplete,
}: ExerciseViewProps) {
  const qualifyingModifiers = filterQualifyingModifiers(exercise.profileModifiers, phase1)

  // Complete affordance — timer if configured, plain button otherwise
  const completeAffordance =
    exercise.timer !== null ? (
      <TimerSlot
        timer={exercise.timer}
        exerciseId={exercise.id}
        onComplete={onComplete}
      />
    ) : (
      <CompleteButton onComplete={onComplete} />
    )

  // Video placeholder — shown when videoId is available
  const videoPlaceholder = exercise.videoId !== null && (
    <div className="rounded-lg bg-surface-raised border border-border p-4 text-center text-body-sm text-text-muted">
      Video: {exercise.videoId}
    </div>
  )

  // Focus line block — always rendered above fullContent
  const focusLineBlock = (
    <div className="space-y-1">
      <p className="text-label text-text-muted uppercase tracking-wider">Focus</p>
      <p className="text-body text-text-body font-medium">{exercise.focusLine}</p>
    </div>
  )

  // Full explanation — items 1-7 from first view, passed into ExpandToggle
  // on the condensed view, and rendered directly on the first view.
  const fullExplanation = (
    <div className="space-y-4">
      <h2 className="text-heading-3 font-semibold text-text-heading">
        {exercise.name}
      </h2>
      {focusLineBlock}
      <ContentBlockList blocks={exercise.fullContent} />
      {qualifyingModifiers.map((mod, idx) => (
        <ProfileModifierBlock key={idx} title={mod.title} content={mod.content} />
      ))}
      {videoPlaceholder}
      {exercise.commonMistakes !== null && (
        <div className="space-y-2">
          <h3 className="text-heading-4 font-semibold text-text-heading">
            Common mistakes
          </h3>
          <ContentBlockList blocks={exercise.commonMistakes} />
        </div>
      )}
      {exercise.contraindications !== null && (
        <div className="space-y-2">
          <h3 className="text-heading-4 font-semibold text-text-heading">
            Contraindications
          </h3>
          <ContentBlockList blocks={exercise.contraindications} />
        </div>
      )}
    </div>
  )

  // ── First view — full content ─────────────────────────────────────────────
  if (firstView) {
    return (
      <div className="max-w-reading mx-auto pt-space-5 pb-space-6 space-y-6">
        {fullExplanation}
        {completeAffordance}
      </div>
    )
  }

  // ── Condensed view — summary + expand toggle ──────────────────────────────
  return (
    <div className="max-w-reading mx-auto pt-space-5 pb-space-6 space-y-4">
      {/* 1. Exercise name */}
      <h2 className="text-heading-3 font-semibold text-text-heading">
        {exercise.name}
      </h2>

      {/* 2. Expand toggle — reveals full explanation (items 1-7) inline */}
      <ExpandToggle expandedContent={fullExplanation} />

      {/* 3. Brief summary — first ContentBlock from fullContent */}
      {exercise.fullContent.length > 0 && (
        <ContentBlock block={exercise.fullContent[0]} />
      )}

      {/* 4. Video placeholder */}
      {videoPlaceholder}

      {/* 5. Complete affordance */}
      {completeAffordance}
    </div>
  )
}
