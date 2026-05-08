'use client'

// VideoSlot — Cloudflare Stream player with placeholder fallback.
//
// Per Doc 14 §6.5: 16:9 iframe, no autoplay, member-initiated playback.
// Per Doc 12 §7.9: "Video coming soon" badge when no real ID is set.
//
// Two API modes:
//   <VideoSlot videoId="abc123..." />          — direct UID (Phase 1)
//   <VideoSlot videoKey="d6_masseter_release"/>— keyed lookup (exercises)
//
// videoId wins if both are provided. If neither resolves to a real UID,
// the placeholder state renders.
//
// Optional compact mode caps height at 200px — used inside Phase 1
// assessment question cards where multiple stack vertically. Library
// and exercise pages use the default (no cap, 16:9 fills width).

import { resolveVideoId } from '@/content/video-config'

interface VideoSlotProps {
  videoId?: string | null
  videoKey?: string
  label?: string
  compact?: boolean
}

export default function VideoSlot({
  videoId,
  videoKey,
  label = 'Watch demonstration',
  compact = false,
}: VideoSlotProps) {
  // Resolve the final video UID. Direct videoId wins. Otherwise resolve
  // through video-config. Empty string => placeholder.
  let resolvedId = ''
  let isPlaceholder = true

  if (videoId && videoId.length > 0) {
    resolvedId = videoId
    isPlaceholder = false
  } else if (videoKey) {
    const resolved = resolveVideoId(videoKey)
    resolvedId = resolved.id
    isPlaceholder = resolved.isPlaceholder
  }

  const containerStyle = compact
    ? { aspectRatio: '16 / 9', maxHeight: '200px' }
    : { aspectRatio: '16 / 9' }

  // Real video — render the Cloudflare Stream iframe.
  if (!isPlaceholder) {
    return (
      <div className="w-full my-5">
        <div
          className="relative w-full bg-surface-raised rounded-[8px] overflow-hidden"
          style={containerStyle}
        >
          <iframe
            src={`https://iframe.cloudflarestream.com/${resolvedId}`}
            title={label}
            allow="accelerometer; gyroscope; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </div>
    )
  }

  // No video — render nothing. Layout closes up cleanly.
  return null
}
