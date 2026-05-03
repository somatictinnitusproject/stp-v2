'use client'

// /components/exercise/profile-variant-block.tsx
// Renders a profile_variant ContentBlock by resolving profileType to a family
// and dispatching the matching ContentBlock[] through <ContentBlock>. Returns
// null when family is null — silent omission per framework philosophy.

import { ContentBlock } from './content-block'
import type { ContentBlock as ContentBlockType } from '@/content/exercises/_types'
import { resolveProfileFamily } from '@/lib/scoring/profile-family'

interface ProfileVariantBlockProps {
  block: {
    type: 'profile_variant'
    variants: {
      TMJ_DOMINANT: ContentBlockType[]
      CERV_DOMINANT: ContentBlockType[]
      DUAL_DRIVER: ContentBlockType[]
    }
  }
  profileType: string
}

export default function ProfileVariantBlock({
  block,
  profileType,
}: ProfileVariantBlockProps) {
  const family = resolveProfileFamily(profileType)
  if (!family) return null

  const variantBlocks = block.variants[family]

  return (
    <>
      {variantBlocks.map((b, idx) => (
        <ContentBlock key={idx} block={b} />
      ))}
    </>
  )
}
