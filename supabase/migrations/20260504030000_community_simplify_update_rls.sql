-- Replace UPDATE policies with author-only versions.
-- The previous OR EXISTS admin clause caused 42501 rejections
-- on own-post UPDATEs. Admin moderation will use service-role
-- bypass via a separate route in Phase Ji.

DROP POLICY IF EXISTS community_posts_update_own_or_admin
  ON community_posts;

DROP POLICY IF EXISTS community_replies_update_own_or_admin
  ON community_replies;

CREATE POLICY community_posts_update_own
  ON community_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY community_replies_update_own
  ON community_replies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
