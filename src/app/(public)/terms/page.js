import { LegalPage } from '../_components/LegalPage';

export const metadata = {
  title: 'Terms of Service · CDSS',
  description:
    'The terms governing your use of the Clinical Decision Support System.',
};

const LAST_UPDATED = 'June 5, 2026';

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of Service" lastUpdated={LAST_UPDATED}>
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the
        Clinical Decision Support System (&ldquo;CDSS,&rdquo; the &ldquo;Service&rdquo;) at{' '}
        <a href="https://cdss.samkiel.dev">cdss.samkiel.dev</a>. By creating an account or
        using the Service, you agree to these Terms. If you do not agree, do not use the
        Service.
      </p>

      <h2>1. Medical disclaimer</h2>
      <p>
        <strong>
          The Service provides clinical decision support and educational information only.
          It does not provide a medical diagnosis, treatment, or professional medical
          advice, and it is not a substitute for the judgment of a qualified healthcare
          provider.
        </strong>{' '}
        Any assessment, likelihood, or suggestion produced by the Service is preliminary
        and provisional, and must be reviewed and confirmed by a licensed clinician before
        any clinical decision is made.
      </p>
      <p>
        If you think you may have a medical emergency, call your local emergency number or
        seek immediate in-person care. Do not rely on the Service for urgent or emergency
        medical needs.
      </p>

      <h2>2. Eligibility and accounts</h2>
      <ul>
        <li>
          You must be at least 18 years old, or a clinician acting in a professional
          capacity, to use the Service.
        </li>
        <li>
          You are responsible for the accuracy of the information you provide and for
          keeping your login credentials confidential.
        </li>
        <li>
          You are responsible for activity that occurs under your account. Notify us
          promptly of any unauthorized use.
        </li>
      </ul>

      <h2>3. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for any unlawful purpose or in violation of any regulation.</li>
        <li>
          Attempt to access accounts, records, or data that do not belong to you, or
          circumvent the Service&rsquo;s security or authorization controls.
        </li>
        <li>
          Upload malicious code, or content that is unlawful, infringing, or that you do
          not have the right to share.
        </li>
        <li>
          Interfere with, disrupt, or place an unreasonable load on the Service or its
          infrastructure.
        </li>
        <li>
          Rely on the Service as the sole basis for any clinical decision without
          qualified professional review.
        </li>
      </ul>

      <h2>4. Clinician responsibilities</h2>
      <p>
        Clinicians using the Service remain solely responsible for their clinical
        decisions, for exercising independent professional judgment, and for complying
        with all applicable professional, ethical, and legal obligations, including those
        relating to patient consent and record-keeping.
      </p>

      <h2>5. Your content</h2>
      <p>
        You retain ownership of the information and files you submit. You grant us a
        limited license to store and process that content solely to provide and operate
        the Service, as described in our{' '}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>6. Intellectual property</h2>
      <p>
        The Service, including its software, content, and design, is owned by us or our
        licensors and is protected by applicable laws. Except for the rights expressly
        granted to you, no rights are transferred.
      </p>

      <h2>7. Third-party services</h2>
      <p>
        The Service relies on third-party providers (for example, authentication, hosting,
        file storage, email delivery, and AI processing). Your use of the Service may also
        be subject to those providers&rsquo; terms. We are not responsible for third-party
        services we do not control.
      </p>

      <h2>8. Disclaimers</h2>
      <p>
        The Service is provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; without
        warranties of any kind, whether express or implied, including warranties of
        merchantability, fitness for a particular purpose, accuracy, and non-infringement.
        We do not warrant that the Service will be uninterrupted, error-free, or that any
        provisional assessment will be accurate or complete.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, we will not be liable for any indirect,
        incidental, special, consequential, or punitive damages, or for any loss arising
        from clinical decisions made in reliance on the Service without qualified
        professional review.
      </p>

      <h2>10. Termination</h2>
      <p>
        We may suspend or terminate access to the Service if you violate these Terms or to
        protect the Service and its users. You may stop using the Service and request
        account deletion at any time.
      </p>

      <h2>11. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. Material changes will be reflected by
        updating the &ldquo;Last updated&rdquo; date above and, where appropriate, through
        additional notice within the Service. Continued use after changes take effect
        constitutes acceptance of the updated Terms.
      </p>

      <h2>12. Contact us</h2>
      <p>
        Questions about these Terms can be sent to{' '}
        <a href="mailto:cdssoau@gmail.com">cdssoau@gmail.com</a>.
      </p>
    </LegalPage>
  );
}
