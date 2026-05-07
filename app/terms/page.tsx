import PublicShell from '@/components/shells/PublicShell'

export const metadata = {
  title: 'Terms of Service — Somatic Tinnitus Project',
}

export default function TermsPage() {
  return (
    <PublicShell>
      <div className="max-w-[720px] mx-auto px-4 py-12">
        <h1 className="text-[28px] font-bold text-text-heading mb-1">Terms of Service</h1>
        <p className="text-[14px] text-text-muted mb-10">Last updated: 7 May 2026</p>

        <Section heading="Introduction">
          <p>These terms govern your use of the Somatic Tinnitus Project platform (the &quot;Platform&quot;), operated by Oliver (sole trader, United Kingdom).</p>
          <p>By creating an account, you agree to these terms. If you do not agree, do not use the Platform.</p>
        </Section>

        <Section heading="What the platform is">
          <p>The Somatic Tinnitus Project is a self-directed digital rehabilitation framework for people whose tinnitus has somatic (physical) drivers, particularly those involving the jaw and upper cervical spine.</p>
          <p>The Platform provides:</p>
          <BulletList items={[
            'A self-administered assessment to identify your physical drivers',
            'A 5-phase structured framework with daily exercises and educational content',
            'A progress tracking and analytics tool',
            'An exercise library with demonstration videos',
            'A member community',
          ]} />
          <p>The Platform is structured around mechanisms supported by peer-reviewed research on somatic tinnitus and somatosensory modulation.</p>
        </Section>

        <Section heading="What the platform is not">
          <p>The Platform is not medical advice, diagnosis, or treatment.</p>
          <p>The Platform does not replace consultation with a qualified medical professional, dentist, physiotherapist, or audiologist.</p>
          <p>We are not regulated as a medical device or healthcare provider. The Platform is an educational and self-directed wellness tool.</p>
          <p>You should consult a qualified medical professional before beginning any new health protocol, particularly if you have existing medical conditions, are taking medication, or have concerns about your tinnitus.</p>
          <p>If you experience pain, worsening symptoms, or any unexpected adverse effects while using the Platform, stop and consult a medical professional.</p>
        </Section>

        <Section heading="Account requirements">
          <p>You must be 18 or over to create an account. You agree to provide accurate information when signing up and to keep your account credentials secure.</p>
          <p>You are responsible for all activity that occurs under your account.</p>
        </Section>

        <Section heading="Consent to health data processing">
          <p>To use the Platform, you must give explicit consent for us to process your health data (assessment results, progress logs, profile data) for the purpose of delivering the framework.</p>
          <p>Optional research consent allows your anonymised data to be used to improve the framework. This is separate from platform access. You can change either consent at any time in your account settings, but withdrawing health data consent will result in account deletion.</p>
        </Section>

        <Section heading="Risks and limitations">
          <p>Tinnitus is complex. Outcomes from somatic interventions vary significantly between individuals. The Platform makes no guarantees about your specific outcome. Some members reach substantial reduction or near-resolution of their tinnitus. Some plateau at improved but persistent levels. Some experience no meaningful change. All of these are possible.</p>
          <p>You may experience temporary increases in tinnitus loudness, jaw soreness, neck stiffness, or related symptoms during the release work in Phase 3. This is common and usually resolves. However, if symptoms persist or worsen significantly, stop and consult a medical professional.</p>
          <p>The Platform is most effective for tinnitus with confirmed somatic drivers. If your tinnitus is primarily driven by other mechanisms (sensorineural hearing loss, ototoxicity, vascular conditions, neurological causes), the Platform may not produce meaningful change for you.</p>
        </Section>

        <Section heading="Use of the platform">
          <p>You agree to:</p>
          <BulletList items={[
            'Use the Platform for your own rehabilitation only',
            'Provide truthful information in assessments and logs',
            'Not share your account credentials',
            'Not redistribute, copy, or republish Platform content without permission',
            'Use the community section respectfully (see Community Rules below)',
          ]} />
          <p>You agree not to:</p>
          <BulletList items={[
            'Use the Platform for commercial purposes',
            'Reverse engineer or attempt to access non-public data',
            'Impersonate other members',
            'Post content that is harmful, harassing, illegal, or violates others\' rights',
            'Solicit other members for unrelated services or commercial purposes',
          ]} />
        </Section>

        <Section heading="Community rules">
          <p>The community section exists to help members support each other through the framework. The following are not permitted:</p>
          <BulletList items={[
            'Personal attacks, harassment, or discrimination',
            'Sharing of identifying information about other members',
            'Promotion of unrelated products, services, or treatments',
            'Medical advice (members can share their experience but not prescribe protocols to others)',
            'Content that disrupts other members\' progress or wellbeing',
          ]} />
          <p>We reserve the right to moderate, remove posts, suspend, or delete accounts that violate these rules.</p>
        </Section>

        <Section heading="Intellectual property">
          <p>All content on the Platform (text, video, structure, exercises, profile generation logic) is the intellectual property of the Somatic Tinnitus Project. You receive a personal, non-transferable license to use this content for your own rehabilitation while your account is active.</p>
          <p>You may not redistribute, republish, or commercially use Platform content. You may screenshot or share small portions for personal discussion (e.g. with a healthcare provider) but not for public distribution.</p>
          <p>Posts you publish in the community remain your intellectual property, but you grant us a non-exclusive license to display, moderate, and (for posts you mark visible to all) retain them for the benefit of the community.</p>
        </Section>

        <Section heading="Payment">
          <p>Some Platform features may require a paid subscription. When payment is enabled:</p>
          <BulletList items={[
            'Pricing is shown clearly before you commit',
            'Subscriptions are processed by Stripe',
            'You can cancel at any time from your account settings',
            'Cancellation takes effect at the end of the current billing period',
            'We do not provide refunds for partial periods unless required by UK consumer law',
          ]} />
          <p>Founding members and pre-launch signups have free lifetime access as offered at signup. This access is not transferable.</p>
        </Section>

        <Section heading="Account deletion and termination">
          <p>You can delete your account at any time from your account settings. Account deletion is permanent.</p>
          <p>We may suspend or terminate accounts that violate these terms, particularly the community rules. We will email you before taking action where reasonable.</p>
        </Section>

        <Section heading="Changes to the platform">
          <p>We may update, modify, or discontinue Platform features over time. Material changes affecting your access or core features will be communicated by email at least 14 days in advance.</p>
          <p>We may update these terms occasionally. Material changes will be notified by email at least 14 days before taking effect. Continued use after changes constitutes acceptance.</p>
        </Section>

        <Section heading="Liability">
          <p>To the fullest extent permitted by UK law, we exclude liability for:</p>
          <BulletList items={[
            'Outcomes of your use of the Platform (including changes or lack of change in your tinnitus)',
            'Indirect or consequential damages',
            'Loss of profit, data, or opportunity',
            'Issues caused by third-party services we use (e.g. hosting outages)',
          ]} />
          <p>We do not exclude liability for:</p>
          <BulletList items={[
            'Death or personal injury caused by negligence',
            'Fraud or fraudulent misrepresentation',
            'Anything else that cannot be excluded under UK consumer law',
          ]} />
          <p>Nothing in these terms removes your statutory consumer rights under UK law.</p>
        </Section>

        <Section heading="Governing law">
          <p>These terms are governed by the laws of England and Wales. Disputes are subject to the exclusive jurisdiction of the courts of England and Wales.</p>
        </Section>

        <Section heading="Contact">
          <p>For terms-related questions: <a href="mailto:oliver@somatictinnitusproject.com" className="text-primary hover:text-primary-hover">oliver@somatictinnitusproject.com</a></p>
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

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  )
}
