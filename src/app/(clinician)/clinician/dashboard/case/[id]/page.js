import React from 'react';
import { getCaseById } from '@/services/api';
import StatusBadge from '@/components/dashboard/StatusBadge';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Card from '@/components/ui/Card';

export default async function CaseDetailsPage({ params }) {
  const { id } = params;
  const caseData = await getCaseById(id);

  if (!caseData) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-3xl">
          <Card className="p-6 text-center">
            <h2 className="mb-2 text-xl font-semibold text-gray-900">Case Not Found</h2>
            <p className="mb-6 text-gray-500">
              The requested patient assessment could not be found.
            </p>
            <Link
              href="/dashboard"
              className="font-medium text-indigo-600 hover:text-indigo-900"
            >
              &larr; Return to Dashboard
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-gray-500 transition-colors hover:text-gray-700"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {caseData.patientName}
                </h1>
                <p className="text-sm text-gray-500">ID: {caseData.patientId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Status:</span>
              <StatusBadge status={caseData.status} />
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Case Layout Placeholder
          </h3>
          <p className="mx-auto mb-6 max-w-md text-gray-500">
            The detailed clinical evaluation interface will be implemented here, strictly
            following the
            <code>caseview.png</code> design.
          </p>
          <div className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none">
            View Assessment Data (Coming Soon)
          </div>
        </Card>
      </main>
    </div>
  );
}
