'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Stethoscope,
  Users,
  BookOpen,
  ShieldCheck,
  Target,
  Microscope,
  GraduationCap,
  Activity,
  AlertTriangle,
  ClipboardList,
  ListChecks,
  Mail,
} from 'lucide-react';

/**
 * CDSS Landing Page — Clinical Minimal
 * =====================================
 * Design language: near-monochrome, one medical-blue accent, hairline
 * borders, generous whitespace, typographic hierarchy. No decorative
 * gradients. Section ids are preserved for the public navbar anchors
 * (problem / solution / how-it-works / africa).
 */

// Small uppercase eyebrow label used above section headings.
function Eyebrow({ children, icon: Icon }) {
  return (
    <div className="text-muted-foreground inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
      {Icon ? <Icon className="text-primary h-3.5 w-3.5" /> : null}
      {children}
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Redirect authenticated users to their dashboard
  const { data: session, status } = useSession();
  useEffect(() => {
    if (status === 'authenticated') {
      const role = session.user.role;
      if (role === 'ADMIN') router.push('/admin/dashboard');
      else if (role === 'CLINICIAN') router.push('/clinician/dashboard');
      else router.push('/patient/dashboard');
    }
  }, [status, session, router]);

  return (
    <div className="bg-background text-foreground min-h-screen w-full scroll-smooth">
      {/* ============================================
          HERO
          ============================================ */}
      <section className="relative overflow-hidden">
        {/* Fine dot-grid texture — subtle, not a blur blob */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.4] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
          style={{
            backgroundImage:
              'radial-gradient(hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        {/* Thin accent hairline at very top of content */}
        <div className="bg-primary/60 absolute inset-x-0 top-0 h-px" />

        <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-20 lg:px-8 lg:pt-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            {/* Hero copy */}
            <div
              className={`transition-all duration-700 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <div className="border-border bg-card inline-flex items-center gap-2 rounded-full border px-3 py-1">
                <span className="bg-success h-1.5 w-1.5 rounded-full" />
                <span className="text-muted-foreground text-xs font-medium tracking-wide">
                  Clinical Decision Support · Musculoskeletal
                </span>
              </div>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl lg:leading-[1.05]">
                Better diagnosis starts with{' '}
                <span className="text-primary">better questions.</span>
              </h1>

              <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed text-pretty">
                A clinical decision support system that guides musculoskeletal
                diagnosis through structured clinical reasoning — built by African
                clinicians, for African healthcare realities.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/register"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 group inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold shadow-sm transition-colors"
                >
                  Start your assessment
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#how-it-works"
                  onClick={(e) => handleSmoothScroll(e, 'how-it-works')}
                  className="border-border text-foreground hover:bg-muted inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3.5 text-sm font-semibold transition-colors"
                >
                  See how it works
                </a>
              </div>

              {/* Stats — monospaced numerals read precise/clinical */}
              <dl className="border-border mt-12 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-xl border bg-border">
                {[
                  { n: '39+', l: 'Conditions' },
                  { n: '150+', l: 'Clinical tests' },
                  { n: '9', l: 'Body regions' },
                ].map((s) => (
                  <div key={s.l} className="bg-card px-4 py-4">
                    <dt className="font-mono text-2xl font-semibold tracking-tight tabular-nums">
                      {s.n}
                    </dt>
                    <dd className="text-muted-foreground mt-0.5 text-xs">{s.l}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Hero visual — framed image + a clinical "engine output" card */}
            <div
              className={`transition-all delay-150 duration-700 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <div className="relative">
                <div className="border-border bg-card relative overflow-hidden rounded-2xl border shadow-sm">
                  <Image
                    src="/images/hero-clinician.png"
                    alt="A physiotherapist conducting a shoulder examination in a modern clinic"
                    width={640}
                    height={640}
                    className="aspect-[5/6] w-full object-cover"
                    priority
                  />
                </div>

                {/* Engine output card — concrete, clinical, no gradients */}
                <div className="border-border bg-card/95 absolute -bottom-5 -left-5 w-60 rounded-xl border p-4 shadow-lg backdrop-blur-sm">
                  <div className="text-muted-foreground flex items-center justify-between text-[11px] font-medium tracking-wide uppercase">
                    <span>Provisional assessment</span>
                    <Activity className="text-primary h-3.5 w-3.5" />
                  </div>
                  <p className="mt-2 text-sm font-semibold">Rotator cuff tendinopathy</p>
                  <div className="mt-3">
                    <div className="text-muted-foreground flex items-center justify-between text-xs">
                      <span>Likelihood</span>
                      <span className="text-foreground font-mono tabular-nums">82%</span>
                    </div>
                    <div className="bg-muted mt-1.5 h-1.5 overflow-hidden rounded-full">
                      <div className="bg-primary h-full w-[82%] rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Red-flag chip */}
                <div className="border-border bg-card/95 absolute -top-4 right-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 shadow-lg backdrop-blur-sm">
                  <AlertTriangle className="text-warning h-4 w-4" />
                  <span className="text-xs font-medium">Red-flag screening</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          THE PROBLEM
          ============================================ */}
      <section
        id="problem"
        className="border-border bg-muted/30 scroll-mt-20 border-y py-24 lg:py-28"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <Eyebrow icon={Target}>The challenge</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Getting the diagnosis right is still hard
            </h2>
            <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
              Musculoskeletal conditions are among the most common reasons patients
              seek care — yet accurate diagnosis remains difficult, especially in
              resource-constrained settings.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Target,
                title: 'Misdiagnosis is common',
                desc: 'Without structured assessment, a shoulder impingement becomes a rotator cuff tear; sciatica becomes non-specific back pain. Patients get generic treatment instead of targeted care.',
              },
              {
                icon: BookOpen,
                title: 'Clinical knowledge is uneven',
                desc: 'Training and access to continuing education vary widely. A clinician in a tertiary hospital has different resources than one in a rural clinic. Decision support narrows that gap.',
              },
              {
                icon: Microscope,
                title: 'Imaging is not always available',
                desc: 'MRI and advanced imaging are expensive and often inaccessible. Clinicians need better tools to reach accurate provisional diagnoses through thorough examination.',
              },
            ].map((c) => (
              <div
                key={c.title}
                className="group border-border bg-card hover:border-primary/40 rounded-xl border p-7 transition-colors"
              >
                <div className="border-border bg-background text-primary flex h-11 w-11 items-center justify-center rounded-lg border">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{c.title}</h3>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          THE SOLUTION
          ============================================ */}
      <section id="solution" className="scroll-mt-20 py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="border-border bg-card relative overflow-hidden rounded-2xl border shadow-sm">
                <Image
                  src="/images/medical-education.png"
                  alt="Medical students collaborating around a digital clinical learning tool"
                  width={620}
                  height={620}
                  className="aspect-[6/5] w-full object-cover"
                />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <Eyebrow icon={CheckCircle2}>Our approach</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                A structured path to diagnosis
              </h2>
              <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
                The system guides assessment step by step — asking the right
                questions, recommending relevant clinical tests, and helping you
                reach a well-reasoned provisional diagnosis.
              </p>

              <div className="border-border mt-9 divide-y rounded-xl border">
                {[
                  {
                    icon: ClipboardList,
                    title: 'Systematic questioning',
                    desc: 'Guided questions based on presenting symptoms, history, and clinical patterns.',
                  },
                  {
                    icon: ListChecks,
                    title: 'Clinical test recommendations',
                    desc: 'Relevant physical tests with clear procedures and interpretation guidance.',
                  },
                  {
                    icon: Activity,
                    title: 'Differential diagnosis support',
                    desc: 'Condition likelihood from clinical findings — reasoning, not guesswork.',
                  },
                  {
                    icon: AlertTriangle,
                    title: 'Red-flag detection',
                    desc: 'Automatic identification of warning signs that require urgent attention or referral.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 p-5">
                    <div className="border-border bg-muted text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{item.title}</h3>
                      <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS
          ============================================ */}
      <section
        id="how-it-works"
        className="border-border bg-muted/30 scroll-mt-20 border-y py-24 lg:py-28"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <Eyebrow icon={Activity}>The process</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              From first symptom to clinical assessment
            </h2>
            <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
              Four steps, each grounded in clinical reasoning.
            </p>
          </div>

          <div className="border-border mt-14 grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-4">
            {[
              {
                num: '01',
                title: 'Select body region',
                desc: 'Choose the affected area — cervical, lumbar, shoulder, elbow, hip, knee, wrist, or ankle.',
              },
              {
                num: '02',
                title: 'Answer guided questions',
                desc: 'Respond to clinically relevant questions about symptoms, history, and aggravating factors.',
              },
              {
                num: '03',
                title: 'Review clinical tests',
                desc: 'Get recommended physical examination tests with step-by-step procedures.',
              },
              {
                num: '04',
                title: 'Receive guidance',
                desc: 'A provisional assessment with differential diagnoses and next-step recommendations.',
              },
            ].map((step) => (
              <div key={step.num} className="bg-card p-7">
                <span className="text-primary font-mono text-sm font-semibold tabular-nums">
                  {step.num}
                </span>
                <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Clinical-oversight note */}
          <div className="border-border bg-card mx-auto mt-12 flex max-w-3xl items-start gap-4 rounded-xl border p-6">
            <div className="border-warning/30 bg-warning/10 text-warning flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">Clinical oversight required</h4>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                This system supports clinical decision-making — it does not replace
                professional judgment. All assessments should be reviewed by a
                qualified healthcare provider.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          WHY AFRICA
          ============================================ */}
      <section id="africa" className="scroll-mt-20 py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <Eyebrow icon={Users}>Built for context</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Designed for African healthcare
            </h2>
            <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
              Not a system built elsewhere and adapted later — designed from the
              ground up around the realities of African clinical practice.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: GraduationCap,
                title: 'Training support',
                desc: 'Structured guidance for students and early-career clinicians building diagnostic confidence.',
              },
              {
                icon: Users,
                title: 'High patient volumes',
                desc: 'Decision support helps maintain diagnostic quality when time per patient is short.',
              },
              {
                icon: Stethoscope,
                title: 'Examination-first',
                desc: 'When imaging is scarce, thorough clinical examination is essential — and this system centers it.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="border-border bg-card hover:border-primary/40 rounded-xl border p-7 transition-colors"
              >
                <div className="border-border bg-muted text-primary flex h-11 w-11 items-center justify-center rounded-lg border">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          TRUST & COVERAGE
          ============================================ */}
      <section className="border-border bg-muted/30 border-t py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-start gap-16 lg:grid-cols-2">
            <div>
              <Eyebrow icon={ShieldCheck}>Evidence-based</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Built on clinical evidence
              </h2>
              <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
                Every question, test recommendation, and diagnostic pathway is
                grounded in established clinical literature and best practice.
              </p>

              <div className="mt-9 space-y-5">
                {[
                  {
                    title: 'Peer-reviewed sources.',
                    desc: 'Clinical guidelines and research inform the decision logic.',
                  },
                  {
                    title: 'Developed with clinicians.',
                    desc: 'African physiotherapists and educators shaped the content.',
                  },
                  {
                    title: 'Continuous improvement.',
                    desc: 'Reviewed and updated based on clinical feedback.',
                  },
                  {
                    title: 'Transparent reasoning.',
                    desc: 'Every suggestion includes the clinical rationale behind it.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      <span className="text-foreground font-semibold">
                        {item.title}
                      </span>{' '}
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Coverage card */}
            <div className="border-border bg-card rounded-2xl border p-8 shadow-sm lg:p-10">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-wide uppercase">
                  System coverage
                </h3>
                <span className="text-muted-foreground text-xs">9 regions</span>
              </div>
              <div className="mt-7 space-y-5">
                {[
                  { region: 'Ankle', count: 17, pct: 100 },
                  { region: 'Knee', count: 16, pct: 94 },
                  { region: 'Shoulder', count: 9, pct: 53 },
                  { region: 'Wrist', count: 8, pct: 47 },
                  { region: 'Hip', count: 6, pct: 35 },
                  { region: 'Lumbar', count: 6, pct: 35 },
                  { region: 'Elbow', count: 5, pct: 29 },
                ].map((item) => (
                  <div key={item.region}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.region}</span>
                      <span className="text-muted-foreground font-mono text-xs tabular-nums">
                        {item.count} conditions
                      </span>
                    </div>
                    <div className="bg-muted mt-2 h-1.5 overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground border-border mt-7 border-t pt-5 text-xs leading-relaxed">
                Additional body regions and conditions are in active development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CALL TO ACTION
          ============================================ */}
      <section className="py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="bg-primary text-primary-foreground relative overflow-hidden rounded-3xl px-8 py-16 text-center lg:px-16 lg:py-20">
            {/* subtle dot texture over the accent block */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  'radial-gradient(white 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="relative">
              <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Ready to improve your diagnostic process?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/80">
                Create an account to access the clinical decision support system —
                whether you are a patient seeking assessment or a clinician looking
                for decision support.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="text-primary group inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold shadow-sm transition-transform hover:scale-[1.02]"
                >
                  Create an account
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer className="border-border bg-card relative border-t">
        {/* thin accent hairline at top of footer */}
        <div className="bg-primary/60 absolute inset-x-0 top-0 h-px" />

        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-16">
          {/* Top: brand + link columns
              mobile  → brand stacked, then link columns 2-up
              desktop → brand wide, then 3 link columns inline */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-12">
            {/* Brand column — spans the full 2-col width on mobile */}
            <div className="col-span-2 lg:col-span-1 lg:max-w-sm">
              <Image
                src="/logo.png"
                alt="CDSS - Clinical Decision Support System"
                width={112}
                height={40}
                className="object-contain object-left"
              />
              <p className="text-muted-foreground mt-4 max-w-sm text-sm leading-relaxed">
                Structured clinical reasoning for musculoskeletal diagnosis — built
                by African clinicians, for African healthcare realities.
              </p>
              <a
                href="mailto:cdssoau@gmail.com"
                className="border-border text-muted-foreground hover:border-primary/40 hover:text-foreground mt-5 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
              >
                <Mail className="h-4 w-4" />
                cdssoau@gmail.com
              </a>
            </div>

            {/* Link columns */}
            {[
              {
                heading: 'Product',
                links: [
                  { label: 'The challenge', href: '/#problem', id: 'problem' },
                  { label: 'Our approach', href: '/#solution', id: 'solution' },
                  { label: 'How it works', href: '/#how-it-works', id: 'how-it-works' },
                ],
              },
              {
                heading: 'Company',
                links: [
                  { label: 'Why Africa', href: '/#africa', id: 'africa' },
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                ],
              },
              {
                heading: 'Account',
                links: [
                  { label: 'Sign in', href: '/login' },
                  { label: 'Create account', href: '/register' },
                ],
              },
            ].map((col) => (
              <div key={col.heading}>
                <h4 className="text-foreground text-xs font-semibold tracking-[0.16em] uppercase">
                  {col.heading}
                </h4>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.id ? (
                        <a
                          href={link.href}
                          onClick={(e) => handleSmoothScroll(e, link.id)}
                          className="text-muted-foreground hover:text-primary text-sm transition-colors"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-muted-foreground hover:text-primary text-sm transition-colors"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Clinical disclaimer — set apart in its own bordered note */}
          <div className="border-border bg-muted/40 mt-12 flex items-start gap-3 rounded-xl border p-4">
            <ShieldCheck className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-muted-foreground text-xs leading-relaxed">
              <span className="text-foreground font-medium">
                For clinical support only.
              </span>{' '}
              This system provides decision support and does not replace professional
              medical judgment. All assessments should be reviewed by a qualified
              healthcare provider.
            </p>
          </div>

          {/* Bottom bar — copyright left, meta right; wraps cleanly on mobile */}
          <div className="border-border mt-10 flex flex-col gap-4 border-t pt-7 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-xs">
              © {new Date().getFullYear()} Clinical Decision Support System. All rights
              reserved.
            </p>
            <div className="text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <span className="bg-success h-1.5 w-1.5 rounded-full" />
                All systems operational
              </span>
              <span className="text-border hidden sm:inline">|</span>
              <span>Designed for African healthcare professionals</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
