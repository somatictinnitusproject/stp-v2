'use client'

// ScrollProgressBar — fixed top bar fills primary colour as member scrolls.
// Reusable across long reading pages. Cleanup on unmount prevents memory leaks.
// z-index 50 = above content, below modal overlays.

import { useEffect, useState } from 'react'

export default function ScrollProgressBar() {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    function onScroll() {
      const scrolled = window.scrollY
      const total = document.documentElement.scrollHeight - window.innerHeight
      setPct(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-surface-raised">
      <div
        className="h-full bg-primary transition-[width] duration-75"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
