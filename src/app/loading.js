'use client';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center gap-6">
        {/* Spinner */}
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500 dark:border-gray-700 dark:border-t-blue-400"></div>

        {/* Loading text */}
        <p className="text-base font-semibold tracking-wide text-gray-800 dark:text-gray-300">
          LOADING
        </p>
      </div>
    </div>
  );
}
