// /components/exercise/exercise-view.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Server component. Renders a single Phase 3 exercise in either first-view
// (full content) or condensed-view (ExpandToggle + brief summary) mode.
//
// Implements the first-view-vs-condensed-view contract from Doc 12 §6.5.
// Profile modifier silent-omission per errata P3-13 — strict equality filter.
// Timer deferred to post-launch per errata P3-17 — always renders CompleteButton.
//
// onComplete is a Server Action forwarded from the /session page (M13g).
// No data fetching here — all data comes via props.
// ─────────────────────────────────────────────────────────────────────────────

import type { Exercise } from '@/content/exercises/_types'
import type { Phase1AssessmentRow } from '@/lib/scoring/types'
import { ContentBlockList } from './content-block'
import { ProfileModifierBlock } from './profile-modifier-block'
import { ExpandToggle } from './expand-toggle'
import { CompleteButton } from './complete-button'
import { filterQualifyingModifiers } from './_helpers'
import VideoSlot from '@/components/ui/VideoSlot'

// Re-exported so existing test imports (./exercise-view) continue to work.
export { filterQualifyingModifiers } from './_helpers'

interface ExerciseViewProps {
  exercise: Exercise
  phase1: Phase1AssessmentRow
  firstView: boolean          // derived from exercises_viewed[exercise.id] in parent
  // Server Action for marking complete. When omitted, no Complete /
  // Continue / Skip button is rendered — used by /exercise-library
  // pages where the exercise view is read-only.
  onComplete?: () => Promise<void>
}

export default function ExerciseView({
  exercise,
  phase1,
  firstView,
  onComplete,
}: ExerciseViewProps) {
  const qualifyingModifiers = filterQualifyingModifiers(exercise.profileModifiers, phase1)

  // Complete affordance — optional exercises get Continue + Skip (same handler, same API path).
  // When onComplete is not provided (library context), no affordance renders.
  const completeAffordance = !onComplete ? null : exercise.optional ? (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onComplete}
        className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-body font-semibold transition-colors"
      >
        Continue
      </button>
      <button
        type="button"
        onClick={onComplete}
        className="w-full py-3 px-4 rounded-lg border border-primary text-primary text-body font-semibold hover:bg-primary/5 transition-colors"
      >
        Skip
      </button>
    </div>
  ) : (
    <CompleteButton onComplete={onComplete} />
  )

  // Video — renders Cloudflare Stream iframe when videoId is set on the
  // exercise object, else falls back to videoKey lookup against video-config,
  // else renders the "Video coming soon" placeholder.
  const videoKey = exercise.id.toLowerCase()
  const videoPlaceholder = (
    <VideoSlot
      videoId={exercise.videoId}
      videoKey={videoKey}
      label={exercise.name}
    />
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
      {!exercise.optional && (
        <p className="text-body-sm text-text-muted mt-0 mb-3">~{exercise.estimatedMinutes} min</p>
      )}
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
      {!exercise.optional && (
        <p className="text-body-sm text-text-muted mt-0 mb-3">~{exercise.estimatedMinutes} min</p>
      )}

      {/* 2. Expand toggle — reveals full explanation (items 1-7) inline */}
      <ExpandToggle expandedContent={fullExplanation} />

      {/* Condensed summary — technique recap authored per exercise */}
      <ContentBlockList blocks={exercise.condensedSummary} />

      {/* 4. Video placeholder */}
      {videoPlaceholder}

      {/* 5. Complete affordance */}
      {completeAffordance}
    </div>
  )
}
