'use client'

// Shared exercise card used by both the library home page grid and the
// category page grid. Per Doc 11 §C5: thumbnail flush to top, content
// padding below. Entire card tappable. Hover: border colour primary.
//
// LibraryExerciseEntry is the shared shape produced by both server pages
// from raw Exercise objects + per-member protocol assignment.

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

export default function ExerciseCard({ entry }: { entry: LibraryExerciseEntry }) {
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
      aria-label={`${entry.name}: open exercise`}
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
