-- Phase Jg revision:
--   1. Drop edited_at column from community_posts and
--      community_replies (edit feature removed).
--   2. Add UPDATE RLS policies that allow authors to update
--      their own rows (used for soft delete) and admins to
--      update any row (used for soft delete + pinning).
--
-- Run manually in Supabase SQL editor.

-- ─────────────────────────────────────────────────────────────
-- 1. Drop edited_at columns
-- ─────────────────────────────────────────────────────────────

ALTER TABLE community_posts
  DROP COLUMN IF EXISTS edited_at;

ALTER TABLE community_replies
  DROP COLUMN IF EXISTS edited_at;

-- ─────────────────────────────────────────────────────────────
-- 2. UPDATE RLS — community_posts
-- ─────────────────────────────────────────────────────────────

-- Drop any prior UPDATE policy on community_posts in case one
-- exists from earlier exploratory runs.
DROP POLICY IF EXISTS community_posts_update_own_or_admin
  ON community_posts;

-- Author or admin can UPDATE community_posts.
-- USING controls which rows are visible for update.
-- WITH CHECK controls what shape the update may produce.
-- We allow the author to update their own row, and admin
-- (users.is_admin = TRUE) to update any row.
CREATE POLICY community_posts_update_own_or_admin
  ON community_posts
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.is_admin = TRUE
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.is_admin = TRUE
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 3. UPDATE RLS — community_replies
-- ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS community_replies_update_own_or_admin
  ON community_replies;

CREATE POLICY community_replies_update_own_or_admin
  ON community_replies
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.is_admin = TRUE
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.is_admin = TRUE
    )
  );

-- End of migration.
