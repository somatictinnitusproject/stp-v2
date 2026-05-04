'use client'

// /exercise-library — client component
// ─────────────────────────────────────────────────────────────────
// Owns search and filter state. Renders subheading, optional Phase 1
// inline note, search input, filter pill row, and exercise grid.
//
// Filter pill (active label) persisted in localStorage per Doc 12 §7.5.
// Search query persisted in sessionStorage per Doc 12 §7.7.
//
// Search activates on >= 2 characters per Doc 12 §7.4. Below the
// threshold, the full unfiltered list (within active filter) renders.
//
// Filter pills shown: "All" plus any pill label that has at least one
// matching exercise. Empty body-region pills (Postural, Nervous System,
// Breathing, Assessment) are hidden at launch — they appear once those
// categories have authored exercises.
// ─────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

export interface LibraryExerciseEntry {
  id: string
  slug: string
  name: string
  category: 'jaw-release' | 'cervical-release' | 'resistance-training'
  bodyRegion: 'jaw' | 'cervical' | 'general'
  libraryDurationLabel: string
  videoId: string | null
  filterLabel: 'Jaw and TMJ' | 'Cervical' | null
  inProtocol: boolean
}

interface Props {
  entries: LibraryExerciseEntry[]
  totalCount: number
  inProtocolCount: number
  phase1Complete: boolean
}

const FILTER_STORAGE_KEY = 'exerciseLibrary.activeFilter'
const SEARCH_STORAGE_KEY = 'exerciseLibrary.searchQuery'
const SEARCH_MIN_CHARS = 2

type FilterValue = 'All' | 'Jaw and TMJ' | 'Cervical'

export default function ExerciseLibraryClient({
  entries,
  totalCount,
  inProtocolCount,
  phase1Complete,
}: Props) {
  // Hydration-safe initial values — read storage in effect, not on first render.
  const [activeFilter, setActiveFilter] = useState<FilterValue>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')

  useEffect(() => {
    try {
      const savedFilter = window.localStorage.getItem(FILTER_STORAGE_KEY)
      if (savedFilter === 'Jaw and TMJ' || savedFilter === 'Cervical' || savedFilter === 'All') {
        setActiveFilter(savedFilter)
      }
      const savedSearch = window.sessionStorage.getItem(SEARCH_STORAGE_KEY)
      if (savedSearch) setSearchQuery(savedSearch)
    } catch {
      // localStorage / sessionStorage unavailable — fall through to defaults.
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(FILTER_STORAGE_KEY, activeFilter)
    } catch {
      // ignore quota / unavailable
    }
  }, [activeFilter])

  useEffect(() => {
    try {
      if (searchQuery.length > 0) {
        window.sessionStorage.setItem(SEARCH_STORAGE_KEY, searchQuery)
      } else {
        window.sessionStorage.removeItem(SEARCH_STORAGE_KEY)
      }
    } catch {
      // ignore
    }
  }, [searchQuery])

  // Determine which filter pills to show — only those with at least one
  // matching exercise.
  const visibleFilters: FilterValue[] = useMemo(() => {
    const filters: FilterValue[] = ['All']
    if (entries.some((e) => e.filterLabel === 'Jaw and TMJ')) filters.push('Jaw and TMJ')
    if (entries.some((e) => e.filterLabel === 'Cervical')) filters.push('Cervical')
    return filters
  }, [entries])

  // Apply filter then search.
  const filteredEntries = useMemo(() => {
    let result = entries

    if (activeFilter !== 'All') {
      result = result.filter((e) => e.filterLabel === activeFilter)
    }

    if (searchQuery.length >= SEARCH_MIN_CHARS) {
      const q = searchQuery.toLowerCase()
      result = result.filter((e) => e.name.toLowerCase().includes(q))
    }

    return result
  }, [entries, activeFilter, searchQuery])

  const handleClearSearch = () => setSearchQuery('')
  const handleClearAll = () => {
    setSearchQuery('')
    setActiveFilter('All')
  }

  const showSubheadingProtocol = phase1Complete

  return (
    <div className="flex flex-col gap-5">
      {/* Heading + count subheading */}
      <div>
        <h1 className="text-[28px] font-bold text-text-heading leading-tight">
          Exercise Library
        </h1>
        <p className="text-[15px] text-text-muted mt-1">
          {totalCount} exercises across all phases
          {showSubheadingProtocol && (
            <>
              {' '}&mdash;{' '}
              <span className="text-primary font-medium">
                {inProtocolCount} in your protocol
              </span>
            </>
          )}
        </p>
      </div>

      {/* Pre-Phase-1 inline note */}
      {!phase1Complete && (
        <div className="bg-surface-raised border border-border rounded-lg px-4 py-3">
          <p className="text-[14px] text-text-muted">
            Complete Phase 1 to see which exercises are in your protocol.
          </p>
        </div>
      )}

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
          placeholder="Search exercises..."
          aria-label="Search exercises"
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

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {visibleFilters.map((filter) => {
          const isActive = activeFilter === filter
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              aria-pressed={isActive}
              className={[
                'h-9 px-4 rounded-full font-medium text-[14px] shrink-0 transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border text-text-muted hover:bg-surface-raised',
              ].join(' ')}
            >
              {filter}
            </button>
          )
        })}
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
          <p className="text-[14px] text-text-muted mb-4">
            Try a different search or clear the filter.
          </p>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-[14px] font-medium text-primary hover:underline"
          >
            Clear search and filter
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

// ── ExerciseCard ─────────────────────────────────────────────────────────────
// Per Doc 11 §C5. Inherits Interactive Card styling — full card tappable,
// border + box-shadow on hover. Thumbnail flush to top, content padding
// below.

function ExerciseCard({ entry }: { entry: LibraryExerciseEntry }) {
  const href = `/exercise-library/${entry.category}/${entry.slug}`

  // Cloudflare Stream auto-thumbnail URL pattern: when videoId is set,
  // https://videodelivery.net/{UID}/thumbnails/thumbnail.jpg returns the
  // first-frame thumbnail. Until videos are filmed, fall back to the
  // styled placeholder.
  const hasVideo = entry.videoId !== null && entry.videoId.length > 0
  const thumbnailUrl = hasVideo
    ? `https://videodelivery.net/${entry.videoId}/thumbnails/thumbnail.jpg`
    : null

  return (
    <Link
      href={href}
      className="group block bg-surface border border-border rounded-xl overflow-hidden no-underline transition-colors duration-150 hover:border-primary"
      aria-label={`${entry.name} — open exercise`}
    >
      {/* Thumbnail */}
      <div
        className="w-full bg-surface-raised flex items-center justify-center relative"
        style={{ aspectRatio: '16 / 9' }}
      >
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-12 h-12 rounded-full border border-border bg-surface flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M7 5.5l8 4.5-8 4.5V5.5z" fill="#6B7280" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-3 py-3 flex flex-col gap-2">
        <h3 className="text-[15px] font-semibold text-text-heading leading-tight">
          {entry.name}
        </h3>

        {/* Tags row */}
        <div className="flex flex-wrap gap-1">
          {entry.inProtocol && (
            <span className="inline-flex items-center h-6 px-2 rounded-full text-[11px] font-medium text-primary bg-surface border border-primary">
              IN YOUR PROTOCOL
            </span>
          )}
          {entry.filterLabel && (
            <span className="inline-flex items-center h-6 px-2 rounded-full text-[11px] font-medium text-text-muted bg-surface-raised">
              {entry.filterLabel.toUpperCase()}
            </span>
          )}
        </div>

        {/* Duration */}
        <p className="text-[13px] text-text-muted">{entry.libraryDurationLabel}</p>
      </div>
    </Link>
  )
}
