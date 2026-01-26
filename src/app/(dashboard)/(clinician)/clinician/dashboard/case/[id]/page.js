import { Card, CardContent } from '@/components/ui';
import { Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CaseDetailsPage({ params }) {
  const { id } = params;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/clinician/dashboard"
              className="text-gray-500 transition-colors hover:text-gray-700"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Case ID: {id}</h1>
          </div>
        </div>
      </div>

      <main className="flex min-h-[60vh] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Construction className="text-muted-foreground mb-4 h-12 w-12" />
            <h2 className="text-foreground text-lg font-semibold">Case Evaluation</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              This case evaluation view is not implemented yet.
              <br />
              Waiting for assigned developer.
            </p>
            <Link
              href="/clinician/dashboard"
              className="mt-6 font-medium text-indigo-600 hover:text-indigo-900"
            >
              &larr; Return to Dashboard
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
