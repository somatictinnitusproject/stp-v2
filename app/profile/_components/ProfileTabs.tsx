'use client'

interface Props {
  active: 'posts' | 'replies'
  onChange: (tab: 'posts' | 'replies') => void
}

export default function ProfileTabs({ active, onChange }: Props) {
  function tabClass(isActive: boolean) {
    return [
      'px-4 py-3 text-[14px] font-medium transition-colors',
      'border-b-2 -mb-[1px]',
      isActive
        ? 'border-primary text-text-heading'
        : 'border-transparent text-text-muted hover:text-text-body',
    ].join(' ')
  }

  return (
    <div className="flex gap-2 border-b border-border mb-5">
      <button
        type="button"
        onClick={() => onChange('posts')}
        className={tabClass(active === 'posts')}
      >
        Posts
      </button>
      <button
        type="button"
        onClick={() => onChange('replies')}
        className={tabClass(active === 'replies')}
      >
        Replies
      </button>
    </div>
  )
}
