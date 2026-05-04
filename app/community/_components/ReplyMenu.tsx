'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal } from 'lucide-react'

interface Props {
  canDelete: boolean
  onDeleteClick: () => void
}

export default function ReplyMenu({ canDelete, onDeleteClick }: Props) {
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

  if (!canDelete) return null

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="More actions"
        aria-expanded={open}
        className="text-text-muted hover:text-text-body p-1.5 rounded-md hover:bg-background transition-colors"
      >
        <MoreHorizontal className="w-3.5 h-3.5" strokeWidth={2.25} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 z-10 bg-surface border border-border rounded-lg shadow-lg py-1 min-w-[140px]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onDeleteClick()
            }}
            className="w-full text-left text-[13px] text-error hover:bg-background px-3 py-2 transition-colors"
          >
            Delete reply
          </button>
        </div>
      )}
    </div>
  )
}
