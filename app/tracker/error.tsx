'use client'

export default function TrackerError({
  error: _error,
  reset: _reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-heading-2 text-text-heading mb-3">
        Something went wrong loading your tracker.
      </h1>
      <p className="text-body-sm text-text-muted mb-6">
        Please refresh the page.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-primary text-white text-btn-primary px-5 py-2.5 min-h-[44px] rounded-lg hover:bg-primary-hover active:bg-primary-active transition-colors duration-150"
      >
        Refresh page
      </button>
    </div>
  )
}
