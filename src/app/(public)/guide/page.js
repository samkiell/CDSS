import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  UserRound,
  Stethoscope,
  ShieldCheck,
  ClipboardList,
  Activity,
  MessageSquare,
  Bell,
  FileText,
  CalendarDays,
  Send,
  Settings,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Mail,
  KeyRound,
  Route,
} from 'lucide-react';

export const metadata = {
  title: 'User Guide · CDSS',
  description:
    'A plain-language guide to using the Clinical Decision Support System — creating an account, taking assessments, reviewing cases, running guided tests, and managing the platform.',
};

/* ----------------------------- small helpers ----------------------------- */

function Section({ id, icon: Icon, kicker, title, children }) {
  return (
    <section id={id} className="scroll-mt-24 pt-14 first:pt-0">
      <div className="text-muted-foreground inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
        {Icon && <Icon className="text-primary h-3.5 w-3.5" />}
        {kicker}
      </div>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function Sub({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {children}
    </div>
  );
}

function P({ children }) {
  return <p className="text-muted-foreground text-[15px] leading-7">{children}</p>;
}

function B({ children }) {
  return <strong className="text-foreground font-semibold">{children}</strong>;
}

function Steps({ items }) {
  return (
    <ol className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="bg-primary/10 text-primary mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
            {i + 1}
          </span>
          <span className="text-muted-foreground text-[15px] leading-7">{item}</span>
        </li>
      ))}
    </ol>
  );
}

function Bullets({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="bg-primary/60 mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full" />
          <span className="text-muted-foreground text-[15px] leading-7">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Callout({ tone = 'info', title, children }) {
  const tones = {
    info: 'border-primary/30 bg-primary/5',
    warn: 'border-amber-500/40 bg-amber-500/5',
    good: 'border-emerald-500/40 bg-emerald-500/5',
  };
  const icons = {
    info: <HelpCircle className="text-primary h-4 w-4 shrink-0" />,
    warn: <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />,
    good: <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />,
  };
  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <div className="flex items-center gap-2">
        {icons[tone]}
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <div className="text-muted-foreground mt-1.5 text-sm leading-6">{children}</div>
    </div>
  );
}

function TermRow({ term, children }) {
  return (
    <div className="border-border rounded-xl border p-4">
      <p className="text-sm font-semibold">{term}</p>
      <p className="text-muted-foreground mt-1 text-sm leading-6">{children}</p>
    </div>
  );
}

/* ------------------------------ table of contents ------------------------------ */

const TOC = [
  { id: 'welcome', label: 'Welcome — what is CDSS?' },
  { id: 'getting-started', label: 'Getting started: accounts & signing in' },
  { id: 'finding-your-way', label: 'Finding your way around' },
  { id: 'patients', label: 'For patients' },
  { id: 'clinicians', label: 'For clinicians' },
  { id: 'admins', label: 'For administrators' },
  { id: 'glossary', label: 'Colours, badges & terms explained' },
  { id: 'journey', label: 'The complete journey, start to finish' },
  { id: 'faq', label: 'Common questions' },
  { id: 'help', label: 'Need more help?' },
];

/* --------------------------------- page --------------------------------- */

export default function GuidePage() {
  return (
    <div className="bg-background text-foreground min-h-screen w-full">
      {/* Header band */}
      <div className="border-border bg-muted/30 relative border-b">
        <div className="bg-primary/60 absolute inset-x-0 top-0 h-px" />
        <div className="mx-auto max-w-3xl px-6 pt-24 pb-12 lg:px-8">
          <Link
            href="/"
            className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="text-muted-foreground mt-6 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
            <BookOpen className="text-primary h-3.5 w-3.5" />
            Help &amp; Documentation
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            CDSS User Guide
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl text-[15px] leading-7">
            Everything you need to use the Clinical Decision Support System — written in
            plain language, with no technical knowledge required. Use the contents below
            to jump straight to the part that matters to you.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-3xl px-6 py-14 lg:px-8">
        {/* Table of contents */}
        <nav
          aria-label="Guide contents"
          className="border-border bg-muted/30 rounded-2xl border p-6"
        >
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
            In this guide
          </p>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2">
            {TOC.map((item, i) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="hover:text-primary group inline-flex items-baseline gap-2 text-sm transition-colors"
                >
                  <span className="text-primary font-mono text-xs">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-muted-foreground group-hover:text-primary">
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ------------------------------ 1. WELCOME ------------------------------ */}
        <Section id="welcome" icon={BookOpen} kicker="Section 01" title="Welcome — what is CDSS?">
          <P>
            CDSS stands for <B>Clinical Decision Support System</B>. It is a website that
            helps with the diagnosis of <B>musculoskeletal problems</B> — that is, pain
            and injuries affecting muscles, bones, joints, and nerves, such as low back
            pain, neck pain, shoulder problems, or knee injuries.
          </P>
          <P>
            The system works by asking patients a series of carefully structured
            questions about their pain, then suggesting what the problem is most likely
            to be, which physical tests a clinician should perform to confirm it, and
            what warning signs (if any) need urgent attention. A qualified clinician
            always reviews and confirms the final result — the system supports the
            clinician&apos;s judgement, it never replaces it.
          </P>

          <Sub title="Three types of accounts">
            <P>
              Everything in CDSS is organised around three roles. When you sign in, the
              system automatically shows you the workspace that matches your role:
            </P>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="border-border rounded-xl border p-4">
                <UserRound className="text-primary h-5 w-5" />
                <p className="mt-2 text-sm font-semibold">Patient</p>
                <p className="text-muted-foreground mt-1 text-sm leading-6">
                  Answers questions about their symptoms, uploads scans or documents,
                  tracks recovery, and messages their clinician.
                </p>
              </div>
              <div className="border-border rounded-xl border p-4">
                <Stethoscope className="text-primary h-5 w-5" />
                <p className="mt-2 text-sm font-semibold">Clinician</p>
                <p className="text-muted-foreground mt-1 text-sm leading-6">
                  Reviews patient cases, performs guided physical tests, confirms
                  diagnoses, plans treatment, and schedules sessions.
                </p>
              </div>
              <div className="border-border rounded-xl border p-4">
                <ShieldCheck className="text-primary h-5 w-5" />
                <p className="mt-2 text-sm font-semibold">Administrator</p>
                <p className="text-muted-foreground mt-1 text-sm leading-6">
                  Manages user accounts, approves clinicians, assigns cases, and keeps
                  the platform running smoothly.
                </p>
              </div>
            </div>
          </Sub>

          <Callout tone="warn" title="An important safety note">
            CDSS provides <B>decision support</B>, not a medical diagnosis. Every result
            produced by the system is preliminary and must be confirmed by a qualified
            healthcare professional. If you are experiencing a life-threatening
            emergency, contact your local emergency services immediately.
          </Callout>
        </Section>

        {/* --------------------------- 2. GETTING STARTED --------------------------- */}
        <Section
          id="getting-started"
          icon={KeyRound}
          kicker="Section 02"
          title="Getting started: accounts & signing in"
        >
          <Sub title="Creating an account">
            <Steps
              items={[
                <>
                  From the home page, click <B>&ldquo;Get Started&rdquo;</B> (top right)
                  or <B>&ldquo;Start your assessment&rdquo;</B>. This opens the
                  registration page.
                </>,
                <>
                  Fill in your <B>first name</B>, <B>last name</B>, <B>email address</B>,
                  and choose a <B>password</B> of at least 8 characters. Type the
                  password a second time to confirm it.
                </>,
                <>
                  Click <B>&ldquo;Continue to Verification&rdquo;</B>. The system sends a{' '}
                  <B>4-digit code</B> to your email address.
                </>,
                <>
                  Open your email, find the code, and type it into the verification
                  screen. The code expires after 5 minutes — if it has expired or never
                  arrived, click <B>&ldquo;Resend Code&rdquo;</B>.
                </>,
                <>
                  Once the code is accepted you will see{' '}
                  <B>&ldquo;Verification successful&rdquo;</B> and be taken to the
                  sign-in page. Your account now exists — sign in with the email and
                  password you chose.
                </>,
              ]}
            />
            <Callout tone="info" title="Prefer one click? Use Google">
              On both the registration and sign-in pages there is a{' '}
              <B>&ldquo;Continue with Google&rdquo;</B> button. Clicking it lets you sign
              in with your existing Google account — no password or verification code
              needed.
            </Callout>
          </Sub>

          <Sub title="Signing in">
            <Steps
              items={[
                <>
                  Go to the sign-in page and enter your <B>email</B> and <B>password</B>,
                  then click <B>&ldquo;Sign In&rdquo;</B>.
                </>,
                <>
                  The system recognises your role and takes you to the right place
                  automatically: patients land on the <B>Patient Dashboard</B>,
                  clinicians on the <B>Clinician Dashboard</B>, and administrators on the{' '}
                  <B>Admin Dashboard</B>.
                </>,
              ]}
            />
          </Sub>

          <Sub title="Forgot your password?">
            <Steps
              items={[
                <>
                  On the sign-in page, click <B>&ldquo;Forgot password?&rdquo;</B>.
                </>,
                <>
                  Enter your email address and click{' '}
                  <B>&ldquo;Send reset code&rdquo;</B>. A 4-digit code is emailed to you.
                </>,
                <>
                  Enter the code, choose a new password (at least 8 characters), confirm
                  it, and click <B>&ldquo;Reset password&rdquo;</B>. You can now sign in
                  with the new password.
                </>,
              ]}
            />
          </Sub>
        </Section>

        {/* --------------------------- 3. FINDING YOUR WAY --------------------------- */}
        <Section
          id="finding-your-way"
          icon={Route}
          kicker="Section 03"
          title="Finding your way around"
        >
          <P>
            Once signed in, the screen is always laid out the same way, whatever your
            role:
          </P>
          <Bullets
            items={[
              <>
                <B>The sidebar (left side of the screen)</B> — this is your main menu.
                Every major area of your workspace is listed here: Dashboard, Messages,
                Notifications, Settings, and the tools specific to your role. The item
                you are currently on is highlighted.
              </>,
              <>
                <B>The dashboard</B> — your home screen. It summarises what needs your
                attention right now and offers shortcuts to the most common actions. You
                can always return to it from the sidebar.
              </>,
              <>
                <B>Messages</B> — a private, secure chat between patients and their
                clinician (and the platform support team). Look for the unread-count
                badge to see if something is waiting for you.
              </>,
              <>
                <B>Notifications</B> — a running feed of updates: new assignments,
                completed assessments, appointment reminders, and announcements.
              </>,
              <>
                <B>Settings</B> — where you update your personal details, photo,
                password, and notification preferences.
              </>,
            ]}
          />
          <Callout tone="info" title="Lost? Go back to the Dashboard">
            If you ever feel unsure where you are, click <B>Dashboard</B> in the sidebar.
            Everything important can be reached again from there.
          </Callout>
        </Section>

        {/* ------------------------------ 4. PATIENTS ------------------------------ */}
        <Section id="patients" icon={UserRound} kicker="Section 04" title="For patients">
          <Sub title="Your dashboard at a glance">
            <P>
              After signing in you land on the <B>Patient Dashboard</B>. Across the top
              you will see three summary cards: your <B>next appointment</B>, your{' '}
              <B>assigned therapist</B>, and your <B>active case</B> (the condition
              currently being looked after). Below them sit a <B>Pain Progress</B> chart
              showing how your pain levels have changed over time, and a{' '}
              <B>Current Treatment Activities</B> table listing your scheduled exercises
              and clinic sessions.
            </P>
            <P>
              On the right-hand side, four quick-action buttons let you jump straight to
              the most common tasks: <B>New Assessment</B>, <B>Continue Case</B>,{' '}
              <B>Clinical Files</B>, and <B>Upload Medical Documents</B>.
            </P>
          </Sub>

          <Sub title="Taking an assessment — step by step">
            <P>
              The assessment is the heart of the system: a guided questionnaire about
              your pain that produces a preliminary analysis for your clinician. It
              usually takes a few minutes.
            </P>
            <Steps
              items={[
                <>
                  <B>Confirm your information.</B> Click{' '}
                  <B>&ldquo;New Assessment&rdquo;</B> from the dashboard or sidebar.
                  First, you confirm a few details about yourself: name, sex, age range,
                  the kind of work you do, and education. These help the system interpret
                  your answers correctly. Click{' '}
                  <B>&ldquo;Confirm &amp; Continue&rdquo;</B>.
                </>,
                <>
                  <B>Choose where it hurts.</B> You will see a set of body-region cards —
                  lower back, neck, shoulder, knee, ankle, and so on. Click the region
                  where your main pain or problem is.
                </>,
                <>
                  <B>Answer the questions.</B> Questions appear one at a time, each with
                  multiple-choice answers — simply click the answer that best describes
                  you. A progress bar at the top shows how far along you are. The
                  questions adapt to your answers, so you are never asked anything
                  irrelevant. Use <B>&ldquo;Previous&rdquo;</B> if you want to change an
                  earlier answer.
                </>,
                <>
                  <B>Review your summary.</B> When the questions finish, a summary page
                  shows your details, the region assessed, and (if you expand{' '}
                  <B>&ldquo;View All Answers&rdquo;</B>) every question and the answer
                  you gave. Check it over, then click{' '}
                  <B>&ldquo;Submit for Review&rdquo;</B>.
                </>,
                <>
                  <B>Wait a few seconds.</B> The system analyses your answers (10–30
                  seconds) and shows a confirmation screen: your assessment has been
                  submitted for a therapist to review.
                </>,
                <>
                  <B>Read your preliminary result.</B> The confirmation screen shows the{' '}
                  <B>suspected condition</B>, a <B>confidence percentage</B>, and a{' '}
                  <B>risk level</B> (Low, Moderate, or Urgent). This is an AI-generated
                  first impression only — a qualified therapist will review it, may
                  contact you for more detail, and will confirm the final diagnosis.
                </>,
              ]}
            />
            <Callout tone="warn" title="What is a red flag?">
              If any of your answers suggest something that may need urgent attention
              (for example, certain patterns of numbness or night pain), the system
              shows a <B>Clinical Alert</B> and flags it for your clinician to look at
              first. This does not necessarily mean something is seriously wrong — it
              means a professional should check it promptly.
            </Callout>
            <Callout tone="good" title="You can pause and come back">
              If you leave an assessment unfinished, the system remembers it. Next time
              you visit the assessment page you will see{' '}
              <B>&ldquo;Unfinished Assessment Found&rdquo;</B> with a{' '}
              <B>&ldquo;Resume Session&rdquo;</B> button.
            </Callout>
          </Sub>

          <Sub title="Tracking your progress">
            <P>
              The <B>Progress</B> page (sidebar) shows your recovery over time: how many
              assessments you have completed, a <B>Recovery Curve</B> chart of your pain
              intensity across visits, a breakdown of your assessments by risk level, and
              which body areas you have had assessed most often. It is a simple way to
              see whether things are improving.
            </P>
          </Sub>

          <Sub title="Uploading medical documents">
            <P>
              On the <B>Medical Documents</B> page (or via{' '}
              <B>&ldquo;Upload Medical Documents&rdquo;</B> on the dashboard) you can add
              X-rays, MRI scans, lab results, or prescriptions so your clinician can view
              them alongside your assessment. Click <B>&ldquo;Add Document&rdquo;</B>,
              choose the file (PDF, photo, or Word document), and it is uploaded and
              shared with your clinician automatically. Each file can later be viewed,
              downloaded, or deleted using the small icons next to it.
            </P>
          </Sub>

          <Sub title="Messages, notifications & settings">
            <Bullets
              items={[
                <>
                  <B>Messages</B> — chat privately with your assigned clinician. Type in
                  the box at the bottom and press the send button; double ticks show when
                  your message has been read.
                </>,
                <>
                  <B>Notifications</B> — updates about your assessments, therapist
                  assignment, treatment plan changes, and appointment reminders.
                </>,
                <>
                  <B>Settings</B> — update your profile photo, personal details, and
                  password; switch email/SMS alerts on or off; and manage privacy
                  options, including downloading a copy of your data.
                </>,
              ]}
            />
          </Sub>
        </Section>

        {/* ----------------------------- 5. CLINICIANS ----------------------------- */}
        <Section id="clinicians" icon={Stethoscope} kicker="Section 05" title="For clinicians">
          <P>
            The clinician portal is the professional workspace. Its purpose is simple: to
            take a patient&apos;s completed questionnaire, show you what the system
            thinks is going on, guide you through the physical tests that confirm or rule
            it out, and help you document treatment afterwards.
          </P>

          <Sub title="Your dashboard">
            <P>
              The <B>Clinician Dashboard</B> opens with three numbers that summarise your
              day: <B>Total Patients</B>, <B>Cases to Review</B>, and <B>Urgent Cases</B>.
              Below them is the list of <B>Assigned Patient Cases</B> — every diagnostic
              session assigned to you, each showing the patient&apos;s name, the body
              region, the date, and a colour-coded risk badge. Click any case to open its
              full case file.
            </P>
          </Sub>

          <Sub title="The patient list">
            <P>
              <B>Patient List</B> (sidebar) shows everyone under your care, with age,
              sex, last activity, main problem area, and a risk badge — red for urgent,
              amber for caution, green for stable. Use it to prioritise who needs
              attention first. Clicking a patient opens their history.
            </P>
          </Sub>

          <Sub title="Reading a case file">
            <P>
              Open a case from the dashboard or <B>Case View</B>. The case file is one
              page organised into six expandable sections, in the order you would
              naturally work through them:
            </P>
            <Steps
              items={[
                <>
                  <B>Patient Biodata</B> — the details the patient confirmed when they
                  started the assessment (name, sex, age range, occupation, education,
                  notes). This is a snapshot from the moment of assessment.
                </>,
                <>
                  <B>Assessment History</B> — if the patient has done more than one
                  assessment, they are listed here. Click an older one to view it; every
                  section on the page updates to show that assessment.
                </>,
                <>
                  <B>Patient Question &amp; Answer Log</B> — every question the patient
                  was asked and exactly what they answered. Answers that triggered a
                  concern carry a <B>Red Flag</B> badge and a light-red highlight so you
                  can spot them instantly.
                </>,
                <>
                  <B>Temporal (Preliminary) Diagnosis</B> — the system&apos;s first
                  impression: the <B>primary suspected condition</B>, a{' '}
                  <B>confidence percentage</B>, a <B>risk level</B>, a ranked list of{' '}
                  <B>differential diagnoses</B> (the runners-up), and the reasoning
                  behind it. This is clearly labelled as AI-assisted and requiring your
                  validation.
                </>,
                <>
                  <B>Recommended Clinical Tests</B> — the physical tests the system
                  suggests to confirm or rule out the suspected condition. Each test
                  shows its purpose and what a positive or negative finding would mean.
                  When you are with the patient, click <B>&ldquo;Start Test&rdquo;</B>{' '}
                  here to begin guided testing.
                </>,
                <>
                  <B>Clinician-Guided Diagnostic Outcome</B> — appears after you have
                  performed the tests. It lists each test with your recorded result, the{' '}
                  <B>final suspected condition</B> the test sequence points to, and which
                  conditions were <B>ruled out</B>. You can compare this directly with
                  the preliminary diagnosis above it.
                </>,
              ]}
            />
            <P>
              Beneath the sections are three quick actions:{' '}
              <B>&ldquo;Schedule Session&rdquo;</B> (book the patient&apos;s next
              appointment), <B>&ldquo;Add Notes&rdquo;</B> (record your clinical
              observations), and <B>&ldquo;Treatment Plan&rdquo;</B> (open the treatment
              planner for this patient).
            </P>
          </Sub>

          <Sub title="Running the guided physical tests">
            <P>
              This is the part you do <B>with the patient in front of you</B>. The system
              walks you through the recommended tests one at a time, in a strict order:
            </P>
            <Steps
              items={[
                <>
                  From the case file, click <B>&ldquo;Start Test&rdquo;</B>. The first
                  test appears with its name and clear, step-by-step instructions for
                  performing it.
                </>,
                <>
                  Perform the test on the patient. If you want, jot observations in the{' '}
                  <B>Procedure Notes</B> box.
                </>,
                <>
                  Record what you found: click the green{' '}
                  <B>&ldquo;Positive Result&rdquo;</B> button or the red{' '}
                  <B>&ldquo;Negative Result&rdquo;</B> button.
                </>,
                <>
                  The next test appears automatically. Repeat until the sequence is
                  complete — a step counter at the top shows your progress.
                </>,
                <>
                  When the last result is recorded, a completion screen shows the{' '}
                  <B>refined diagnosis</B> reached through your test sequence. Click the
                  return button to go back to the case file, where the outcome is now
                  saved permanently.
                </>,
              ]}
            />
            <Callout tone="warn" title="Results are final once recorded">
              To protect clinical integrity, a test result cannot be changed after you
              click Positive or Negative. Take a moment to be sure before recording each
              result.
            </Callout>
          </Sub>

          <Sub title="Planning and tracking treatment">
            <P>
              <B>Treatment Planner</B> (sidebar) lists your patients with the status of
              their recovery programme — <B>Not Started</B>, <B>In Progress</B> (with a
              progress bar), or <B>Completed</B>. Opening a plan shows the{' '}
              <B>Recovery Roadmap</B>: the diagnosis and risk level on the left, and the
              treatment milestones on the right, newest first. Each milestone records the
              goal, the in-clinic treatment given (for example, manual therapy), and the
              home exercises prescribed (for example, &ldquo;3×10 glute bridges&rdquo;).
              The plan is meant to be re-evaluated every 3–5 sessions.
            </P>
          </Sub>

          <Sub title="Appointments, referrals & the rulebook">
            <Bullets
              items={[
                <>
                  <B>Appointments</B> — a chronological list of your scheduled
                  consultations, with the patient, time, type, and status
                  (Confirmed/Pending/Completed). Appointments are created from a case
                  file using <B>&ldquo;Schedule Session&rdquo;</B>.
                </>,
                <>
                  <B>Referral or Order</B> — when a patient needs a specialist, pick the
                  patient, click <B>&ldquo;Create Referral&rdquo;</B>, choose the target
                  specialty (orthopaedic surgeon, radiology, neurologist, sports
                  physician, or rheumatologist), set a preferred date and time, write the
                  clinical reason, and click <B>&ldquo;Authorize Referral&rdquo;</B>.
                </>,
                <>
                  <B>Clinical Heuristic Rulebook</B> — a reference library of all the
                  physical tests the system can recommend, organised by body region
                  (lumbar, cervical, shoulder, ankle, elbow), each with its clinical
                  purpose. Useful for revising a test before performing it.
                </>,
              ]}
            />
          </Sub>

          <Sub title="Your professional profile & settings">
            <Bullets
              items={[
                <>
                  <B>Profile</B> — your photo, name, contact details, and bio.
                </>,
                <>
                  <B>Professional</B> — your licence number, issuing body, experience,
                  and specialisations. New clinician accounts start as{' '}
                  <B>Unverified</B>; an administrator reviews these credentials and
                  approves them, after which a green <B>Verified Clinician</B> badge
                  appears and patients can be assigned to you.
                </>,
                <>
                  <B>Availability</B> — set your working days and hours so appointments
                  are only booked when you are available, and toggle whether you accept
                  new patients.
                </>,
                <>
                  <B>Notifications &amp; Security</B> — choose which alerts you receive,
                  change your password, enable two-factor authentication, and sign out of
                  other devices.
                </>,
              ]}
            />
          </Sub>
        </Section>

        {/* ------------------------------- 6. ADMINS ------------------------------- */}
        <Section id="admins" icon={ShieldCheck} kicker="Section 06" title="For administrators">
          <P>
            Administrators keep the platform healthy: they approve clinicians, connect
            patients to the right clinician, manage accounts, and send announcements.
            Admins sign in through the dedicated admin page and land on the{' '}
            <B>System Overview</B> dashboard, which shows user activity, a queue of new
            assessments awaiting assignment, recently approved therapists, and weekly
            sign-up trends.
          </P>

          <Sub title="Approving a new clinician">
            <Steps
              items={[
                <>
                  Open <B>Therapists</B> in the sidebar. Clinicians awaiting approval
                  show an amber <B>Unverified</B> badge and a note that action is
                  required.
                </>,
                <>
                  Click <B>&ldquo;Verify Now&rdquo;</B> on the clinician&apos;s card and
                  review their licence number, issuing authority, and specialty details.
                </>,
                <>
                  Click <B>&ldquo;Approve Credentials&rdquo;</B> and confirm. The
                  clinician is now verified, receives a notification, and can be assigned
                  patients.
                </>,
              ]}
            />
          </Sub>

          <Sub title="Assigning a patient case to a clinician">
            <Steps
              items={[
                <>
                  Open <B>Sessions</B>. Cases awaiting a clinician show a{' '}
                  <B>Pending Review</B> status.
                </>,
                <>
                  Click a case — an <B>&ldquo;Assign Clinician&rdquo;</B> panel opens on
                  the right listing all verified clinicians (searchable by name or
                  specialty).
                </>,
                <>
                  Click the clinician who best matches the case. A confirmation appears
                  (&ldquo;Case assigned successfully!&rdquo;), the case status changes to{' '}
                  <B>Assigned</B>, and the clinician is notified.
                </>,
              ]}
            />
            <Callout tone="info" title="Only verified clinicians can receive cases">
              Unverified clinicians appear greyed out in the assignment panel. Verify
              their credentials first (see above) and they become available.
            </Callout>
          </Sub>

          <Sub title="Managing users">
            <P>
              The <B>Users</B> page lists every patient and clinician with search and
              filters. The three-dot menu beside each user offers: <B>View Profile</B>,{' '}
              <B>Edit</B>, <B>Change Role</B>, <B>Verify/Unverify</B>,{' '}
              <B>Suspend User</B> (locks the account but can be reversed), and{' '}
              <B>Delete User</B> (permanent — the system asks you to confirm first).
            </P>
          </Sub>

          <Sub title="Announcements, reports & oversight">
            <Bullets
              items={[
                <>
                  <B>Notifications (Broadcast Engine)</B> — send an announcement to
                  everyone, only patients, or only clinicians. Write a title and message,
                  pick the audience, and click <B>&ldquo;Deploy Broadcast&rdquo;</B>.
                  Past broadcasts are listed alongside and can be deleted.
                </>,
                <>
                  <B>Messages</B> — write directly to any user on the platform; your
                  messages appear in their inbox from &ldquo;System Admin&rdquo;.
                </>,
                <>
                  <B>Reports</B> — platform analytics: total sessions, average AI
                  confidence, average review time, risk-level distribution, busiest body
                  regions, and user counts.
                </>,
                <>
                  <B>Guided Diagnostics</B> — manage the diagnostic questionnaires
                  themselves: create a module for a body region, manage its questions,
                  and move it between Draft, Review, Active, and Archived.
                </>,
                <>
                  <B>Settings → System Audit Logs</B> — a permanent, searchable record of
                  every administrative action (who did what, to whom, and when).
                </>,
                <>
                  <B>Settings → System Configuration</B> — rename the platform, open or
                  close patient and clinician registration, and switch on{' '}
                  <B>Maintenance Mode</B>, which temporarily locks out everyone except
                  admins while you make changes.
                </>,
                <>
                  <B>Settings → Security &amp; Privacy</B> — set platform-wide password
                  rules, session timeout, and mandatory two-factor authentication for
                  admins.
                </>,
              ]}
            />
          </Sub>
        </Section>

        {/* ------------------------------ 7. GLOSSARY ------------------------------ */}
        <Section
          id="glossary"
          icon={ClipboardList}
          kicker="Section 07"
          title="Colours, badges & terms explained"
        >
          <P>
            The same colours and labels appear throughout the system. Here is what they
            mean, wherever you see them:
          </P>
          <div className="grid gap-3">
            <TermRow term="Risk level — Green (Low), Amber (Moderate), Red (Urgent)">
              How quickly a case should be looked at. Red means the assessment found
              answers that warrant priority review — it does not automatically mean
              something is seriously wrong, but a clinician should look soon.
            </TermRow>
            <TermRow term="Confidence score (e.g. 87%)">
              How strongly the patient&apos;s answers match the pattern of the suspected
              condition. Higher is a stronger match. A lower score means the picture is
              less clear-cut and physical testing matters even more.
            </TermRow>
            <TermRow term="Red flag">
              An answer that may indicate a serious underlying problem (for example,
              certain patterns of numbness, night pain, or trauma). Red-flagged answers
              are highlighted in the case file so the clinician checks them first.
            </TermRow>
            <TermRow term="Temporal (preliminary) diagnosis">
              The system&apos;s first impression based only on the questionnaire — before
              any physical examination. &ldquo;Temporal&rdquo; simply means
              &ldquo;for now&rdquo;. It always requires a clinician&apos;s validation.
            </TermRow>
            <TermRow term="Differential diagnoses">
              The runner-up conditions — other plausible explanations for the symptoms,
              ranked in order of likelihood. The physical tests help decide between them.
            </TermRow>
            <TermRow term="Refined diagnosis">
              The conclusion reached after the clinician performs the guided physical
              tests. This supersedes the preliminary diagnosis because it is grounded in
              hands-on examination.
            </TermRow>
            <TermRow term="Provisional treatment plan">
              Care suggestions generated automatically right after an assessment, shown
              with a &ldquo;Provisional&rdquo; badge until a clinician reviews and
              confirms the plan.
            </TermRow>
            <TermRow term="Verified clinician">
              A clinician whose medical licence and credentials have been checked and
              approved by an administrator. Only verified clinicians can be assigned
              patient cases.
            </TermRow>
            <TermRow term="Case / diagnostic session">
              One complete assessment journey for one problem: the questionnaire answers,
              the preliminary diagnosis, the physical test results, and the outcome, all
              kept together in a single case file.
            </TermRow>
          </div>
        </Section>

        {/* ------------------------------- 8. JOURNEY ------------------------------- */}
        <Section
          id="journey"
          icon={Activity}
          kicker="Section 08"
          title="The complete journey, start to finish"
        >
          <P>
            Here is how everything fits together — one patient&apos;s problem travelling
            through the whole system. This is the story to keep in mind when
            demonstrating the platform:
          </P>
          <Steps
            items={[
              <>
                <B>The patient registers</B> and verifies their email with a 4-digit
                code, then signs in to their dashboard.
              </>,
              <>
                <B>The patient takes an assessment</B>: confirms their details, picks the
                painful body region, and answers the adaptive questionnaire. The system
                checks every answer for red flags as they go.
              </>,
              <>
                <B>The system produces a preliminary analysis</B>: a suspected condition,
                a confidence score, a risk level, and a list of recommended physical
                tests. The patient sees a simple version; the full detail goes into the
                case file.
              </>,
              <>
                <B>An administrator assigns the case</B> to a suitable verified
                clinician from the Sessions page. The clinician is notified.
              </>,
              <>
                <B>The clinician reviews the case file</B>: the patient&apos;s answers,
                any red flags, the preliminary diagnosis, and the recommended tests —
                all before the patient even arrives.
              </>,
              <>
                <B>At the consultation, the clinician runs the guided tests</B>,
                recording each as positive or negative. The system narrows the
                possibilities with each result and produces a refined diagnosis.
              </>,
              <>
                <B>The clinician confirms the outcome and plans treatment</B>: milestones
                with in-clinic care and home exercises, follow-up appointments, and — if
                needed — a referral to a specialist.
              </>,
              <>
                <B>The patient follows the plan and tracks recovery</B> on their Progress
                page, messages their clinician with questions, and uploads any scans or
                results along the way. Repeat assessments show whether pain is trending
                down.
              </>,
            ]}
          />
        </Section>

        {/* --------------------------------- 9. FAQ --------------------------------- */}
        <Section id="faq" icon={HelpCircle} kicker="Section 09" title="Common questions">
          <div className="space-y-4">
            <Sub title="I never received my 4-digit verification code.">
              <P>
                Check your spam/junk folder first. The code expires after 5 minutes — if
                it has been longer, click <B>&ldquo;Resend Code&rdquo;</B> on the
                verification screen and a fresh code will be sent.
              </P>
            </Sub>
            <Sub title="Is the result the system gives me a diagnosis?">
              <P>
                No. It is a <B>preliminary analysis</B> — an informed starting point. A
                qualified clinician reviews every assessment, performs physical tests,
                and confirms the actual diagnosis. The system is a support tool for that
                process.
              </P>
            </Sub>
            <Sub title="I'm a clinician but I can't be assigned any patients.">
              <P>
                Your account is probably still <B>Unverified</B>. Fill in your licence
                details under <B>Settings → Professional</B> and wait for an
                administrator to approve your credentials. Once verified, you will appear
                in the assignment list.
              </P>
            </Sub>
            <Sub title="I clicked the wrong result during a guided test. Can I undo it?">
              <P>
                No — test results are locked once recorded, to keep the clinical record
                trustworthy. Note the discrepancy with <B>&ldquo;Add Notes&rdquo;</B> on
                the case file, and document your clinical judgement there.
              </P>
            </Sub>
            <Sub title="Who can see my medical information?">
              <P>
                Only you and your assigned clinician (plus reviewing specialists where
                relevant). Documents and messages are stored securely, and the{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{' '}
                explains exactly how data is handled.
              </P>
            </Sub>
            <Sub title="The site says it's under maintenance.">
              <P>
                An administrator has temporarily taken the platform offline for updates.
                Wait a little while and try again — your data is unaffected.
              </P>
            </Sub>
            <Sub title="How do I delete my account?">
              <P>
                Go to <B>Settings → Privacy &amp; Security</B> and use the{' '}
                <B>Delete Account</B> option in the Danger Zone, or contact support at{' '}
                <a href="mailto:cdssoau@gmail.com" className="text-primary hover:underline">
                  cdssoau@gmail.com
                </a>
                .
              </P>
            </Sub>
          </div>
        </Section>

        {/* -------------------------------- 10. HELP -------------------------------- */}
        <Section id="help" icon={Mail} kicker="Section 10" title="Need more help?">
          <P>If anything is still unclear, help is close by:</P>
          <Bullets
            items={[
              <>
                <B>In-app help</B> — patients will find <B>Help &amp; Support</B> under
                Settings; clinicians have a <B>Help Center</B> in their sidebar; admins
                have an <B>Admin Support Portal</B>.
              </>,
              <>
                <B>Message your clinician</B> — for anything about your own care, the
                Messages page is the fastest route.
              </>,
              <>
                <B>Email the team</B> —{' '}
                <a href="mailto:cdssoau@gmail.com" className="text-primary hover:underline">
                  cdssoau@gmail.com
                </a>{' '}
                for account problems, feedback, or anything else.
              </>,
            ]}
          />
          <Callout tone="good" title="One last reminder">
            CDSS is here to make good clinical reasoning easier and more consistent. Take
            your time, read what is on the screen, and remember you can always return to
            the Dashboard — you cannot break anything by exploring.
          </Callout>
        </Section>

        {/* Footer links */}
        <div className="border-border mt-14 border-t pt-8">
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/login" className="hover:text-primary transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="hover:text-primary transition-colors">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
