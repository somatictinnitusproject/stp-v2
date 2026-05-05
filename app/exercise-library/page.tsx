export const dynamic = 'force-dynamic'

// app/exercise-library/page.tsx
// ─────────────────────────────────────────────────────────────────
// /exercise-library — server component. AuthShell + membership-gated
// via canAccessPlatform(). Loads phase1_assessment to compute the
// "in your protocol" tag visibility for each exercise.
//
// Pre-Phase-1 members: phase1_assessment is null. No protocol tags
// rendered. Inline note shown above search bar per Doc 12 §7.9.
//
// All exercise content read from /content/exercises via _lookup.ts.
// No exercise content fetched from the database — content lives in
// static TypeScript files.
// ─────────────────────────────────────────────────────────────────

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AuthShell from '@/components/shells/AuthShell'
import { canAccessPlatform } from '@/lib/auth/access'
import {
  getAllLibraryExercises,
  getFilterLabel,
} from '@/content/exercises/_lookup'
import ExerciseLibraryClient, { type LibraryExerciseEntry } from './ExerciseLibraryClient'

export default async function ExerciseLibraryPage() {
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

  const { data: phase1Assessment, error: phase1Error } = await supabase
    .from('phase1_assessment')
    .select('tmj_protocol_assigned, cerv_protocol_assigned')
    .eq('user_id', user.id)
    .maybeSingle()

  if (phase1Error) {
    console.error(
      '[exercise-library] phase1_assessment fetch failed:',
      phase1Error.message,
      'user:',
      user.id,
    )
  }

  const tmjAssigned = phase1Assessment?.tmj_protocol_assigned === true
  const cervAssigned = phase1Assessment?.cerv_protocol_assigned === true
  const phase1Complete = phase1Assessment !== null && phase1Assessment !== undefined

  const exercises = getAllLibraryExercises()

  // Compute per-exercise in-protocol booleans server-side. Pre-Phase-1
  // members get inProtocol = false on every exercise (no tags rendered).
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
      videoId: exercise.videoId,
      filterLabel: getFilterLabel(exercise),
      inProtocol,
    }
  })

  // Count distinct exercises in protocol.
  const inProtocolCount = entries.filter((e) => e.inProtocol).length

  return (
    <AuthShell>
      <ExerciseLibraryClient
        entries={entries}
        totalCount={entries.length}
        inProtocolCount={inProtocolCount}
        phase1Complete={phase1Complete}
      />
    </AuthShell>
  )
}
