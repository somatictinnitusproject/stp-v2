import PublicNav from '@/components/nav/PublicNav'

export default function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <main className="max-w-[760px] mx-auto px-4 md:px-8 pt-8 pb-16">
        {children}
      </main>
    </div>
  )
}
