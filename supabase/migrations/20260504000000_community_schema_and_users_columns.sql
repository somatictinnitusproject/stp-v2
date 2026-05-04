-- Community feature schema (Phase Ja).
-- Adds two tables — community_posts, community_replies — plus three
-- new columns on the users table that support community participation.
--
-- The users table is not defined in supabase/migrations/ (it was
-- created directly in the Supabase dashboard during early build).
-- This migration ALTERs it. If you are applying migrations to a
-- fresh database from scratch, ensure the users table exists first.
--
-- Run manually in Supabase SQL editor — cannot be applied by Cursor.

-- ─────────────────────────────────────────────────────────────
-- 1. New columns on users
-- ─────────────────────────────────────────────────────────────

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username VARCHAR(30) UNIQUE,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS community_charter_acknowledged_at TIMESTAMPTZ;

-- Username constraint: lowercase alphanumeric and underscores only,
-- 2–30 characters. Enforced at the database level so application
-- bugs cannot insert invalid handles.
ALTER TABLE users
  ADD CONSTRAINT username_format_valid
  CHECK (
    username IS NULL OR
    (username ~ '^[a-z0-9_]{2,30}$')
  );

-- Bio length cap. Application-level limit is 300; DB allows TEXT
-- but the CHECK keeps anything past 300 out at write time.
ALTER TABLE users
  ADD CONSTRAINT bio_length_valid
  CHECK (bio IS NULL OR char_length(bio) <= 300);

COMMENT ON COLUMN users.username IS
  'Lowercase @-handle for community + profile URLs. Unique, immutable from URL perspective (changes invalidate old URL).';
COMMENT ON COLUMN users.bio IS
  'Optional free-text bio shown on /profile/[username]. Max 300 chars.';
COMMENT ON COLUMN users.community_charter_acknowledged_at IS
  'Timestamp the member acknowledged the community charter. NULL until first community visit acknowledgement.';

-- ─────────────────────────────────────────────────────────────
-- 2. community_posts
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS community_posts (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  space       VARCHAR(50)  NOT NULL,
  title       VARCHAR(200) NOT NULL,
  body        TEXT         NOT NULL,
  is_pinned   BOOLEAN      NOT NULL DEFAULT FALSE,
  is_deleted  BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE community_posts
  ADD CONSTRAINT community_posts_space_valid
  CHECK (
    space IN (
      'progress-wins',
      'introduce-yourself',
      'questions-oliver',
      'discussion',
      'research-resources'
    )
  );

ALTER TABLE community_posts
  ADD CONSTRAINT community_posts_title_length_valid
  CHECK (char_length(title) BETWEEN 1 AND 200);

ALTER TABLE community_posts
  ADD CONSTRAINT community_posts_body_length_valid
  CHECK (char_length(body) BETWEEN 1 AND 5000);

CREATE INDEX IF NOT EXISTS community_posts_created_at_desc_idx
  ON community_posts (created_at DESC);

CREATE INDEX IF NOT EXISTS community_posts_space_created_at_idx
  ON community_posts (space, created_at DESC)
  WHERE is_deleted = FALSE;

COMMENT ON TABLE community_posts IS
  'Community posts. Soft-deleted via is_deleted=TRUE — never hard deleted. Every read query MUST include WHERE is_deleted = FALSE.';

-- ─────────────────────────────────────────────────────────────
-- 3. community_replies
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS community_replies (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID         NOT NULL REFERENCES community_posts(id) ON DELETE RESTRICT,
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  body        TEXT         NOT NULL,
  is_deleted  BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE community_replies
  ADD CONSTRAINT community_replies_body_length_valid
  CHECK (char_length(body) BETWEEN 1 AND 2000);

CREATE INDEX IF NOT EXISTS community_replies_created_at_desc_idx
  ON community_replies (created_at DESC);

CREATE INDEX IF NOT EXISTS community_replies_post_id_created_at_idx
  ON community_replies (post_id, created_at ASC)
  WHERE is_deleted = FALSE;

COMMENT ON TABLE community_replies IS
  'Replies to community_posts. Soft-deleted via is_deleted=TRUE. Every read query MUST include WHERE is_deleted = FALSE.';

-- ─────────────────────────────────────────────────────────────
-- 4. RLS — community_posts
-- ─────────────────────────────────────────────────────────────

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- SELECT: any authenticated member can read non-deleted posts.
CREATE POLICY community_posts_select_visible
  ON community_posts
  FOR SELECT
  TO authenticated
  USING (is_deleted = FALSE);

-- INSERT: members can only insert posts as themselves.
CREATE POLICY community_posts_insert_own
  ON community_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE and DELETE: service role only. Edits + soft deletes go
-- through /api/community/moderate (admin) or /api/community/posts
-- (own edit) using the service role key server-side.

-- ─────────────────────────────────────────────────────────────
-- 5. RLS — community_replies
-- ─────────────────────────────────────────────────────────────

ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY community_replies_select_visible
  ON community_replies
  FOR SELECT
  TO authenticated
  USING (is_deleted = FALSE);

CREATE POLICY community_replies_insert_own
  ON community_replies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- End of migration.
-- ─────────────────────────────────────────────────────────────
