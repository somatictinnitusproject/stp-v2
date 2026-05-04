'use client'

// app/exercise-library/[category]/[slug]/LibraryFirstViewMarker.tsx
// ─────────────────────────────────────────────────────────────────
// Side-effect-only client component that fires the
// markLibraryExerciseViewed Server Action once on mount, then unmounts
// no UI of its own.
//
// Per Doc 13 §5.8: visiting an exercise (anywhere) marks it viewed.
// Library visits feed the same exercises_viewed JSONB that /session
// reads to decide first-view vs condensed-view.
// ─────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import { markLibraryExerciseViewed } from '../../actions'

export default function LibraryFirstViewMarker({ exerciseId }: { exerciseId: string }) {
  const firedRef = useRef(false)

  useEffect(() => {
    if (firedRef.current) return
    firedRef.current = true
    markLibraryExerciseViewed(exerciseId).catch(() => {
      // Silent failure — the Server Action already logs server-side.
    })
  }, [exerciseId])

  return null
}
