import { createClient } from '@supabase/supabase-js'

// Service-role Supabase client. Bypasses RLS. Use ONLY in
// server code that has already enforced its own ownership
// and access checks (see DELETE handlers in
// /api/community/*).
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
