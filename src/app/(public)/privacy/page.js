import { LegalPage } from '../_components/LegalPage';

export const metadata = {
  title: 'Privacy Policy · CDSS',
  description:
    'How the Clinical Decision Support System collects, uses, and protects your personal and health information.',
};

const LAST_UPDATED = 'June 5, 2026';

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <p>
        This Privacy Policy explains how the Clinical Decision Support System
        (&ldquo;CDSS,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;)
        collects, uses, stores, and protects your personal information when you use our
        application at{' '}
        <a href="https://cdss.samkiel.dev">cdss.samkiel.dev</a> (the
        &ldquo;Service&rdquo;). Because the Service supports musculoskeletal clinical
        assessment, some of the information we process is health-related and is handled
        with corresponding care.
      </p>

      <p>
        <strong>This Service provides clinical decision support only. It does not
        provide a medical diagnosis and does not replace professional medical
        judgment.</strong>
      </p>

      <h2>1. Information we collect</h2>
      <h3>Information you provide</h3>
      <ul>
        <li>
          <strong>Account information</strong> — your name, email address, and password
          (passwords are stored only as a salted hash, never in plain text).
        </li>
        <li>
          <strong>Assessment and health information</strong> — the body region, symptoms,
          history, and answers you provide during an assessment, together with any
          clinician notes, physical-test results, and provisional outcomes generated from
          them.
        </li>
        <li>
          <strong>Uploaded files</strong> — any images or documents you choose to upload
          (for example, supporting medical images).
        </li>
      </ul>

      <h3>Information from Google sign-in</h3>
      <p>
        If you sign in with Google, we receive your name, email address, and profile
        picture from your Google account to create or link your CDSS account. We do not
        receive your Google password, and we do not access any other Google data.
      </p>

      <h3>Information collected automatically</h3>
      <ul>
        <li>
          <strong>Session and device data</strong> — basic technical details such as
          browser/device type and IP address, used to maintain your session and to help
          secure your account.
        </li>
      </ul>

      <h2>2. How we use your information</h2>
      <ul>
        <li>To create and manage your account and authenticate you.</li>
        <li>
          To run the clinical assessment, generate a provisional, AI-assisted analysis,
          and present recommended clinical tests for clinician review.
        </li>
        <li>
          To allow an authorized clinician to review your assessment and record their
          clinical findings.
        </li>
        <li>To send transactional emails such as verification and password-reset codes.</li>
        <li>To secure the Service, prevent abuse, and meet legal obligations.</li>
      </ul>

      <h2>3. Automated and AI processing</h2>
      <p>
        To generate a provisional assessment, your structured answers may be processed by
        a third-party AI service (Mistral AI). This output is a preliminary,
        non-diagnostic summary that is always marked as provisional and must be reviewed
        by a qualified healthcare provider. The AI&rsquo;s suggested risk level can never
        downgrade a safety &ldquo;red flag&rdquo; raised by our rule-based engine.
      </p>

      <h2>4. How we share information</h2>
      <p>We do not sell your personal information. We share it only:</p>
      <ul>
        <li>
          <strong>With authorized clinicians</strong> assigned to review your case within
          the Service.
        </li>
        <li>
          <strong>With service providers</strong> that operate the platform on our behalf
          — including our database host (MongoDB Atlas), file storage (Cloudinary), email
          delivery (Gmail SMTP), and AI processing (Mistral AI) — under obligations to
          protect your data.
        </li>
        <li>
          <strong>When required by law</strong>, or to protect the rights, safety, and
          security of users and the Service.
        </li>
      </ul>

      <h2>5. Data retention</h2>
      <p>
        We retain your account and assessment records for as long as your account is
        active or as needed to provide the Service and meet legal and clinical
        record-keeping obligations. One-time verification codes expire within minutes.
        You may request deletion of your account as described below.
      </p>

      <h2>6. Security</h2>
      <p>
        We protect your information using access controls, encrypted transport (HTTPS),
        hashed passwords, and role-based authorization so that records are accessible only
        to you and the clinicians authorized to review your case. No method of
        transmission or storage is completely secure, but we work to protect your
        information and to limit access to it.
      </p>

      <h2>7. Your rights</h2>
      <p>
        Subject to applicable law, you may request to access, correct, export, or delete
        your personal information, and you may object to or restrict certain processing.
        To exercise these rights, contact us using the details below.
      </p>

      <h2>8. Children&rsquo;s privacy</h2>
      <p>
        The Service is intended for use by adults and by clinicians. It is not directed to
        children, and we do not knowingly collect personal information from children
        without appropriate authorization.
      </p>

      <h2>9. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Material changes will be
        reflected by updating the &ldquo;Last updated&rdquo; date above and, where
        appropriate, through additional notice within the Service.
      </p>

      <h2>10. Contact us</h2>
      <p>
        If you have questions about this Privacy Policy or wish to exercise your rights,
        contact us at <a href="mailto:cdssoau@gmail.com">cdssoau@gmail.com</a>.
      </p>
    </LegalPage>
  );
}
