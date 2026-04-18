'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WelcomeDashboardButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleClick() {
    setLoading(true)
    setError('')

    const res = await fetch('/api/onboarding/complete', { method: 'POST' })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong. Please try again.')
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="text-[14px] text-error bg-error-tint rounded-lg px-4 py-3">
          {error}
        </p>
      )}
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full bg-primary text-white font-medium text-[15px] py-3 rounded-lg hover:bg-primary-hover active:bg-primary-active disabled:bg-primary-disabled disabled:cursor-not-allowed transition-colors duration-150"
      >
        {loading ? 'Taking you there...' : 'Go to my dashboard'}
      </button>
    </div>
  )
}
