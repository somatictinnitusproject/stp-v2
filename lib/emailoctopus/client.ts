// lib/emailoctopus/client.ts
// Server-side only. Never import from client components — EMAILOCTOPUS_API_KEY
// must never be exposed to the browser.
//
// API version: EmailOctopus REST API 1.6
// (https://emailoctopus.com/api-documentation — verify version is still current)
//
// Transactional sends: EmailOctopus 1.6 has no direct "send to one contact" API.
// We use tag-based automation triggers instead:
//   1. Add a trigger tag to the contact (the value of EMAILOCTOPUS_*_TEMPLATE_ID)
//   2. An EmailOctopus automation fires when that tag is added and sends the email
//   3. The automation removes the trigger tag after sending (configure in EO dashboard)
// EMAILOCTOPUS_*_TEMPLATE_ID env vars therefore hold tag names, not UUID template IDs.

import { createHash } from 'crypto'

const BASE = 'https://emailoctopus.com/api/1.6'

function getConfig(): { apiKey: string; listId: string } {
  const apiKey = process.env.EMAILOCTOPUS_API_KEY
  const listId = process.env.EMAILOCTOPUS_LIST_ID
  if (!apiKey || !listId) {
    throw new Error('[emailoctopus] EMAILOCTOPUS_API_KEY or EMAILOCTOPUS_LIST_ID not configured')
  }
  return { apiKey, listId }
}

function emailHash(email: string): string {
  return createHash('md5').update(email.toLowerCase().trim()).digest('hex')
}

async function eoRequest(
  apiKey: string,
  method: string,
  path: string,
  body?: Record<string, unknown>,
): Promise<Response> {
  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('api_key', apiKey)
  return fetch(url.toString(), {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
}

interface EoContact {
  email_address: string
  fields?: Record<string, string>
  tags?: string[]
  status?: string
}

export async function findContactByEmail(email: string): Promise<EoContact | null> {
  const { apiKey, listId } = getConfig()
  const res = await eoRequest(apiKey, 'GET', `/lists/${listId}/contacts/${emailHash(email)}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`[emailoctopus] findContactByEmail ${res.status}: ${await res.text()}`)
  return res.json() as Promise<EoContact>
}

export async function addContact(contact: {
  email_address: string
  fields?: Record<string, string>
  tags?: string[]
}): Promise<void> {
  const { apiKey, listId } = getConfig()
  const res = await eoRequest(apiKey, 'POST', `/lists/${listId}/contacts`, {
    ...contact,
    status: 'SUBSCRIBED',
  })
  if (!res.ok) throw new Error(`[emailoctopus] addContact ${res.status}: ${await res.text()}`)
}

// Merges tags additively — fetches current tags first to avoid overwriting.
// addTags: tags to add; removeTags: tags to strip if present.
export async function updateContactTags(
  email: string,
  addTags: string[],
  removeTags: string[],
): Promise<void> {
  const { apiKey, listId } = getConfig()

  const existing = await findContactByEmail(email)
  if (!existing) throw new Error(`[emailoctopus] updateContactTags: contact not found for ${email}`)

  const removeSet = new Set(removeTags)
  const current = existing.tags ?? []
  const merged = [
    ...current.filter((t) => !removeSet.has(t)),
    ...addTags.filter((t) => !current.includes(t)),
  ]

  const res = await eoRequest(apiKey, 'PUT', `/lists/${listId}/contacts/${emailHash(email)}`, {
    tags: merged,
  })
  if (!res.ok) throw new Error(`[emailoctopus] updateContactTags ${res.status}: ${await res.text()}`)
}

// triggerTag is the value of EMAILOCTOPUS_*_TEMPLATE_ID — a tag name configured
// as an automation trigger in the EO dashboard. _fields are already on the contact
// record from addContact; automations read them there.
export async function sendTransactional(
  triggerTag: string,
  toEmail: string,
  _fields: Record<string, string>,
): Promise<void> {
  await updateContactTags(toEmail, [triggerTag], [])
}

// ── High-level helpers ────────────────────────────────────────────────────────

// Called on onboarding completion. Adds v2_member + tier tag to the contact.
// Never throws — errors are logged so signup is never blocked.
export async function syncSignupToEmailOctopus(user: {
  email: string
  username: string
  is_founding_member: boolean
  is_free_for_life: boolean
}): Promise<void> {
  try {
    const tagsToAdd: string[] = ['v2_member']

    if (user.is_founding_member) {
      tagsToAdd.push('founding_member')
    } else if (user.is_free_for_life) {
      tagsToAdd.push('pre_stripe_member')
    } else {
      // 'paid_member' is a future tag — no signups receive it while STRIPE_ENABLED=false
      tagsToAdd.push('paid_member')
    }

    const existing = await findContactByEmail(user.email)

    if (existing) {
      // Existing contact (likely v1_waitlist) — merge tags, preserve theirs
      await updateContactTags(user.email, tagsToAdd, [])
    } else {
      await addContact({
        email_address: user.email,
        fields: { FirstName: user.username },
        tags: tagsToAdd,
      })
    }
  } catch (error) {
    console.error('[emailoctopus] syncSignupToEmailOctopus failed', error)
    // Never throw — never block signup
  }
}

export async function sendWelcomeEmail(user: { email: string; username: string }): Promise<void> {
  const templateId = process.env.EMAILOCTOPUS_WELCOME_TEMPLATE_ID
  if (!templateId) {
    console.log(
      `[emailoctopus] would send welcome email to ${user.email} but EMAILOCTOPUS_WELCOME_TEMPLATE_ID not configured`,
    )
    return
  }
  try {
    await sendTransactional(templateId, user.email, { FirstName: user.username })
  } catch (error) {
    console.error('[emailoctopus] sendWelcomeEmail failed', error)
    // Never throw — never block signup
  }
}

export async function sendPhase5CompletionEmail(user: {
  email: string
  username: string
}): Promise<void> {
  const templateId = process.env.EMAILOCTOPUS_COMPLETION_TEMPLATE_ID
  if (!templateId) {
    console.log(
      `[emailoctopus] would send completion email to ${user.email} but EMAILOCTOPUS_COMPLETION_TEMPLATE_ID not configured`,
    )
    return
  }
  try {
    await sendTransactional(templateId, user.email, { FirstName: user.username })
  } catch (error) {
    console.error('[emailoctopus] sendPhase5CompletionEmail failed', error)
    // Never throw
  }
}
