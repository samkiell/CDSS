/**
 * Clinician Dashboard Page
 * Main landing page for authenticated clinicians
 */

import Link from 'next/link';

export const metadata = {
  title: 'Clinician Dashboard - CDSS',
};

export default function ClinicianDashboard() {
  // Placeholder data - will be fetched from API
  const stats = {
    pendingReviews: 12,
    completedToday: 8,
    totalPatients: 156,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Clinician Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage patient assessments and review diagnoses
        </p>
      </header>

      {/* Stats Overview */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
              <p className="mt-1 text-3xl font-bold text-orange-600">
                {stats.pendingReviews}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <svg
                className="h-6 w-6 text-orange-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed Today</p>
              <p className="mt-1 text-3xl font-bold text-green-600">
                {stats.completedToday}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Patients</p>
              <p className="mt-1 text-3xl font-bold text-blue-600">
                {stats.totalPatients}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <svg
                className="h-6 w-6 text-blue-600"
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
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <Link
          href="/patients"
          className="flex items-center rounded-xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
        >
          <div className="mr-4 flex h-14 w-14 items-center justify-center rounded-lg bg-indigo-100">
            <svg
              className="h-7 w-7 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Patient List</h2>
            <p className="text-gray-600">
              View and manage all assigned patients
            </p>
          </div>
        </Link>

        <Link
          href="/reviews"
          className="flex items-center rounded-xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
        >
          <div className="mr-4 flex h-14 w-14 items-center justify-center rounded-lg bg-amber-100">
            <svg
              className="h-7 w-7 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Pending Reviews
            </h2>
            <p className="text-gray-600">
              Review and confirm AI-generated diagnoses
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {/* Placeholder items */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center">
                <div className="mr-3 h-10 w-10 rounded-full bg-gray-200" />
                <div>
                  <p className="font-medium text-gray-900">Patient Name</p>
                  <p className="text-sm text-gray-500">
                    Assessment completed • Awaiting review
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-400">2h ago</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
