-- Restrict users table SELECT policy.
-- Previous policy (in 20260507000001_users_public_read_policy.sql) allowed
-- authenticated members to SELECT all columns of any user via PostgREST.
-- This exposed email, bio, display_name, onboarding_step etc.
--
-- New approach: drop the broad policy and replace with two policies:
--   1. Users can SELECT their own full row
--   2. Public can read username + is_admin only via a SECURITY DEFINER view
--
-- Application code that needs other users' usernames (community queries)
-- should query the public view, not the users table directly.

-- Drop the old broad policy
DROP POLICY IF EXISTS "Authenticated users can read all users" ON users;
DROP POLICY IF EXISTS "users_public_read" ON users;
DROP POLICY IF EXISTS "Authenticated members can view user profiles" ON users;

-- Allow users to read their own row in full
CREATE POLICY "users_read_own"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create a SECURITY DEFINER view exposing only safe public columns.
-- Includes: id (for joins), username, is_admin, bio, created_at.
-- Excludes: email, display_name, onboarding_step, onboarding_completed,
--          symptom_score, status, is_founding_member, is_free_for_life,
--          phase1_completed_at, research_consent, community_charter_acknowledged_at,
--          and any other internal/private columns.
CREATE OR REPLACE VIEW public_users
WITH (security_invoker = false)
AS
SELECT id, username, is_admin, bio, created_at
FROM users;

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public_users TO authenticated;
