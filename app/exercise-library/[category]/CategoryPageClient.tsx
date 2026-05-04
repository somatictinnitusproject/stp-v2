'use client'

// Category page client component. Header + back link + search + grid.
// No filter pill row (page is already filtered to one category by route).
// Search activates at 2+ chars per Doc 12 §7.4.
//
// Search query persisted in sessionStorage scoped per category — back
// from individual exercise page returns the member to their search state.

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import ExerciseCard, { type LibraryExerciseEntry } from '../_components/ExerciseCard'

interface Props {
  displayName: string
  entries: LibraryExerciseEntry[]
}

const SEARCH_MIN_CHARS = 2

export default function CategoryPageClient({ displayName, entries }: Props) {
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Per-category sessionStorage key — searches don't leak between categories.
  const storageKey = useMemo(
    () => `exerciseLibrary.category.${entries[0]?.category ?? 'unknown'}.searchQuery`,
    [entries],
  )

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(storageKey)
      if (saved) setSearchQuery(saved)
    } catch {
      // ignore
    }
  }, [storageKey])

  useEffect(() => {
    try {
      if (searchQuery.length > 0) {
        window.sessionStorage.setItem(storageKey, searchQuery)
      } else {
        window.sessionStorage.removeItem(storageKey)
      }
    } catch {
      // ignore
    }
  }, [searchQuery, storageKey])

  const filteredEntries = useMemo(() => {
    if (searchQuery.length < SEARCH_MIN_CHARS) return entries
    const q = searchQuery.toLowerCase()
    return entries.filter((e) => e.name.toLowerCase().includes(q))
  }, [entries, searchQuery])

  const handleClearSearch = () => setSearchQuery('')

  return (
    <div className="flex flex-col gap-5">
      {/* Back link + heading */}
      <div className="flex flex-col gap-2">
        <Link
          href="/exercise-library"
          className="inline-flex items-center gap-1 text-[13px] text-text-muted hover:text-text-body transition-colors no-underline w-fit"
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="12 15 7 10 12 5" />
          </svg>
          Exercise Library
        </Link>
        <h1 className="text-[28px] font-bold text-text-heading leading-tight">
          {displayName}
        </h1>
        <p className="text-[15px] text-text-muted">
          {entries.length} exercise{entries.length === 1 ? '' : 's'}
        </p>
      </div>

      {/* Search input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="9" cy="9" r="6" />
          <line x1="13.5" y1="13.5" x2="17" y2="17" />
        </svg>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${displayName}...`}
          aria-label={`Search ${displayName}`}
          className="w-full h-11 pl-10 pr-10 text-[16px] bg-surface border border-border rounded-lg text-text-body placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
        />
        {searchQuery.length > 0 && (
          <button
            type="button"
            onClick={handleClearSearch}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-body transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="5" x2="15" y2="15" />
              <line x1="15" y1="5" x2="5" y2="15" />
            </svg>
          </button>
        )}
      </div>

      {/* Grid or empty state */}
      {filteredEntries.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl px-6 py-10 text-center">
          <p className="text-[15px] text-text-body mb-3">
            No exercises found
            {searchQuery.length >= SEARCH_MIN_CHARS && (
              <> for &ldquo;{searchQuery}&rdquo;</>
            )}
            .
          </p>
          <button
            type="button"
            onClick={handleClearSearch}
            className="text-[14px] font-medium text-primary hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filteredEntries.map((entry) => (
            <ExerciseCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
