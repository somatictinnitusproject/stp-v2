import TopNav from '@/components/nav/TopNav'
import BottomNav from '@/components/nav/BottomNav'

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="max-w-[1120px] mx-auto px-4 md:px-8 pt-[60px] pb-[80px] md:pb-8">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
