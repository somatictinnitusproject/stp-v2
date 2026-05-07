-- Rename community space slug 'introduce-yourself' → 'your-journey'.
-- Pre-launch migration: migrates any existing posts, then replaces
-- the CHECK constraint to reflect the new slug.

-- 1. Migrate any existing posts (safe no-op if none exist).
UPDATE community_posts
SET space = 'your-journey'
WHERE space = 'introduce-yourself';

-- 2. Drop the old CHECK constraint and add the updated one.
ALTER TABLE community_posts
  DROP CONSTRAINT community_posts_space_valid;

ALTER TABLE community_posts
  ADD CONSTRAINT community_posts_space_valid
  CHECK (
    space IN (
      'progress-wins',
      'your-journey',
      'questions-oliver',
      'discussion',
      'research-resources'
    )
  );
