wimport { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the public splash page
  redirect('/');
}

// Note: This file exists to handle the root route.
// The actual splash page is at src/app/(public)/page.js
            Clinical Decision Support for{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Musculoskeletal Diagnosis
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-300">
            An intelligent diagnostic platform combining rule-based heuristics with future
            ML capabilities for accurate musculoskeletal assessment.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-blue-500 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/25"
            >
              Patient Portal
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
            <Link
              href="/clinician/dashboard"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              Clinician Dashboard
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/20">
              <svg
                className="h-7 w-7 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-white">Symptom Assessment</h3>
            <p className="text-slate-400">
              Guided questionnaires capture detailed symptom profiles for accurate
              diagnostic processing.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-500/20">
              <svg
                className="h-7 w-7 text-cyan-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-white">
              Intelligent Analysis
            </h3>
            <p className="text-slate-400">
              Rule-based heuristic engine provides temporal diagnoses with confidence
              scoring.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/20">
              <svg
                className="h-7 w-7 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-white">Clinician Review</h3>
            <p className="text-slate-400">
              Healthcare professionals review, confirm, and refine AI-suggested diagnoses.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mx-auto mt-20 max-w-2xl rounded-xl border border-amber-500/20 bg-amber-500/10 p-6 text-center">
          <p className="text-sm text-amber-200">
            <strong>Medical Disclaimer:</strong> This system provides preliminary
            diagnostic guidance only and is not intended to replace professional medical
            advice, diagnosis, or treatment.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto border-t border-white/10 px-6 py-8">
        <p className="text-center text-sm text-slate-500">
          © 2026 CDSS Platform. Built for Academic Research.
        </p>
      </footer>
    </div>
  );
}
