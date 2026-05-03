'use client'

// app/analytics/RefreshButton.tsx
// Minimal client component — provides window.location.reload() for
// the server-component analytics error state (D3).

export default function RefreshButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="bg-primary hover:bg-primary-hover text-white text-[15px] font-medium px-6 py-3 rounded-lg transition-colors"
    >
      Refresh page
    </button>
  )
}
