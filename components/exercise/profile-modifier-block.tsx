// /components/exercise/profile-modifier-block.tsx
// Renders one profile modifier block — boxed callout with title + content.
// Server component — no 'use client'.
//
// Silent-omission (P3-13) happens in the PARENT (ExerciseView filter).
// This component assumes the modifier has already qualified to render.

import type { ContentBlock } from '@/content/exercises/_types'
import { ContentBlockList } from './content-block'

interface ProfileModifierBlockProps {
  title: string
  content: ContentBlock[]
}

export function ProfileModifierBlock({ title, content }: ProfileModifierBlockProps) {
  return (
    <div className="rounded-lg bg-surface-raised border border-border px-5 py-4 space-y-3">
      <p className="text-heading-4 font-semibold text-text-heading">{title}</p>
      <ContentBlockList blocks={content} />
    </div>
  )
}

export default ProfileModifierBlock
