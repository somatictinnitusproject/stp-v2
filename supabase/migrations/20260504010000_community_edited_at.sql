-- Add edited_at column to community_posts and community_replies.
-- Set when an author or admin updates the body or title (not
-- when is_pinned changes — pinning is moderation, not authoring).
-- NULL means the post or reply has not been edited.
--
-- Run manually in Supabase SQL editor.

ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

ALTER TABLE community_replies
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

COMMENT ON COLUMN community_posts.edited_at IS
  'NULL until first edit. Set to NOW() on any author or admin update of title or body. Pinning does not touch this column.';

COMMENT ON COLUMN community_replies.edited_at IS
  'NULL until first edit. Set to NOW() on any author or admin update of body.';
