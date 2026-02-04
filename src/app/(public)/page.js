'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle,
  Stethoscope,
  Users,
  BookOpen,
  Shield,
  ChevronRight,
  Target,
  Microscope,
  GraduationCap,
  Moon,
  Sun,
  Sparkles,
  Heart,
  Brain,
} from 'lucide-react';

/**
 * CDSS Landing Page
 * ==================
 * A world-class landing page for the Clinical Decision Support System
 * for Musculoskeletal Diagnosis, designed for African healthcare.
 *
 * Design Principles:
 * - Credible, modern, human, and African
 * - Uses the site's existing color system with enhanced gradients
 * - Supports both light and dark themes
 * - Smooth scrolling navigation
 * - Clean typography, plenty of white space
 */

export default function LandingPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Check for dark mode preference
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(
      darkModeQuery.matches || document.documentElement.classList.contains('dark')
    );

    const handleChange = (e) => setIsDark(e.matches);
    darkModeQuery.addEventListener('change', handleChange);
    return () => darkModeQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  // Smooth scroll handler
  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
    <div className="bg-background text-foreground min-h-screen scroll-smooth">
      {/* ============================================
          NAVIGATION
          ============================================ */}
      <nav className="border-border/50 bg-background/80 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="CDSS - Clinical Decision Support System"
                width={120}
                height={40}
                className="-mt-1 object-contain"
                style={{ marginTop: '-2px' }}
              />
            </Link>

            {/* Navigation Links */}
            <div className="hidden items-center gap-8 md:flex">
              <Link
                href="/"
                className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <a
                href="#problem"
                onClick={(e) => handleSmoothScroll(e, 'problem')}
                className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
              >
                The Challenge
              </a>
              <a
                href="#solution"
                onClick={(e) => handleSmoothScroll(e, 'solution')}
                className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
              >
                Our Approach
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => handleSmoothScroll(e, 'how-it-works')}
                className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
              >
                How It Works
              </a>
              <a
                href="#africa"
                onClick={(e) => handleSmoothScroll(e, 'africa')}
                className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
              >
                Why Africa
              </a>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-primary border-border/50 bg-card/50 hover:bg-card flex h-9 w-9 items-center justify-center rounded-lg border transition-all"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <Link
                href="/login"
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="from-primary hover:from-primary/90 shadow-primary/25 hover:shadow-primary/30 rounded-full bg-gradient-to-r to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:to-blue-600/90 hover:shadow-xl"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ============================================
          HERO SECTION
          A powerful introduction that explains what 
          the system does in plain language.
          ============================================ */}
      <section className="relative overflow-hidden pt-16">
        {/* Enhanced gradient background */}
        <div className="from-primary/5 via-background absolute inset-0 bg-gradient-to-br to-blue-500/5" />
        <div className="from-primary/10 absolute top-0 right-0 h-1/2 w-1/2 rounded-full bg-gradient-to-bl to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 h-1/3 w-1/3 rounded-full bg-gradient-to-tr from-blue-500/10 to-transparent blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Hero Content */}
            <div
              className={`transition-all duration-1000 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
            >
              {/* Badge */}
              <div className="border-primary/20 from-primary/10 mb-6 inline-flex items-center gap-2 rounded-full border bg-gradient-to-r to-blue-500/10 px-4 py-2">
                <Sparkles className="text-primary h-4 w-4" />
                <span className="from-primary bg-gradient-to-r to-blue-600 bg-clip-text text-sm font-medium text-transparent">
                  Clinical Decision Support for Africa
                </span>
              </div>

              <h1 className="text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Better diagnosis starts with{' '}
                <span className="from-primary to-primary bg-gradient-to-r via-blue-500 bg-clip-text text-transparent">
                  better questions
                </span>
              </h1>

              <p className="text-muted-foreground mt-6 text-lg leading-relaxed sm:text-xl">
                A clinical decision support system that guides musculoskeletal diagnosis
                through structured clinical reasoning. Built by African clinicians, for
                African healthcare realities.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/register"
                  className="from-primary hover:from-primary/90 group shadow-primary/25 hover:shadow-primary/30 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:scale-105 hover:to-blue-600/90 hover:shadow-xl"
                >
                  Start Your Assessment
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="#how-it-works"
                  onClick={(e) => handleSmoothScroll(e, 'how-it-works')}
                  className="text-muted-foreground hover:text-primary inline-flex items-center justify-center gap-2 px-4 py-4 text-base font-medium transition-colors"
                >
                  See how it works
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>

              {/* Trust indicators */}
              <div className="border-border/50 mt-12 flex items-center gap-6 border-t pt-8">
                <div className="text-center">
                  <p className="from-primary bg-gradient-to-r to-blue-600 bg-clip-text text-2xl font-bold text-transparent">
                    39+
                  </p>
                  <p className="text-muted-foreground text-sm">Conditions covered</p>
                </div>
                <div className="bg-border h-8 w-px" />
                <div className="text-center">
                  <p className="from-primary bg-gradient-to-r to-blue-600 bg-clip-text text-2xl font-bold text-transparent">
                    150+
                  </p>
                  <p className="text-muted-foreground text-sm">Clinical tests</p>
                </div>
                <div className="bg-border h-8 w-px" />
                <div className="text-center">
                  <p className="from-primary bg-gradient-to-r to-blue-600 bg-clip-text text-2xl font-bold text-transparent">
                    5
                  </p>
                  <p className="text-muted-foreground text-sm">Body regions</p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div
              className={`transition-all delay-300 duration-1000 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
            >
              <div className="relative">
                <div className="from-primary/20 to-primary/20 absolute -inset-4 rounded-3xl bg-gradient-to-br via-blue-500/10 blur-2xl" />
                <div className="border-border/50 shadow-primary/10 relative overflow-hidden rounded-3xl border shadow-2xl">
                  <Image
                    src="/images/hero-clinician.png"
                    alt="African physiotherapist conducting a shoulder examination in a modern clinic with warm earth-toned walls and traditional African artwork"
                    width={600}
                    height={600}
                    className="aspect-square object-cover"
                    priority
                  />
                  {/* Overlay gradient */}
                  <div className="from-background/20 absolute inset-0 bg-gradient-to-t to-transparent" />
                </div>

                {/* Floating card */}
                <div className="border-border/50 bg-card/90 absolute -bottom-6 -left-6 rounded-2xl border p-4 shadow-xl backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="from-primary/20 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br to-blue-500/20">
                      <Stethoscope className="text-primary h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Evidence-based</p>
                      <p className="text-muted-foreground text-xs">Clinical guidance</p>
                    </div>
                  </div>
                </div>

                {/* Second floating card */}
                <div className="border-border/50 bg-card/90 absolute -top-4 -right-4 rounded-2xl border p-4 shadow-xl backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                      <Heart className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Patient-centered</p>
                      <p className="text-muted-foreground text-xs">Care approach</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          THE PROBLEM
          Diagnostic challenges clinicians face today.
          ============================================ */}
      <section id="problem" className="relative scroll-mt-20 py-24 lg:py-32">
        {/* Background */}
        <div className="from-card via-muted/50 to-card absolute inset-0 bg-gradient-to-b" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="border-destructive/20 bg-destructive/10 mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2">
              <Target className="text-destructive h-4 w-4" />
              <span className="text-destructive text-sm font-medium">The Challenge</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              The diagnostic challenge
            </h2>
            <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
              Musculoskeletal conditions are among the most common reasons patients seek
              care. Yet getting the diagnosis right remains difficult, especially in
              resource-constrained settings.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Challenge 1 */}
            <div className="group border-border/50 bg-card hover:shadow-destructive/5 hover:border-destructive/20 rounded-2xl border p-8 shadow-sm transition-all hover:shadow-xl">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 transition-transform group-hover:scale-110">
                <Target className="h-7 w-7 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold">Misdiagnosis is common</h3>
              <p className="text-muted-foreground mt-4">
                Without structured assessment tools, conditions are often misidentified. A
                shoulder impingement becomes a rotator cuff tear. Sciatica becomes
                non-specific back pain. Patients receive generic treatment instead of
                targeted care.
              </p>
            </div>

            {/* Challenge 2 */}
            <div className="group border-border/50 bg-card hover:shadow-warning/5 hover:border-warning/20 rounded-2xl border p-8 shadow-sm transition-all hover:shadow-xl">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 transition-transform group-hover:scale-110">
                <BookOpen className="h-7 w-7 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold">Clinical knowledge is uneven</h3>
              <p className="text-muted-foreground mt-4">
                Not every clinician has the same training or access to continuing
                education. A physiotherapist in Lagos may have different resources than
                one in a rural clinic. Decision support can bridge this gap.
              </p>
            </div>

            {/* Challenge 3 */}
            <div className="group border-border/50 bg-card hover:shadow-primary/5 hover:border-primary/20 rounded-2xl border p-8 shadow-sm transition-all hover:shadow-xl">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 transition-transform group-hover:scale-110">
                <Microscope className="h-7 w-7 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold">Imaging is not always available</h3>
              <p className="text-muted-foreground mt-4">
                MRI and advanced imaging are expensive and often inaccessible. Clinicians
                need better tools to reach accurate provisional diagnoses through thorough
                clinical examination, not just technology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          THE SOLUTION
          Clear explanation of what we offer.
          ============================================ */}
      <section id="solution" className="bg-background scroll-mt-20 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Image */}
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="from-primary/10 absolute -inset-4 rounded-3xl bg-gradient-to-br via-blue-500/5 to-green-500/10 blur-xl" />
                <div className="border-border/50 relative overflow-hidden rounded-3xl border shadow-xl">
                  <Image
                    src="/images/medical-education.png"
                    alt="African medical students collaborating around a digital learning tool in a training facility"
                    width={600}
                    height={600}
                    className="aspect-square object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <div className="border-success/20 bg-success/10 mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2">
                <CheckCircle className="text-success h-4 w-4" />
                <span className="text-success text-sm font-medium">Our Solution</span>
              </div>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                A structured path to diagnosis
              </h2>
              <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
                Our Clinical Decision Support System guides you through musculoskeletal
                assessment step by step. It asks the right questions, suggests relevant
                clinical tests, and helps you reach a well-reasoned provisional diagnosis.
              </p>

              <div className="mt-10 space-y-6">
                {[
                  {
                    title: 'Systematic questioning',
                    desc: 'Guided questions based on presenting symptoms, history, and clinical patterns.',
                  },
                  {
                    title: 'Clinical test recommendations',
                    desc: 'Relevant physical examination tests with clear procedures and interpretation guidance.',
                  },
                  {
                    title: 'Differential diagnosis support',
                    desc: 'Condition likelihood analysis based on clinical findings, not guesswork.',
                  },
                  {
                    title: 'Red flag detection',
                    desc: 'Automatic identification of warning signs that require urgent attention or referral.',
                  },
                ].map((item, i) => (
                  <div key={i} className="group flex gap-4">
                    <div className="from-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br to-blue-500/10 transition-transform group-hover:scale-110">
                      <CheckCircle className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-muted-foreground mt-1">{item.desc}</p>
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
          Simple flow explanation.
          ============================================ */}
      <section id="how-it-works" className="relative scroll-mt-20 py-24 lg:py-32">
        {/* Background */}
        <div className="from-muted/30 via-primary/5 to-muted/30 absolute inset-0 bg-gradient-to-b" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="border-primary/20 bg-primary/10 mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2">
              <Brain className="text-primary h-4 w-4" />
              <span className="text-primary text-sm font-medium">The Process</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How it works
            </h2>
            <p className="text-muted-foreground mt-6 text-lg">
              From first symptom to clinical assessment in four steps.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-4">
            {[
              {
                num: 1,
                title: 'Select body region',
                desc: 'Choose the affected area: cervical, lumbar, shoulder, elbow, or ankle.',
              },
              {
                num: 2,
                title: 'Answer guided questions',
                desc: 'Respond to clinically relevant questions about symptoms, history, and aggravating factors.',
              },
              {
                num: 3,
                title: 'Review clinical tests',
                desc: 'Get recommendations for physical examination tests with step-by-step procedures.',
              },
              {
                num: 4,
                title: 'Receive clinical guidance',
                desc: 'Get a provisional assessment with differential diagnoses and next-step recommendations.',
                final: true,
              },
            ].map((step, i) => (
              <div key={i} className="group relative">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${
                    step.final
                      ? 'from-primary shadow-primary/25 bg-gradient-to-br to-blue-600 shadow-lg'
                      : 'from-primary/10 border-primary/20 border bg-gradient-to-br to-blue-500/10'
                  }`}
                >
                  <span
                    className={`text-2xl font-bold ${step.final ? 'text-white' : 'text-primary'}`}
                  >
                    {step.num}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
                <p className="text-muted-foreground mt-2">{step.desc}</p>
                {!step.final && (
                  <div className="from-primary/30 absolute top-8 left-20 hidden h-px w-full bg-gradient-to-r to-transparent md:block" />
                )}
              </div>
            ))}
          </div>

          {/* Important note */}
          <div className="border-warning/30 from-warning/10 mx-auto mt-16 max-w-2xl rounded-2xl border bg-gradient-to-r to-amber-500/10 p-6">
            <div className="flex gap-4">
              <div className="bg-warning/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <Shield className="text-warning h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold">Clinical oversight required</h4>
                <p className="text-muted-foreground mt-1 text-sm">
                  This system supports clinical decision-making. It does not replace
                  professional judgment. All assessments should be reviewed by a qualified
                  healthcare provider.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          WHY AFRICA
          Local context and relevance.
          ============================================ */}
      <section id="africa" className="bg-background scroll-mt-20 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-4 py-2">
              <span className="text-lg">🌍</span>
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                Made for Africa
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Designed for African healthcare
            </h2>
            <p className="text-muted-foreground mt-6 text-lg">
              This is not a system built elsewhere and adapted later. It was designed from
              the ground up with the realities of African clinical practice in mind.
            </p>
          </div>

          <div className="mt-16 grid gap-12 lg:grid-cols-3">
            {[
              {
                icon: GraduationCap,
                title: 'Training support',
                desc: 'For students and early-career clinicians who need structured guidance while building their diagnostic confidence.',
                color: 'from-purple-500/10 to-violet-500/10',
                iconColor: 'text-purple-500',
              },
              {
                icon: Users,
                title: 'High patient volumes',
                desc: 'Clinicians often see many patients with limited time. Structured decision support helps maintain diagnostic quality under pressure.',
                color: 'from-primary/10 to-blue-500/10',
                iconColor: 'text-primary',
              },
              {
                icon: Stethoscope,
                title: 'Clinical examination focus',
                desc: 'When imaging is not available, thorough clinical examination becomes essential. This system emphasizes hands-on assessment.',
                color: 'from-green-500/10 to-emerald-500/10',
                iconColor: 'text-green-500',
              },
            ].map((item, i) => (
              <div key={i} className="group text-center">
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} transition-transform group-hover:scale-110`}
                >
                  <item.icon className={`h-8 w-8 ${item.iconColor}`} />
                </div>
                <h3 className="mt-6 text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground mt-4">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          TRUST & CREDIBILITY
          Evidence-based approach.
          ============================================ */}
      <section className="relative py-24 lg:py-32">
        <div className="from-muted/30 to-background absolute inset-0 bg-gradient-to-b" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <div className="border-primary/20 bg-primary/10 mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2">
                <Shield className="text-primary h-4 w-4" />
                <span className="text-primary text-sm font-medium">Evidence-based</span>
              </div>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Built on clinical evidence
              </h2>
              <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
                Every question, every test recommendation, and every diagnostic pathway in
                this system is grounded in established clinical literature and best
                practices.
              </p>

              <div className="mt-10 space-y-6">
                {[
                  {
                    title: 'Peer-reviewed sources.',
                    desc: 'Clinical guidelines and research inform our decision logic.',
                  },
                  {
                    title: 'Developed with clinicians.',
                    desc: 'African physiotherapists and healthcare educators contributed to the content.',
                  },
                  {
                    title: 'Continuous improvement.',
                    desc: 'The system is regularly reviewed and updated based on clinical feedback.',
                  },
                  {
                    title: 'Transparent reasoning.',
                    desc: 'Every suggestion includes the clinical rationale behind it.',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="from-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br to-blue-500/10">
                      <CheckCircle className="text-primary h-4 w-4" />
                    </div>
                    <p className="text-muted-foreground">
                      <span className="text-foreground font-semibold">{item.title}</span>{' '}
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-card border-border/50 rounded-3xl border p-8 shadow-xl lg:p-12">
              <h3 className="text-lg font-semibold">System coverage</h3>
              <div className="mt-8 space-y-6">
                {[
                  { region: 'Cervical Region', count: '2 conditions', width: 'w-1/5' },
                  { region: 'Lumbar Region', count: '6 conditions', width: 'w-2/5' },
                  { region: 'Shoulder Region', count: '9 conditions', width: 'w-3/5' },
                  { region: 'Elbow Region', count: '5 conditions', width: 'w-1/3' },
                  { region: 'Ankle Region', count: '17 conditions', width: 'w-full' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.region}</span>
                      <span className="text-muted-foreground">{item.count}</span>
                    </div>
                    <div className="bg-muted mt-2 h-2 overflow-hidden rounded-full">
                      <div
                        className={`h-full ${item.width} from-primary rounded-full bg-gradient-to-r to-blue-500`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground mt-8 text-sm">
                Additional body regions and conditions are in development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CALL TO ACTION
          Clear next step.
          ============================================ */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        {/* Enhanced gradient background */}
        <div className="from-primary to-primary absolute inset-0 bg-gradient-to-br via-blue-600" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-6 text-center lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to improve your diagnostic process?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
            Create an account to access the clinical decision support system. Whether you
            are a patient seeking assessment or a clinician looking for decision support,
            we are here to help.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="group text-primary inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold shadow-xl transition-all hover:scale-105 hover:bg-white/90"
            >
              Create an Account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          FOOTER
          Simple, professional footer.
          ============================================ */}
      <footer className="border-border bg-card border-t py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="CDSS - Clinical Decision Support System"
                width={100}
                height={36}
                className="object-contain"
              />
              <span className="text-muted-foreground text-sm">
                Clinical Decision Support System
              </span>
            </div>
            <div className="text-muted-foreground flex items-center gap-8 text-sm">
              <Link href="/login" className="hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="hover:text-primary transition-colors">
                Register
              </Link>
            </div>
          </div>
          <div className="border-border text-muted-foreground mt-8 border-t pt-8 text-center text-sm">
            <p>
              © {new Date().getFullYear()} Clinical Decision Support System. Designed for
              African healthcare professionals.
            </p>
            <p className="mt-2 text-xs opacity-60">
              This system provides decision support only and does not replace professional
              medical judgment.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
