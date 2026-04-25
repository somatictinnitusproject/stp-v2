'use client'

// VideoSlot — placeholder for Cloudflare Stream embeds (Doc 14).
// When videoId is null: "Video coming soon" state per Doc 11 §F14.
// When videoId is set: same placeholder with data-video-id attr for future hookup.
// Aspect ratio 16:9, max-height 200px on mobile. Rounded-[8px] matching card style.

export default function VideoSlot({
  videoId,
  label = 'Watch demonstration',
}: {
  videoId?: string | null
  label?: string
}) {
  return (
    <div className="w-full my-5">
      <div
        className="relative w-full bg-surface-raised rounded-[8px] overflow-hidden flex items-center justify-center"
        style={{ aspectRatio: '16 / 9', maxHeight: '200px' }}
        data-video-id={videoId ?? undefined}
      >
        {/* Play icon */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M7 5.5l8 4.5-8 4.5V5.5z" fill="#6B7280" />
            </svg>
          </div>
          <p className="text-body-sm text-text-muted">
            {videoId ? label : 'Video coming soon'}
          </p>
        </div>
      </div>
    </div>
  )
}
