'use client'

import { useEffect, useId } from 'react'

type Props = {
  open: boolean
  today: string            // YYYY-MM-DD
  recentLogDates: string[] // dates within 7-day window that already have logs
  onPickDate: (dateStr: string) => void
  onClose: () => void
}

export default function RetroactiveDayPicker({ open, today, recentLogDates, onPickDate, onClose }: Props) {
  const headingId = useId()
  const loggedSet = new Set(recentLogDates)

  // 7 days newest-first: today through today-6
  const days = Array.from({ length: 7 }, (_, i) => {
    const ms = new Date(today + 'T00:00:00Z').getTime() - i * 86_400_000
    return new Date(ms).toISOString().split('T')[0]
  })

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-overlay modal-fade-in min-[480px]:bg-black/40 min-[480px]:flex min-[480px]:items-center min-[480px]:justify-center min-[480px]:px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="bg-surface-overlay w-full h-full flex flex-col p-6 z-modal min-[480px]:h-auto min-[480px]:max-w-modal min-[480px]:rounded-xl min-[480px]:shadow-modal"
      >
        <h2 id={headingId} className="text-heading-2 text-text-heading mb-5">
          Log a missed day
        </h2>

        <div className="flex flex-col gap-1">
          {days.map((dateStr) => {
            const isToday  = dateStr === today
            const isLogged = loggedSet.has(dateStr)

            const formatted = new Intl.DateTimeFormat('en-GB', {
              weekday: 'long', day: 'numeric', month: 'long',
            }).format(new Date(dateStr + 'T12:00:00'))

            if (isToday) {
              return (
                <div key={dateStr}
                  className="flex items-center justify-between px-4 py-3 rounded-lg opacity-40 cursor-default">
                  <span className="text-body-sm text-text-muted">{formatted}</span>
                  <span className="text-body-sm text-text-muted">Today, use the form above</span>
                </div>
              )
            }

            if (isLogged) {
              return (
                <div key={dateStr}
                  className="flex items-center justify-between px-4 py-3 rounded-lg opacity-50 cursor-default">
                  <span className="text-body-sm text-text-body">{formatted}</span>
                  <span className="flex items-center gap-1.5 text-body-sm text-primary">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" stroke="#4A9B8E" strokeWidth="1.5"/>
                      <polyline points="6,10 9,13 14,8" stroke="#4A9B8E" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Logged
                  </span>
                </div>
              )
            }

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => onPickDate(dateStr)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-left hover:bg-surface-raised transition-colors duration-150"
              >
                <span className="text-body-sm text-text-body">{formatted}</span>
                <span className="text-body-sm text-primary font-medium">Log this day →</span>
              </button>
            )
          })}
        </div>

        <div className="mt-auto min-[480px]:mt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] bg-transparent text-primary text-btn-primary px-5 py-2.5 rounded-lg hover:bg-wins-bg transition-colors duration-150"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
