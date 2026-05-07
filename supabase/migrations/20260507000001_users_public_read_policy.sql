-- Allow authenticated members to read other users' profiles.
-- Required for community queries that join users to resolve display names.
-- Without this, PostgREST returns NULL for other users' rows on the join,
-- causing community posts and replies to display "unknown" instead of @handles.
--
-- The existing own-row SELECT policy remains in place. Supabase combines
-- permissive policies with OR, so this adds to rather than replaces it.
--
-- Consequence: authenticated members can SELECT all columns of users via
-- the API. Community queries only select username and is_admin. A future
-- migration should replace this with a SECURITY DEFINER view exposing only
-- safe public columns (username, bio, is_admin, created_at).

CREATE POLICY "Authenticated members can view user profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);
