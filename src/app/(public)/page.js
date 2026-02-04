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
  Brain,
  Users,
  BookOpen,
  Shield,
  ChevronRight,
  Activity,
  Target,
  Microscope,
  GraduationCap,
} from 'lucide-react';

/**
 * CDSS Landing Page
 * ==================
 * A world-class landing page for the Clinical Decision Support System
 * for Musculoskeletal Diagnosis, designed for African healthcare.
 *
 * Design Principles:
 * - Credible, modern, human, and African
 * - Warm earth tones inspired by African aesthetics
 * - Clean typography, plenty of white space
 * - Confident but humble tone
 */

export default function LandingPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
    <div className="min-h-screen bg-white">
      {/* ============================================
          NAVIGATION
          ============================================ */}
      <nav className="fixed top-0 right-0 left-0 z-50 border-b border-stone-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-teal-700">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-stone-900">CDSS</span>
            </div>
            <div className="hidden items-center gap-8 md:flex">
              <a
                href="#problem"
                className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
              >
                The Challenge
              </a>
              <a
                href="#solution"
                className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
              >
                Our Approach
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
              >
                How It Works
              </a>
              <a
                href="#africa"
                className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
              >
                Why Africa
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-teal-700"
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
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-white to-amber-50/30" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Hero Content */}
            <div
              className={`transition-all duration-1000 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-teal-500" />
                <span className="text-sm font-medium text-teal-700">
                  Clinical Decision Support for Africa
                </span>
              </div>

              <h1 className="text-4xl leading-tight font-bold tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
                Better diagnosis starts with{' '}
                <span className="text-teal-600">better questions</span>
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-stone-600 sm:text-xl">
                A clinical decision support system that guides musculoskeletal diagnosis
                through structured clinical reasoning. Built by African clinicians, for
                African healthcare realities.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-teal-600 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-teal-700"
                >
                  Start Your Assessment
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-4 py-4 text-base font-medium text-stone-600 transition-colors hover:text-stone-900"
                >
                  See how it works
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex items-center gap-6 border-t border-stone-100 pt-8">
                <div className="text-center">
                  <p className="text-2xl font-bold text-stone-900">39+</p>
                  <p className="text-sm text-stone-500">Conditions covered</p>
                </div>
                <div className="h-8 w-px bg-stone-200" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-stone-900">150+</p>
                  <p className="text-sm text-stone-500">Clinical tests referenced</p>
                </div>
                <div className="h-8 w-px bg-stone-200" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-stone-900">5</p>
                  <p className="text-sm text-stone-500">Body regions</p>
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
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-teal-100/50 to-amber-100/50 blur-2xl" />
                <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                  <Image
                    src="/images/hero-clinician.png"
                    alt="African physiotherapist conducting a shoulder examination in a modern clinic with warm earth-toned walls and traditional African artwork"
                    width={600}
                    height={600}
                    className="aspect-square object-cover"
                    priority
                  />
                </div>
                {/* Floating card */}
                <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50">
                      <Stethoscope className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900">
                        Evidence-based
                      </p>
                      <p className="text-xs text-stone-500">Clinical guidance</p>
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
      <section id="problem" className="bg-stone-900 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              The diagnostic challenge
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-stone-300">
              Musculoskeletal conditions are among the most common reasons patients seek
              care. Yet getting the diagnosis right remains difficult, especially in
              resource-constrained settings.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Challenge 1 */}
            <div className="rounded-2xl border border-stone-700 bg-stone-800/50 p-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
                <Target className="h-7 w-7 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Misdiagnosis is common</h3>
              <p className="mt-4 text-stone-400">
                Without structured assessment tools, conditions are often misidentified. A
                shoulder impingement becomes a rotator cuff tear. Sciatica becomes
                non-specific back pain. Patients receive generic treatment instead of
                targeted care.
              </p>
            </div>

            {/* Challenge 2 */}
            <div className="rounded-2xl border border-stone-700 bg-stone-800/50 p-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
                <BookOpen className="h-7 w-7 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Clinical knowledge is uneven
              </h3>
              <p className="mt-4 text-stone-400">
                Not every clinician has the same training or access to continuing
                education. A physiotherapist in Lagos may have different resources than
                one in a rural clinic. Decision support can bridge this gap.
              </p>
            </div>

            {/* Challenge 3 */}
            <div className="rounded-2xl border border-stone-700 bg-stone-800/50 p-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
                <Microscope className="h-7 w-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Imaging is not always available
              </h3>
              <p className="mt-4 text-stone-400">
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
      <section id="solution" className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Image */}
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-teal-50 to-amber-50 blur-xl" />
                <div className="relative overflow-hidden rounded-3xl shadow-xl">
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
              <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                A structured path to diagnosis
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-stone-600">
                Our Clinical Decision Support System guides you through musculoskeletal
                assessment step by step. It asks the right questions, suggests relevant
                clinical tests, and helps you reach a well-reasoned provisional diagnosis.
              </p>

              <div className="mt-10 space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50">
                    <CheckCircle className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900">
                      Systematic questioning
                    </h3>
                    <p className="mt-1 text-stone-600">
                      Guided questions based on presenting symptoms, history, and clinical
                      patterns.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50">
                    <CheckCircle className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900">
                      Clinical test recommendations
                    </h3>
                    <p className="mt-1 text-stone-600">
                      Relevant physical examination tests with clear procedures and
                      interpretation guidance.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50">
                    <CheckCircle className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900">
                      Differential diagnosis support
                    </h3>
                    <p className="mt-1 text-stone-600">
                      Condition likelihood analysis based on clinical findings, not
                      guesswork.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50">
                    <CheckCircle className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900">Red flag detection</h3>
                    <p className="mt-1 text-stone-600">
                      Automatic identification of warning signs that require urgent
                      attention or referral.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS
          Simple flow explanation.
          ============================================ */}
      <section id="how-it-works" className="bg-stone-50 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              How it works
            </h2>
            <p className="mt-6 text-lg text-stone-600">
              From first symptom to clinical assessment in four steps.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-4">
            {/* Step 1 */}
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100">
                <span className="text-2xl font-bold text-teal-700">1</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-stone-900">
                Select body region
              </h3>
              <p className="mt-2 text-stone-600">
                Choose the affected area: cervical, lumbar, shoulder, elbow, or ankle.
              </p>
              <div className="absolute top-8 left-20 hidden h-px w-full bg-gradient-to-r from-teal-200 to-transparent md:block" />
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100">
                <span className="text-2xl font-bold text-teal-700">2</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-stone-900">
                Answer guided questions
              </h3>
              <p className="mt-2 text-stone-600">
                Respond to clinically relevant questions about symptoms, history, and
                aggravating factors.
              </p>
              <div className="absolute top-8 left-20 hidden h-px w-full bg-gradient-to-r from-teal-200 to-transparent md:block" />
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100">
                <span className="text-2xl font-bold text-teal-700">3</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-stone-900">
                Review clinical tests
              </h3>
              <p className="mt-2 text-stone-600">
                Get recommendations for physical examination tests with step-by-step
                procedures.
              </p>
              <div className="absolute top-8 left-20 hidden h-px w-full bg-gradient-to-r from-teal-200 to-transparent md:block" />
            </div>

            {/* Step 4 */}
            <div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-600">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-stone-900">
                Receive clinical guidance
              </h3>
              <p className="mt-2 text-stone-600">
                Get a provisional assessment with differential diagnoses and next-step
                recommendations.
              </p>
            </div>
          </div>

          {/* Important note */}
          <div className="mx-auto mt-16 max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                <Shield className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900">
                  Clinical oversight required
                </h4>
                <p className="mt-1 text-sm text-stone-600">
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
      <section id="africa" className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Designed for African healthcare
            </h2>
            <p className="mt-6 text-lg text-stone-600">
              This is not a system built elsewhere and adapted later. It was designed from
              the ground up with the realities of African clinical practice in mind.
            </p>
          </div>

          <div className="mt-16 grid gap-12 lg:grid-cols-3">
            {/* Context 1 */}
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100">
                <GraduationCap className="h-8 w-8 text-amber-700" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-stone-900">
                Training support
              </h3>
              <p className="mt-4 text-stone-600">
                For students and early-career clinicians who need structured guidance
                while building their diagnostic confidence.
              </p>
            </div>

            {/* Context 2 */}
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100">
                <Users className="h-8 w-8 text-teal-700" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-stone-900">
                High patient volumes
              </h3>
              <p className="mt-4 text-stone-600">
                Clinicians often see many patients with limited time. Structured decision
                support helps maintain diagnostic quality under pressure.
              </p>
            </div>

            {/* Context 3 */}
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200">
                <Stethoscope className="h-8 w-8 text-stone-700" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-stone-900">
                Clinical examination focus
              </h3>
              <p className="mt-4 text-stone-600">
                When imaging is not available, thorough clinical examination becomes
                essential. This system emphasizes hands-on assessment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          TRUST & CREDIBILITY
          Evidence-based approach.
          ============================================ */}
      <section className="bg-stone-50 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                Built on clinical evidence
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-stone-600">
                Every question, every test recommendation, and every diagnostic pathway in
                this system is grounded in established clinical literature and best
                practices.
              </p>

              <div className="mt-10 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100">
                    <CheckCircle className="h-4 w-4 text-teal-600" />
                  </div>
                  <p className="text-stone-600">
                    <span className="font-semibold text-stone-900">
                      Peer-reviewed sources.
                    </span>{' '}
                    Clinical guidelines and research inform our decision logic.
                  </p>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100">
                    <CheckCircle className="h-4 w-4 text-teal-600" />
                  </div>
                  <p className="text-stone-600">
                    <span className="font-semibold text-stone-900">
                      Developed with clinicians.
                    </span>{' '}
                    African physiotherapists and healthcare educators contributed to the
                    content.
                  </p>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100">
                    <CheckCircle className="h-4 w-4 text-teal-600" />
                  </div>
                  <p className="text-stone-600">
                    <span className="font-semibold text-stone-900">
                      Continuous improvement.
                    </span>{' '}
                    The system is regularly reviewed and updated based on clinical
                    feedback.
                  </p>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100">
                    <CheckCircle className="h-4 w-4 text-teal-600" />
                  </div>
                  <p className="text-stone-600">
                    <span className="font-semibold text-stone-900">
                      Transparent reasoning.
                    </span>{' '}
                    Every suggestion includes the clinical rationale behind it.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-3xl bg-white p-8 shadow-xl lg:p-12">
              <h3 className="text-lg font-semibold text-stone-900">System coverage</h3>
              <div className="mt-8 space-y-6">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-stone-700">Cervical Region</span>
                    <span className="text-stone-500">2 conditions</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
                    <div className="h-full w-1/5 rounded-full bg-teal-500" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-stone-700">Lumbar Region</span>
                    <span className="text-stone-500">6 conditions</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
                    <div className="h-full w-2/5 rounded-full bg-teal-500" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-stone-700">Shoulder Region</span>
                    <span className="text-stone-500">9 conditions</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
                    <div className="h-full w-3/5 rounded-full bg-teal-500" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-stone-700">Elbow Region</span>
                    <span className="text-stone-500">5 conditions</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
                    <div className="h-full w-1/3 rounded-full bg-teal-500" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-stone-700">Ankle Region</span>
                    <span className="text-stone-500">17 conditions</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
                    <div className="h-full w-full rounded-full bg-teal-500" />
                  </div>
                </div>
              </div>
              <p className="mt-8 text-sm text-stone-500">
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
      <section className="bg-gradient-to-br from-teal-700 to-teal-800 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to improve your diagnostic process?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-teal-100">
            Create an account to access the clinical decision support system. Whether you
            are a patient seeking assessment or a clinician looking for decision support,
            we are here to help.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-teal-700 transition-all hover:bg-teal-50"
            >
              Create an Account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-teal-400 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-teal-600"
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
      <footer className="border-t border-stone-100 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-teal-700">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-stone-900">CDSS</span>
              <span className="text-sm text-stone-500">
                Clinical Decision Support System
              </span>
            </div>
            <div className="flex items-center gap-8 text-sm text-stone-500">
              <Link href="/login" className="hover:text-stone-900">
                Sign In
              </Link>
              <Link href="/register" className="hover:text-stone-900">
                Register
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t border-stone-100 pt-8 text-center text-sm text-stone-500">
            <p>
              © {new Date().getFullYear()} Clinical Decision Support System. Designed for
              African healthcare professionals.
            </p>
            <p className="mt-2 text-xs text-stone-400">
              This system provides decision support only and does not replace professional
              medical judgment.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
