export const dynamic = 'force-dynamic'

// app/exercise-library/[category]/page.tsx
// ─────────────────────────────────────────────────────────────────
// Category page — pre-filtered grid for one of six route slugs:
//   jaw-release, cervical-release, resistance-training,
//   postural, nervous-system, breathing.
//
// Per Doc 12 §7.7 and ERRATA F1.
//
// Three render states:
//   1. Unknown slug — inline 404 with link back to /exercise-library.
//   2. Known slug, no exercises authored yet (postural, nervous-system,
//      breathing) — coming-soon state with link back.
//   3. Known slug with exercises — search bar + filtered grid.
//
// Same auth + membership gate as the home page. Phase 1 protocol
// fetched for "In your protocol" tag computation.
// ─────────────────────────────────────────────────────────────────

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AuthShell from '@/components/shells/AuthShell'
import { canAccessPlatform } from '@/lib/auth/access'
import {
  getCategoryDisplayName,
  getExercisesByCategory,
  getFilterLabel,
} from '@/content/exercises/_lookup'
import { resolveVideoId } from '@/content/video-config'
import type { LibraryExerciseEntry } from '../_components/ExerciseCard'
import CategoryPageClient from './CategoryPageClient'

interface PageProps {
  params: Promise<{ category: string }>
}

export default async function ExerciseCategoryPage({ params }: PageProps) {
  const { category: slug } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('status, is_founding_member, is_free_for_life')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership || !canAccessPlatform(membership)) redirect('/subscription')

  const displayName = getCategoryDisplayName(slug)

  // Unknown slug — inline 404 with link back. Doc 14 §4.7.
  if (displayName === null) {
    return (
      <AuthShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
          <h1 className="text-[22px] font-semibold text-text-heading mb-2">
            This category doesn&apos;t exist.
          </h1>
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

  // Fetch phase1 for protocol tag computation.
  const { data: phase1Assessment, error: phase1Error } = await supabase
    .from('phase1_assessment')
    .select('tmj_protocol_assigned, cerv_protocol_assigned')
    .eq('user_id', user.id)
    .maybeSingle()

  if (phase1Error) {
    console.error(
      '[exercise-library/category] phase1_assessment fetch failed:',
      phase1Error.message,
      'user:',
      user.id,
    )
  }

  const tmjAssigned = phase1Assessment?.tmj_protocol_assigned === true
  const cervAssigned = phase1Assessment?.cerv_protocol_assigned === true
  const phase1Complete = phase1Assessment !== null && phase1Assessment !== undefined

  const exercises = getExercisesByCategory(slug)

  // Coming-soon state: known slug but nothing authored in this category yet.
  if (exercises.length === 0) {
    return (
      <AuthShell>
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-text-heading leading-tight">
              {displayName}
            </h1>
          </div>
          <div className="bg-surface border border-border rounded-xl px-6 py-10 text-center">
            <p className="text-[15px] text-text-body mb-3">
              No exercises in this category yet.
            </p>
            <p className="text-[14px] text-text-muted mb-4">
              Coming soon; we&apos;re adding more exercises across all categories.
            </p>
            <Link
              href="/exercise-library"
              className="text-[14px] font-medium text-primary hover:underline"
            >
              Back to Exercise Library
            </Link>
          </div>
        </div>
      </AuthShell>
    )
  }

  // Compute per-exercise in-protocol booleans.
  const entries: LibraryExerciseEntry[] = exercises.map((exercise) => {
    let inProtocol = false
    if (phase1Complete) {
      if (exercise.bodyRegion === 'jaw' && tmjAssigned) inProtocol = true
      else if (exercise.bodyRegion === 'cervical' && cervAssigned) inProtocol = true
      else if (exercise.bodyRegion === 'general' && (tmjAssigned || cervAssigned)) inProtocol = true
    }
    return {
      id: exercise.id,
      slug: exercise.id.toLowerCase().replace(/_/g, '-'),
      name: exercise.name,
      category: exercise.category,
      bodyRegion: exercise.bodyRegion,
      libraryDurationLabel: exercise.libraryDurationLabel,
      videoId: (() => {
        const key = exercise.id.toLowerCase()
        const resolved = resolveVideoId(key)
        return resolved.isPlaceholder ? null : resolved.id
      })(),
      filterLabel: getFilterLabel(exercise),
      inProtocol,
    }
  })

  return (
    <AuthShell>
      <CategoryPageClient
        displayName={displayName}
        entries={entries}
      />
    </AuthShell>
  )
}
