'use client'

import { useState } from 'react'
import TfiCaptureCard from '@/components/tfi/TfiCaptureCard'

interface Props {
  show: boolean
}

export default function Phase5TfiCard({ show }: Props) {
  const [visible, setVisible] = useState(show)
  const [fading, setFading] = useState(false)

  if (!visible) return null

  function handleDismiss() {
    setFading(true)
    fetch('/api/tfi/dismiss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ capture_point: 'phase5_completion' }),
    }).catch(() => {
      // Best-effort — UI fades immediately regardless.
    })
    setTimeout(() => setVisible(false), 200)
  }

  return (
    <TfiCaptureCard
      capturePoint="phase5_completion"
      fading={fading}
      onDismiss={handleDismiss}
    />
  )
}
