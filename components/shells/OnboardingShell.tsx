import Logo from '@/components/nav/Logo'

export default function OnboardingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="h-[60px] flex items-center px-4 md:px-8 border-b border-border bg-surface">
        <Logo />
      </header>
      <main className="max-w-[560px] mx-auto px-4 md:px-8 pt-8 md:pt-12 pb-16">
        {children}
      </main>
    </div>
  )
}
