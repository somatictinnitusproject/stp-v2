'use client'
import { useEffect, useRef, useState } from 'react'
import { Smartphone, X, Share2 } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type CardState = 'hidden' | 'ios' | 'android'

export default function InstallPromptCard() {
  const [state, setState] = useState<CardState>('hidden')
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (localStorage.getItem('pwa-install-dismissed') === 'true') return

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    if (isIOS && !isStandalone) {
      setState('ios')
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      setState('android')
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    localStorage.setItem('pwa-install-dismissed', 'true')
    setState('hidden')
  }

  async function install() {
    if (!deferredPrompt.current) return
    await deferredPrompt.current.prompt()
    const { outcome } = await deferredPrompt.current.userChoice
    if (outcome === 'accepted' || outcome === 'dismissed') {
      localStorage.setItem('pwa-install-dismissed', 'true')
      setState('hidden')
    }
  }

  if (state === 'hidden') return null

  return (
    <div className="bg-surface border border-border rounded-xl p-4 mb-5 flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
        <Smartphone size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[14px] font-semibold text-text-heading">
            Install STP for quick access
          </p>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="text-text-muted hover:text-text-body transition-colors shrink-0 mt-0.5"
          >
            <X size={16} />
          </button>
        </div>
        {state === 'ios' ? (
          <p className="text-[13px] text-text-muted mt-1 leading-relaxed">
            Tap the{' '}
            <Share2 size={13} className="inline-block align-middle -mt-0.5 mx-0.5" />
            {' '}Share button below, then &lsquo;Add to Home Screen&rsquo; to install.
          </p>
        ) : (
          <>
            <p className="text-[13px] text-text-muted mt-1">
              Add to your home screen for one-tap access to your daily session.
            </p>
            <button
              onClick={install}
              className="mt-3 bg-primary text-white text-[13px] font-medium px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
            >
              Install app
            </button>
          </>
        )}
      </div>
    </div>
  )
}
