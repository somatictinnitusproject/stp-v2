export const dynamic = 'force-dynamic'

// app/exercise-library/[category]/[slug]/page.tsx
// ─────────────────────────────────────────────────────────────────
// Individual exercise page. Per Doc 12 §7.7.
//
// Validation order:
//   1. Auth + membership gate (canAccessPlatform)
//   2. Category slug must resolve via getCategoryDisplayName
//   3. Exercise slug must resolve via getExerciseBySlug
//   4. Exercise.category must match the URL category (defends against
//      mismatched links — e.g. /jaw-release/<cervical-slug>)
//
// Any failure renders the inline 404 with a back link.
//
// Renders ExerciseView in firstView mode without onComplete (read-only
// library context — no Complete button). Phase context line + related
// exercises + back link wrap the view.
// ─────────────────────────────────────────────────────────────────

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AuthShell from '@/components/shells/AuthShell'
import { canAccessPlatform } from '@/lib/auth/access'
import {
  getCategoryDisplayName,
  getExerciseBySlug,
  getFilterLabel,
  getRelatedExercises,
} from '@/content/exercises/_lookup'
import type { Exercise } from '@/content/exercises/_types'
import type { Phase1AssessmentRow } from '@/lib/scoring/types'
import ExerciseView from '@/components/exercise/exercise-view'
import ExerciseCard, { type LibraryExerciseEntry } from '../../_components/ExerciseCard'
import LibraryFirstViewMarker from './LibraryFirstViewMarker'

interface PageProps {
  params: Promise<{ category: string; slug: string }>
}

// Maps an exercise to a flat phase context label per Decision Q4.
// Inline rather than in _lookup because this is UI text, not data.
function getPhaseContextLabel(exercise: Exercise): string {
  const ref = exercise.sectionRef
  if (ref === 'D.4') return 'Phase 3 — Jaw and TMJ Protocol'
  if (ref.startsWith('D.')) {
    const num = Number(ref.slice(2))
    if (num >= 5 && num <= 13) return 'Phase 3 — Jaw and TMJ Release'
    if (num >= 14) return 'Phase 3 — Jaw and TMJ Resistance'
  }
  if (ref.startsWith('E.')) {
    const num = Number(ref.slice(2))
    if (num >= 5 && num <= 12) return 'Phase 3 — Cervical Release'
    if (num >= 13) return 'Phase 3 — Cervical Retraining'
  }
  return 'Phase 3'
}

function InlineNotFound({ message }: { message: string }) {
  return (
    <AuthShell>
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <h1 className="text-[22px] font-semibold text-text-heading mb-2">{message}</h1>
        <Link
          href="/exercise-library"
          className="inline-flex items-center justify-center h-11 px-5 rounded-lg bg-primary hover:bg-primary-hover text-white text-[15px] font-medium transition-colors no-underline"
        >
          Back to Exercise Library
        </Link>
      </div>
    </AuthShell>
  )
}

export default async function IndividualExercisePage({ params }: PageProps) {
  const { category: categorySlug, slug: exerciseSlug } = await params

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

  // Validate category slug.
  const categoryDisplayName = getCategoryDisplayName(categorySlug)
  if (categoryDisplayName === null) {
    return <InlineNotFound message="This category doesn't exist." />
  }

  // Validate exercise slug.
  const exercise = getExerciseBySlug(exerciseSlug)
  if (exercise === null) {
    return <InlineNotFound message="This exercise doesn't exist." />
  }

  // Defend against category/exercise mismatch — e.g.
  // /exercise-library/cervical-release/d6-masseter-release.
  if (exercise.category !== categorySlug) {
    return <InlineNotFound message="This exercise doesn't exist in this category." />
  }

  // Fetch phase1_assessment for profile modifier qualification + protocol tag.
  const { data: phase1Assessment, error: phase1Error } = await supabase
    .from('phase1_assessment')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (phase1Error) {
    console.error(
      '[exercise-library/exercise] phase1_assessment fetch failed:',
      phase1Error.message,
      'user:',
      user.id,
    )
  }

  const phase1 = (phase1Assessment ?? {}) as Phase1AssessmentRow
  const tmjAssigned = phase1Assessment?.tmj_protocol_assigned === true
  const cervAssigned = phase1Assessment?.cerv_protocol_assigned === true
  const phase1Complete = phase1Assessment !== null && phase1Assessment !== undefined

  // Compute in-protocol for related cards.
  const computeInProtocol = (ex: Exercise): boolean => {
    if (!phase1Complete) return false
    if (ex.bodyRegion === 'jaw' && tmjAssigned) return true
    if (ex.bodyRegion === 'cervical' && cervAssigned) return true
    if (ex.bodyRegion === 'general' && (tmjAssigned || cervAssigned)) return true
    return false
  }

  const exerciseInProtocol = computeInProtocol(exercise)
  const phaseContextLabel = getPhaseContextLabel(exercise)

  // Related exercises — up to 3 same-category siblings.
  const relatedExercises = getRelatedExercises(exercise, 3)
  const relatedEntries: LibraryExerciseEntry[] = relatedExercises.map((rel) => ({
    id: rel.id,
    slug: rel.id.toLowerCase().replace(/_/g, '-'),
    name: rel.name,
    category: rel.category,
    bodyRegion: rel.bodyRegion,
    libraryDurationLabel: rel.libraryDurationLabel,
    videoId: rel.videoId,
    filterLabel: getFilterLabel(rel),
    inProtocol: computeInProtocol(rel),
  }))

  return (
    <AuthShell>
      <LibraryFirstViewMarker exerciseId={exercise.id} />

      <div className="flex flex-col gap-5">
        {/* Back link */}
        <Link
          href={`/exercise-library/${categorySlug}`}
          className="inline-flex items-center gap-1 text-[13px] text-text-muted hover:text-text-body transition-colors no-underline w-fit"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="12 15 7 10 12 5" />
          </svg>
          {categoryDisplayName}
        </Link>

        {/* Phase context + protocol tag row */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="inline-flex items-center h-6 px-2 rounded-full text-[11px] font-medium text-text-muted bg-surface-raised">
            {phaseContextLabel.toUpperCase()}
          </span>
          {exerciseInProtocol && (
            <span className="inline-flex items-center h-6 px-2 rounded-full text-[11px] font-medium text-primary bg-surface border border-primary">
              IN YOUR PROTOCOL
            </span>
          )}
          <span className="text-[13px] text-text-muted">{exercise.libraryDurationLabel}</span>
        </div>

        {/* Exercise view — firstView mode, no onComplete */}
        <ExerciseView
          exercise={exercise}
          phase1={phase1}
          firstView={true}
        />

        {/* Related exercises */}
        {relatedEntries.length > 0 && (
          <div className="flex flex-col gap-3 mt-4">
            <h2 className="text-[18px] font-semibold text-text-heading">
              Related exercises
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {relatedEntries.map((entry) => (
                <ExerciseCard key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AuthShell>
  )
}
