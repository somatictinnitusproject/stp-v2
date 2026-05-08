'use client'

// /components/exercise/video-expand-toggle.tsx
// Collapsed video expand link for condensed-view /session exercises.
// Default: "Watch demonstration" text link with right chevron. On tap:
// chevron rotates to down, VideoSlot expands inline with max-height +
// opacity transition. State is NOT persisted — collapses on next page load.

import { useState } from 'react'
import VideoSlot from '@/components/ui/VideoSlot'
import { resolveVideoId } from '@/content/video-config'

interface VideoExpandToggleProps {
  videoId: string | null
  videoKey: string
  label: string
}

export function VideoExpandToggle({ videoId, videoKey, label }: VideoExpandToggleProps) {
  // No video — don't render the toggle at all.
  const hasDirectVideoId = videoId !== null && videoId !== undefined && videoId.length > 0
  const resolvedFromKey = videoKey ? resolveVideoId(videoKey) : null
  const hasResolvedVideo = resolvedFromKey !== null && !resolvedFromKey.isPlaceholder
  if (!hasDirectVideoId && !hasResolvedVideo) {
    return null
  }

  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium leading-none text-primary hover:text-primary-hover transition-colors min-h-[44px] py-2"
      >
        {expanded ? 'Hide demonstration' : 'Watch demonstration'}
        <svg
          width="14"
          height="14"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="transition-transform duration-[250ms] ease-in-out"
          style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          <polyline points="8 5 13 10 8 15" />
        </svg>
      </button>
      <div
        style={{
          maxHeight: expanded ? '600px' : '0px',
          overflow: 'hidden',
          opacity: expanded ? 1 : 0,
          transition: 'max-height 250ms ease-in-out, opacity 200ms ease-in-out',
        }}
      >
        <VideoSlot videoId={videoId} videoKey={videoKey} label={label} />
      </div>
    </div>
  )
}
