'use client';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CaseViewPage() {
  const router = useRouter();

  const caseData = {
    patientName: "David's Case File",
    additionalInfo: "Patient's Additional Info",
    name: 'Bola Ahmed Tinubu',
    dateOfBirth: '05-05-1988',
    sex: 'Male',
    assessmentDate: '11 November, 2025',
    diagnosis: 'Lumbar Disc Herniation',
    confidenceRate: '84%',
    vasScore: '7/10',
    oxfordScore: '4/5',
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-3 pb-6 sm:px-4 sm:pb-8">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center">
        <button
          onClick={() => router.back()}
          className="shrink-0 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeft size={20} className="sm:h-6 sm:w-6" />
        </button>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 sm:h-12 sm:w-12 dark:bg-gray-700">
          <svg
            className="h-5 w-5 text-gray-500 sm:h-6 sm:w-6 dark:text-gray-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold text-gray-900 sm:text-lg dark:text-gray-100">
            {caseData.patientName}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {caseData.additionalInfo}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-green-500 sm:h-2.5 sm:w-2.5"></div>
          <span className="text-xs whitespace-nowrap text-gray-600 dark:text-gray-400">
            Currently Diagnosed
          </span>
        </div>
      </div>

      {/* Patient Info Card */}
      <div className="mb-4 grid grid-cols-1 gap-2.5 rounded-lg border border-gray-200 bg-white p-3 sm:mb-6 sm:grid-cols-2 sm:gap-3 sm:p-4 lg:grid-cols-4 dark:border-gray-700 dark:bg-gray-800">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Name:</p>
          <p className="truncate text-xs font-medium text-gray-900 sm:text-sm dark:text-gray-100">
            {caseData.name}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Date Of Birth:</p>
          <p className="text-xs font-medium text-gray-900 sm:text-sm dark:text-gray-100">
            {caseData.dateOfBirth}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Sex:</p>
          <p className="text-xs font-medium text-gray-900 sm:text-sm dark:text-gray-100">
            {caseData.sex}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Assessment Date:</p>
          <p className="text-xs font-medium text-gray-900 sm:text-sm dark:text-gray-100">
            {caseData.assessmentDate}
          </p>
        </div>
      </div>

      {/* Assessment Summary */}
      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3 sm:mb-6 sm:p-4 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-2.5 text-sm font-semibold text-gray-900 sm:mb-3 sm:text-base dark:text-gray-100">
          Assessment Summary
        </h2>
        <p className="mb-2.5 text-xs leading-relaxed text-gray-700 sm:mb-3 sm:text-sm dark:text-gray-300">
          Based on the completed lumbar assessment task, the patient exhibits moderate
          signs of lumbar disc herniation. Symptoms include lower back pain, radiating
          pain down the left leg (sciatica), and restricted range of motion, particularly
          with forward bending and flexion. The patient reported mild-to-moderate
          functional limitation from one typical daily activities such as prolonged
          sitting or standing.
        </p>

        <h3 className="mb-1.5 text-xs font-semibold text-gray-900 sm:mb-2 sm:text-sm dark:text-gray-100">
          Key Findings
        </h3>
        <ul className="mb-2.5 space-y-1 text-xs leading-relaxed text-gray-700 sm:mb-3 sm:text-sm dark:text-gray-300">
          <li className="flex gap-2">
            <span className="shrink-0 text-gray-500 dark:text-gray-400">•</span>
            <span>
              Pain triggered by forward bending, prolonged sitting, and twisting.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-gray-500 dark:text-gray-400">•</span>
            <span>
              Positive straight leg raise (SLR) test on the left side at 45 degrees.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-gray-500 dark:text-gray-400">•</span>
            <span>
              Strength: Observations: Slight weakness in core stabilizers and lower back
              muscles.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-gray-500 dark:text-gray-400">•</span>
            <span>
              Neurological: Mild tingling only identifies sciatica bending sitting for
              long periods.
            </span>
          </li>
        </ul>

        <h3 className="mb-1.5 text-xs font-semibold text-gray-900 sm:mb-2 sm:text-sm dark:text-gray-100">
          Overall Assessment:
        </h3>
        <p className="text-xs leading-relaxed text-gray-700 sm:text-sm dark:text-gray-300">
          The findings suggest a non-specific lumbar disc-related dysfunction, likely due
          to posture and movement patterns rather than acute injury. Conservative
          treatment including strengthening exercises, posture correction, and manual
          therapy is recommended to improve musculoskeletal with guided physiotherapy
          interventions.
        </p>
      </div>

      {/* Temporary Diagnosis */}
      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3 sm:mb-6 sm:p-4 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-3 text-sm font-semibold text-gray-900 sm:mb-4 sm:text-base dark:text-gray-100">
          Temporary Diagnosis
        </h2>

        <div className="mb-3 flex flex-col gap-4 rounded-lg bg-gray-50 p-4 sm:mb-4 sm:flex-row sm:items-center sm:justify-between dark:bg-gray-900">
          <h3 className="text-base font-bold text-gray-900 sm:text-lg dark:text-gray-100">
            {caseData.diagnosis}
          </h3>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-gray-100">
              {caseData.confidenceRate}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Confidence Rate</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3 text-center sm:p-4 dark:border-cyan-800 dark:bg-cyan-900/20">
            <div className="mb-1.5 text-xl font-bold text-cyan-600 sm:mb-2 sm:text-2xl dark:text-cyan-400">
              {caseData.vasScore}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">VAS Scale</p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center sm:p-4 dark:border-green-800 dark:bg-green-900/20">
            <div className="mb-1.5 text-xl font-bold text-green-600 sm:mb-2 sm:text-2xl dark:text-green-400">
              {caseData.oxfordScore}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Oxford Minor Scale</p>
          </div>
        </div>
      </div>

      {/* Uploaded Documents */}
      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3 sm:mb-6 sm:p-4 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-3 text-sm font-semibold text-gray-900 sm:mb-4 sm:text-base dark:text-gray-100">
          Uploaded Documents
        </h2>

        {/* MRI */}
        <div className="mb-3 sm:mb-4">
          <h3 className="mb-1.5 text-xs font-medium text-gray-700 sm:mb-2 sm:text-sm dark:text-gray-300">
            MRI
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            <div className="aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-700">
              <div className="flex h-full items-center justify-center text-xs text-gray-400">
                Image
              </div>
            </div>
            <div className="aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
              <div className="flex h-full items-center justify-center text-xs text-gray-400 dark:text-gray-500">
                None
              </div>
            </div>
            <div className="aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
              <div className="flex h-full items-center justify-center text-xs text-gray-400 dark:text-gray-500">
                None
              </div>
            </div>
          </div>
        </div>

        {/* X-Ray */}
        <div className="mb-3 sm:mb-4">
          <h3 className="mb-1.5 text-xs font-medium text-gray-700 sm:mb-2 sm:text-sm dark:text-gray-300">
            X-Ray
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            <div className="aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-700">
              <div className="flex h-full items-center justify-center text-xs text-gray-400">
                Image
              </div>
            </div>
            <div className="aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
              <div className="flex h-full items-center justify-center text-xs text-gray-400 dark:text-gray-500">
                None
              </div>
            </div>
            <div className="aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
              <div className="flex h-full items-center justify-center text-xs text-gray-400 dark:text-gray-500">
                None
              </div>
            </div>
          </div>
        </div>

        {/* Other Clinical Files */}
        <div className="mb-3 sm:mb-4">
          <h3 className="mb-1.5 text-xs font-medium text-gray-700 sm:mb-2 sm:text-sm dark:text-gray-300">
            Other Clinical Files
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
              >
                <div className="flex h-full items-center justify-center text-xs text-gray-400 dark:text-gray-500">
                  None
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Other Pictures Or Videos */}
        <div>
          <h3 className="mb-1.5 text-xs font-medium text-gray-700 sm:mb-2 sm:text-sm dark:text-gray-300">
            Other Pictures Or Videos
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            <div className="aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-700">
              <div className="flex h-full items-center justify-center text-xs text-gray-400">
                Image
              </div>
            </div>
            <div className="aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
              <div className="flex h-full items-center justify-center text-xs text-gray-400 dark:text-gray-500">
                None
              </div>
            </div>
            <div className="aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
              <div className="flex h-full items-center justify-center text-xs text-gray-400 dark:text-gray-500">
                None
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-3 text-sm font-semibold text-gray-900 sm:mb-4 sm:text-base dark:text-gray-100">
          Quick Actions
        </h2>
        <div className="space-y-2.5 sm:space-y-4">
          <button className="relative w-full overflow-hidden rounded-xl bg-linear-to-r from-green-400 to-green-500 p-4 text-left text-white transition-transform hover:scale-105 sm:rounded-2xl sm:p-5 md:p-6">
            <div className="relative z-10 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="mb-1.5 flex items-center gap-2 sm:gap-3">
                  <svg
                    className="h-5 w-5 shrink-0 sm:h-6 sm:w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 10h12V5H7v5zm12-7H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                  </svg>
                  <span className="text-sm font-bold sm:text-base">Book Appointment</span>
                </div>
                <p className="text-xs opacity-95 sm:text-sm">
                  Schedule your next physiotherapy session with your patient.
                </p>
              </div>
            </div>
            <svg
              className="absolute top-0 right-0 h-24 w-24 opacity-25 sm:h-32 sm:w-32 md:h-40 md:w-40"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="50"
                y="20"
                width="35"
                height="45"
                rx="3"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M60 35h15M60 45h15M60 55h15M65 75h5v5h-5z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <button className="relative w-full overflow-hidden rounded-xl bg-linear-to-r from-blue-400 to-blue-500 p-4 text-left text-white transition-transform hover:scale-105 sm:rounded-2xl sm:p-5 md:p-6">
            <div className="relative z-10 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="mb-1.5 flex items-center gap-2 sm:gap-3">
                  <svg
                    className="h-5 w-5 shrink-0 sm:h-6 sm:w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                  </svg>
                  <span className="text-sm font-bold sm:text-base">
                    Check Guided-Test
                  </span>
                </div>
                <p className="text-xs opacity-95 sm:text-sm">
                  Guided tests already assigned to your patient
                </p>
              </div>
            </div>
            <svg
              className="absolute top-0 right-0 h-24 w-24 opacity-25 sm:h-32 sm:w-32 md:h-40 md:w-40"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M55 25L70 40M55 40L70 55M50 60L65 75"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="60" cy="50" r="8" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>

          <button className="relative w-full overflow-hidden rounded-xl bg-linear-to-r from-purple-500 to-purple-600 p-4 text-left text-white transition-transform hover:scale-105 sm:rounded-2xl sm:p-5 md:p-6">
            <div className="relative z-10 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="mb-1.5 flex items-center gap-2 sm:gap-3">
                  <svg
                    className="h-5 w-5 shrink-0 sm:h-6 sm:w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V8h8v2z" />
                  </svg>
                  <span className="text-sm font-bold sm:text-base">Treatment Plan</span>
                </div>
                <p className="text-xs opacity-95 sm:text-sm">
                  Check documents uploaded by the your patient
                </p>
              </div>
            </div>
            <svg
              className="absolute top-0 right-0 h-24 w-24 opacity-25 sm:h-32 sm:w-32 md:h-40 md:w-40"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="40"
                y="25"
                width="35"
                height="50"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M48 35h19M48 45h19M48 55h12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="72" cy="62" r="6" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
