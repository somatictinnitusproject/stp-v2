// /components/exercise/content-block.tsx
// Renders a single ContentBlock from the discriminated union, or a list of blocks.
// Server component — no 'use client'.
// Used by ExerciseView, ProfileModifierBlock, and Phase F exercise library.

import type { ContentBlock as ContentBlockType } from '@/content/exercises/_types'

interface ContentBlockProps {
  block: ContentBlockType
}

interface ContentBlockListProps {
  blocks: ContentBlockType[]
}

export function ContentBlock({ block }: ContentBlockProps) {
  switch (block.type) {
    case 'p':
      return (
        <p className="text-body text-text-body leading-relaxed">
          {block.text}
        </p>
      )

    case 'subhead':
      return (
        <h3 className="text-heading-4 font-semibold text-text-heading mt-2">
          {block.text}
        </h3>
      )

    case 'list':
      if (block.ordered) {
        return (
          <ol className="list-decimal list-outside pl-5 space-y-1 text-body text-text-body leading-relaxed">
            {block.items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ol>
        )
      }
      return (
        <ul className="list-disc list-outside pl-5 space-y-1 text-body text-text-body leading-relaxed">
          {block.items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      )

    case 'callout':
      if (block.tone === 'info') {
        return (
          <div className="rounded-lg bg-wins-bg border-l-4 border-primary px-4 py-3">
            <p className="text-body text-text-body leading-relaxed">{block.text}</p>
          </div>
        )
      }
      // tone === 'warning'
      return (
        <div className="rounded-lg bg-error-tint border-l-4 border-error px-4 py-3">
          <p className="text-body text-text-body leading-relaxed">{block.text}</p>
        </div>
      )

    case 'emphasis':
      return (
        <p className="text-body text-text-body leading-relaxed font-semibold">
          {block.text}
        </p>
      )

    default:
      return null
  }
}

export function ContentBlockList({ blocks }: ContentBlockListProps) {
  return (
    <div className="space-y-3">
      {blocks.map((block, idx) => (
        <ContentBlock key={idx} block={block} />
      ))}
    </div>
  )
}

export default ContentBlock
