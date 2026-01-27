'use client';
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner container */}
        <div className="relative h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-500 dark:border-cyan-900 dark:border-t-cyan-400"></div>

          {/* Middle rotating ring (slower) */}
          <div
            className="absolute inset-2 rounded-full border-4 border-cyan-100 border-r-cyan-400 dark:border-cyan-950 dark:border-r-cyan-300"
            style={{ animation: 'spin 3s linear infinite reverse' }}
          ></div>

          {/* Logo in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Loading"
              className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16"
            />
          </div>
        </div>

        {/* Loading text */}
        <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">
          Loading...
        </p>

        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(360deg);
            }
            to {
              transform: rotate(0deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
