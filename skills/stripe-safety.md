---
name: stripe-safety
description: Somatic Tinnitus Project Stripe integration rules and safety checks. Use when building any payment flow, webhook handler, subscription logic, Customer Portal integration, founding member payment bypass, support contribution feature, or any code that references Stripe keys or membership status.
---

# Somatic Tinnitus Project — Stripe Safety Rules

## Four Rules That Must Never Be Broken

### 1. Key Exposure
- `STRIPE_SECRET_KEY` — server-side only. Never prefix with `NEXT_PUBLIC_`. Never return
  from an API route. Never log.
- `STRIPE_WEBHOOK_SECRET` — server-side only. Same rules.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — client-safe. The only Stripe key that may be
  used client-side.

### 2. Webhook Signature Verification
Every webhook request must be signature-verified **before any processing occurs**.
No exceptions. Return 200 immediately after verification even if processing fails —
Stripe retries on non-200 responses which causes duplicate processing.

### 3. Founding Member Bypass
`is_founding_member = TRUE` means Stripe is **never queried** for that member. Not on
login. Not on middleware. Not on dashboard load. Not on any feature access check.
Zero Stripe API calls for founding members, anywhere in the codebase, ever.

After writing any Stripe-related code, verify this rule still holds:
- Sign in as founding member test account, open network tab
- Navigate through dashboard, /subscription, /onboarding
- Zero requests to `api.stripe.com` is the only passing result

### 4. Test Keys Only During Build
Use test keys (`sk_test_`, `pk_test_`) in `.env.local` and Vercel preview throughout the
entire build. Switch to live keys (`sk_live_`, `pk_live_`) in Vercel **production only**,
**only at launch**, as the final step before going live.

---

## App Router Webhook Pattern — Next.js 15

Document 14 contains `export const config = { api: { bodyParser: false } }` — this is
**Pages Router syntax and does not work in Next.js 15 App Router**. Use this pattern instead:

```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(request: Request) {
  const rawBody = await request.text()   // NOT request.json()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // All processing happens after verification passes
  switch (event.type) {
    case 'checkout.session.completed':
      // Payment successful — update memberships status to active
      break
    case 'invoice.payment_succeeded':
      // Recurring payment succeeded — keep status active
      break
    case 'invoice.payment_failed':
      // Payment failed — set status to past_due, trigger payment failed email
      break
    case 'customer.subscription.deleted':
      // Cancelled — set status to cancelled, set cancelled_at, trigger cancelled email
      break
  }

  // Always return 200 after verification — Stripe retries on non-200
  return Response.json({ received: true }, { status: 200 })
}
// Do NOT export a config object — not used in App Router
```

All database writes in the webhook handler must use the **service role client**, not the
anon key client.

---

## Local Webhook Testing

```bash
# Run in a separate terminal throughout the session
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI outputs a webhook signing secret beginning `whsec_`. This is **different** from
the dashboard webhook secret. These are two distinct values:
- CLI secret (`whsec_...` from `stripe listen`) → use in `.env.local`
- Dashboard secret (from Stripe dashboard → Webhooks → your endpoint) → use in Vercel production

Never swap them.

---

## Membership Status Behaviour

| Status | Access | Payment banner | Stripe queried |
|---|---|---|---|
| `is_founding_member = TRUE` | Full access always | Never | Never |
| `active` | Full access | None | On relevant events only |
| `past_due` | Full access | Yes — persistent on dashboard | On relevant events only |
| `cancelled` | Blocked → /subscription | N/A | On relevant events only |

`past_due` members are **never blocked from content**. They see a payment banner but
retain full platform access. Only `cancelled` blocks access.

---

## Founding Member Bypass — Three Enforcement Points

Implement all three. Each is a separate check.

**Point 1 — middleware.ts**
```typescript
if (membership.is_founding_member === true) {
  return NextResponse.next()  // pass through immediately, no Stripe check
}
```

**Point 2 — /onboarding/payment page (server component)**
```typescript
const { data: membership } = await supabase
  .from('memberships')
  .select('is_founding_member')
  .eq('user_id', session.user.id)
  .single()

if (membership.is_founding_member) {
  redirect('/onboarding/welcome')
}
// Page only renders for paid members — founding members never see it
```

**Point 3 — /subscription page (server component)**
```typescript
if (membership.is_founding_member) {
  return <FoundingMemberBillingState membership={membership} />
  // No Stripe API call made — renders founding member state directly
}
return <PaidMemberBillingState membership={membership} />
```

---

## Stripe Dashboard Setup — Complete Before Writing Any Code

Do all of this in the Stripe dashboard before writing a single line of payment code:

- Create Product: **Somatic Tinnitus Project Membership**
- Create Price on that product: £2.99/month, recurring, monthly. Note the Price ID (`price_...`)
  → store as `STRIPE_MEMBERSHIP_PRICE_ID`
- Create second Product: **Somatic Tinnitus Project — Support Contribution**
  Note the Product ID (`prod_...`) → store as `STRIPE_SUPPORT_PRODUCT_ID`
- Create 14 Prices on Support Contribution product: £1, £2, £3, £4, £5, £6, £7, £8, £9,
  £10, £15, £25, £50, £100 — all recurring monthly. Note each Price ID.
- Enable Customer Portal: Settings → Billing → Customer portal. Allow cancellation and
  card updates. Disable plan switching.
- Register webhook endpoint: `https://[your-domain]/api/webhooks/stripe`
  Select all four events: `checkout.session.completed`, `invoice.payment_succeeded`,
  `invoice.payment_failed`, `customer.subscription.deleted`
  Note the signing secret (`whsec_...`) → store as `STRIPE_WEBHOOK_SECRET` in Vercel
- Confirm test mode active — all keys start `sk_test_` and `pk_test_`

---

## Environment Variables

| Variable | Exposure | Needed |
|---|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client-safe | Phase H |
| `STRIPE_SECRET_KEY` | Server only ⚠️ | Phase H |
| `STRIPE_WEBHOOK_SECRET` | Server only ⚠️ | Phase H |
| `STRIPE_MEMBERSHIP_PRICE_ID` | Server only | Phase H |
| `STRIPE_SUPPORT_PRODUCT_ID` | Server only | Phase H |

⚠️ Rotate immediately if accidentally committed or exposed.

---

## Test Mode Verification Checklist

Complete every item before switching to live keys:

- Test card success: `4242 4242 4242 4242` (any future expiry, any CVC)
  → memberships row updated: status = active, stripe_customer_id, stripe_subscription_id set
  → checkout.session.completed webhook received and processed
  → subscription confirmation email sent
  → member reaches /onboarding/welcome

- Test card decline: `4000 0000 0000 0002`
  → inline error renders below form

- Test card fails after charge: `4000 0000 0000 3220`
  → invoice.payment_failed webhook fires
  → status updates to past_due
  → payment failed email sent
  → past_due banner renders on dashboard
  → member retains full content access

- Customer Portal cancellation
  → customer.subscription.deleted webhook fires
  → status = cancelled, cancelled_at set
  → cancelled email sent
  → member redirected to /subscription on next login
  → all feature routes blocked

- Founding member bypass
  → /onboarding/payment redirects immediately
  → /subscription shows founding member state
  → network tab shows zero requests to api.stripe.com

- Webhook security
  → invalid signature → handler returns 400, no processing
  → confirm raw body (not parsed JSON) used for verification

---

## Support Contribution — Voluntary Add-On

Separate from main membership. Available to all members including founding members.
14 price points defined in `/content/stripe-support-prices.ts`.

Founding member copy:
> "Your founding member access is free for life — that will never change. If you'd like
> to support the project, you can add a voluntary monthly contribution at any time."

Paid member copy:
> "If the platform has been useful to you, you can add a voluntary monthly contribution
> on top of your membership."

Visible only on own profile page — never on other members' profiles.
