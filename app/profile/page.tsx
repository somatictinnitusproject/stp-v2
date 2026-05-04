import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export default async function ProfileIndexPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const serviceClient = createServiceClient()
  const { data: row } = await serviceClient
    .from('users')
    .select('username')
    .eq('id', user.id)
    .maybeSingle()

  const username = (row as any)?.username
  if (!username) redirect('/community')

  redirect(`/profile/${username}`)
}
