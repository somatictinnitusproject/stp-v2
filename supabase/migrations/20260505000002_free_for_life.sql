-- Add free-for-life access tier.
-- Pre-Stripe-launch signups are flagged here instead of going through payment.
-- Founding members are also backfilled so the access check only needs one flag.

ALTER TABLE memberships
  ADD COLUMN IF NOT EXISTS is_free_for_life BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill: founding members are already free for life.
UPDATE memberships
SET is_free_for_life = TRUE
WHERE is_founding_member = TRUE;

-- Note: if plan_type has a CHECK constraint, add 'free_pre_stripe' to the allowed values:
--   ALTER TABLE memberships DROP CONSTRAINT IF EXISTS memberships_plan_type_check;
--   ALTER TABLE memberships ADD CONSTRAINT memberships_plan_type_check
--     CHECK (plan_type IN ('paid', 'founding', 'free_pre_stripe'));
-- Verify by running \d memberships in psql or inspecting constraints in Supabase dashboard.
