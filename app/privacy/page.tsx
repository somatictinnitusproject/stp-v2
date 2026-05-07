import PublicShell from '@/components/shells/PublicShell'

export const metadata = {
  title: 'Privacy Policy — Somatic Tinnitus Project',
}

export default function PrivacyPage() {
  return (
    <PublicShell>
      <div className="max-w-[720px] mx-auto px-4 py-12">
        <h1 className="text-[28px] font-bold text-text-heading mb-1">Privacy Policy</h1>
        <p className="text-[14px] text-text-muted mb-10">Last updated: 7 May 2026</p>

        <Section heading="Who we are">
          <p>The Somatic Tinnitus Project is operated by Oliver (sole trader, United Kingdom). For privacy questions or to exercise any of the rights listed below, email <a href="mailto:oliver@somatictinnitusproject.com" className="text-primary hover:text-primary-hover">oliver@somatictinnitusproject.com</a>.</p>
          <p>We are registered with the UK Information Commissioner&apos;s Office (ICO).</p>
        </Section>

        <Section heading="What data we collect">
          <p>When you create an account and use the platform, we collect:</p>

          <Subheading>Account information</Subheading>
          <BulletList items={[
            'Email address',
            'Username (chosen by you)',
            'Password (stored encrypted, we never see it)',
            'Account creation date',
          ]} />

          <Subheading>Health and assessment data</Subheading>
          <BulletList items={[
            'Your test classification result (A, B, or C from the somatic tinnitus screening test)',
            'Phase 1 self-assessment responses (jaw, neck, postural, and nervous system findings)',
            'Daily progress logs (perceived tinnitus loudness, jaw tension, neck tension, stress, sleep quality, optional notes)',
            'Tinnitus Functional Index (TFI) questionnaire responses at intake and Phase 5 completion',
            'Your generated profile (e.g. dual driver, primary cervical with secondary jaw)',
            'Phase and session progression dates',
          ]} />

          <Subheading>Consent records</Subheading>
          <BulletList items={[
            'Whether you have given consent for health data processing (required to use the platform)',
            'Whether you have given optional consent for anonymised research use of your data',
            'Date and time consents were given or withdrawn',
          ]} />

          <Subheading>Communications</Subheading>
          <BulletList items={[
            'Community posts and replies you choose to publish',
            'Email correspondence with us',
          ]} />

          <Subheading>Technical information</Subheading>
          <BulletList items={[
            'Standard server logs (IP address, request timestamps, browser type) collected by our hosting providers for security and performance purposes',
            'Email engagement (open and click events) collected by our email provider',
          ]} />
        </Section>

        <Section heading="Legal basis for processing">
          <p>Under UK GDPR, we rely on the following legal bases:</p>

          <Subheading>For account information and platform functionality</Subheading>
          <p><strong>Contract:</strong> processing is necessary to provide the platform service you have signed up for.</p>

          <Subheading>For health and assessment data</Subheading>
          <p><strong>Explicit consent (UK GDPR Article 9(2)(a)):</strong> you provide explicit consent during onboarding to process this special category data to deliver and personalise your rehabilitation framework. You can withdraw this consent at any time, which will result in deletion of your account and associated data.</p>

          <Subheading>For research data (optional, only with separate consent)</Subheading>
          <p><strong>Explicit consent (UK GDPR Article 9(2)(a)):</strong> you may separately consent to your anonymised data being used to improve understanding of somatic tinnitus. You can withdraw this consent at any time in your account settings without affecting your platform access.</p>

          <Subheading>For communications about your account</Subheading>
          <p><strong>Legitimate interest:</strong> we send essential service emails (account verification, password resets, framework completion). You cannot opt out of these while you have an active account.</p>
        </Section>

        <Section heading="How we use your data">
          <Subheading>Account information</Subheading>
          <BulletList items={[
            'To provide you access to the platform',
            'To send essential service communications',
            'To respond to support requests',
          ]} />

          <Subheading>Health and assessment data</Subheading>
          <BulletList items={[
            'To generate your personalised somatic profile and protocol recommendations',
            'To track your progress through the 12-week framework',
            'To display your analytics, trends, and insights',
            'To deliver content tailored to your profile',
          ]} />

          <Subheading>Research data (optional, with separate consent)</Subheading>
          <BulletList items={[
            'Anonymised data may be used to improve the framework, identify patterns across members, and inform future development',
            'Anonymised aggregated data may be shared in publications, conference presentations, or research collaborations',
            'Anonymisation means removing your email, username, and any free-text responses that could identify you. Aggregated patterns cannot be linked back to you.',
          ]} />

          <Subheading>Communications</Subheading>
          <BulletList items={[
            'To send you platform updates, new content notifications, and service announcements',
            'To send marketing communications about new features (you can opt out at any time using the unsubscribe link)',
          ]} />
        </Section>

        <Section heading="Who has access to your data">
          <p>Only Oliver, the sole operator of the platform, has access to your data. We do not employ staff, contractors, or third parties who can access member health data.</p>
          <p>Your data is stored with the following service providers, who process it on our behalf as data processors:</p>

          <Subheading>Supabase (database and authentication)</Subheading>
          <p>Hosted in the European Union. Supabase processes your account data, health data, and progress logs. Their privacy policy: <ExternalLink href="https://supabase.com/privacy">supabase.com/privacy</ExternalLink></p>

          <Subheading>Vercel (web hosting)</Subheading>
          <p>Vercel hosts the platform and processes standard server logs. Their privacy policy: <ExternalLink href="https://vercel.com/legal/privacy-policy">vercel.com/legal/privacy-policy</ExternalLink></p>

          <Subheading>Cloudflare Stream (video content)</Subheading>
          <p>Cloudflare hosts our exercise demonstration videos. They process basic playback metrics (no personal identification). Their privacy policy: <ExternalLink href="https://www.cloudflare.com/privacypolicy/">cloudflare.com/privacypolicy</ExternalLink></p>

          <Subheading>EmailOctopus (email delivery)</Subheading>
          <p>EmailOctopus processes your email address and engagement data for marketing communications. Their privacy policy: <ExternalLink href="https://emailoctopus.com/legal/privacy">emailoctopus.com/legal/privacy</ExternalLink></p>

          <Subheading>Brevo (transactional email)</Subheading>
          <p>Brevo sends account verification and password reset emails. Their privacy policy: <ExternalLink href="https://www.brevo.com/legal/privacypolicy/">brevo.com/legal/privacypolicy</ExternalLink></p>

          <Subheading>Stripe (payments)</Subheading>
          <p>Stripe processes subscription payments. We do not store payment card details. Their privacy policy: <ExternalLink href="https://stripe.com/gb/privacy">stripe.com/gb/privacy</ExternalLink></p>

          <p>All processors have appropriate data protection agreements in place and are GDPR-compliant.</p>
        </Section>

        <Section heading="International transfers">
          <p>Some of our processors are based outside the United Kingdom, including in the United States. Where data is transferred internationally, transfers are protected by appropriate safeguards including UK adequacy decisions or Standard Contractual Clauses.</p>
        </Section>

        <Section heading="How long we keep your data">
          <Subheading>Active accounts</Subheading>
          <p>We retain your data for as long as your account is active.</p>

          <Subheading>Closed accounts</Subheading>
          <p>If you delete your account, all personal data is deleted within 30 days. Anonymised research data, if you consented to its use, is retained indefinitely as it can no longer be linked to you.</p>

          <Subheading>Inactive accounts</Subheading>
          <p>If your account has had no login activity for 24 months, we will email you to confirm whether you want to continue. If we receive no response within 60 days, the account is deleted.</p>

          <Subheading>Email correspondence</Subheading>
          <p>We retain support emails for up to 3 years for service improvement and dispute resolution.</p>
        </Section>

        <Section heading="Your rights">
          <p>Under UK GDPR, you have the right to:</p>

          <Subheading>Access</Subheading>
          <p>Request a copy of the data we hold about you. We will respond within 30 days.</p>

          <Subheading>Rectification</Subheading>
          <p>Correct any inaccurate data we hold. You can update most of your data directly in your profile settings.</p>

          <Subheading>Erasure</Subheading>
          <p>Delete your account and all associated personal data. You can do this from your account settings or by emailing us. Account deletion is permanent and cannot be undone.</p>

          <Subheading>Restriction</Subheading>
          <p>Ask us to limit how we use your data while a complaint or correction is being resolved.</p>

          <Subheading>Data portability</Subheading>
          <p>Request your data in a machine-readable format to transfer to another service.</p>

          <Subheading>Object</Subheading>
          <p>Object to processing based on legitimate interests. You can opt out of marketing communications at any time using the unsubscribe link.</p>

          <Subheading>Withdraw consent</Subheading>
          <p>Withdraw consent for health data processing (which results in account deletion) or for research use (which leaves your account active). Both can be done in your account settings.</p>

          <Subheading>Complain</Subheading>
          <p>Lodge a complaint with the UK Information Commissioner&apos;s Office at <ExternalLink href="https://ico.org.uk">ico.org.uk</ExternalLink> if you are unhappy with how we handle your data.</p>

          <p>To exercise any of these rights, email <a href="mailto:oliver@somatictinnitusproject.com" className="text-primary hover:text-primary-hover">oliver@somatictinnitusproject.com</a>.</p>
        </Section>

        <Section heading="Data security">
          <p>We protect your data through:</p>
          <BulletList items={[
            'Encryption in transit (HTTPS for all platform interactions)',
            'Encryption at rest (database and backups)',
            'Row-level security ensuring members can only access their own data',
            'Strong password requirements',
            'No shared accounts or staff access',
          ]} />
          <p>In the unlikely event of a data breach affecting your personal data, we will notify you and the ICO within 72 hours.</p>
        </Section>

        <Section heading="Children">
          <p>The platform is not intended for users under 18. We do not knowingly collect data from children. If you believe a child has created an account, contact us and we will delete the account.</p>
        </Section>

        <Section heading="Changes to this policy">
          <p>We may update this policy occasionally. Material changes will be notified to active members by email at least 14 days before they take effect. The &quot;last updated&quot; date at the top of this page reflects when the policy was last revised.</p>
        </Section>

        <Section heading="Contact">
          <p>For any privacy-related questions or to exercise your rights:</p>
          <p>Email: <a href="mailto:oliver@somatictinnitusproject.com" className="text-primary hover:text-primary-hover">oliver@somatictinnitusproject.com</a></p>
          <p>The data controller is Oliver, sole operator of the Somatic Tinnitus Project.</p>
        </Section>
      </div>
    </PublicShell>
  )
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-[18px] font-semibold text-text-heading mb-4 uppercase tracking-wide">{heading}</h2>
      <div className="space-y-3 text-[15px] text-text-body leading-relaxed">{children}</div>
    </section>
  )
}

function Subheading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[15px] font-semibold text-text-heading mt-5 mb-1">{children}</h3>
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  )
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">
      {children}
    </a>
  )
}
