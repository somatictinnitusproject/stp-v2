'use client'

import { useState, type ReactNode } from 'react'
import CharterModal from './CharterModal'

interface Props {
  initiallyAcknowledged: boolean
  children: ReactNode
}

export default function CharterGate({
  initiallyAcknowledged,
  children,
}: Props) {
  const [acknowledged, setAcknowledged] = useState(initiallyAcknowledged)

  if (!acknowledged) {
    return (
      <>
        {children}
        <CharterModal onAcknowledged={() => setAcknowledged(true)} />
      </>
    )
  }

  return <>{children}</>
}
