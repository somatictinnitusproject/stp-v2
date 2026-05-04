'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal } from 'lucide-react'

interface Props {
  canDelete: boolean
  canPin: boolean
  isPinned: boolean
  onPinToggle?: () => void
  onDeleteClick?: () => void
}

export default function PostMenu({
  canDelete,
  canPin,
  isPinned,
  onPinToggle,
  onDeleteClick,
}: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  if (!canDelete && !canPin) return null

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="More actions"
        aria-expanded={open}
        className="text-text-muted hover:text-text-body p-1.5 rounded-md hover:bg-background transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" strokeWidth={2.25} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 z-10 bg-surface border border-border rounded-lg shadow-lg py-1 min-w-[140px]"
        >
          {canPin && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onPinToggle?.()
              }}
              className="w-full text-left text-[13px] text-text-body hover:bg-background px-3 py-2 transition-colors"
            >
              {isPinned ? 'Unpin post' : 'Pin post'}
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onDeleteClick?.()
              }}
              className="w-full text-left text-[13px] text-error hover:bg-background px-3 py-2 transition-colors"
            >
              Delete post
            </button>
          )}
        </div>
      )}
    </div>
  )
}
