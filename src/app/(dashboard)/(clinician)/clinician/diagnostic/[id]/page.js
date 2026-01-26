'use client';
import { ArrowLeft, Play, AlertCircle, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Page() {
  const router = useRouter();
  const [selectedTest, setSelectedTest] = useState(
    'Guided Test For Lumbar Disc Hibernation'
  );

  const tests = [
    {
      id: 1,
      title: 'Leg Raise Tests',
      purpose:
        'leg raises help strengthen the core-handle muscles that support the lower back, reducing pressure and improving stability.',
      instructions: `Right bilateral anteriomnigranula (LVM)
nghnjhss jkjujkubnhughoilkhjkhjkhjgjkghjhgssbbdsss
njhnjku junh h njhbjs sgjhbj j mnhnjhmj j
ldjkml nhjns , nmn medexmonoon oqoim kiknjm
mnjkjnsi uhuu`,
    },
    {
      id: 2,
      title: 'Arm Raise Tests',
      purpose:
        'The leg raises are good for checking nerve irritation by lifting the leg while lying flat.',
      instructions: `Right bilateral anteriomnigranula (LVM)
nghnjhss jkjujkubnhughoilkhjkhjkhjgjkghjhgssbbdsss
njhnjku junh h njhbjs sgjhbj j mnhnjhmj j
ldjkml nhjns , nmn medexmonoon oqoim kiknjm
mnjkjnsi uhuu`,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-3 pb-6 sm:px-4 sm:pb-8">
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center">
        <button
          onClick={() => router.back()}
          className="shrink-0 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeft size={20} className="sm:h-6 sm:w-6" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 sm:h-12 sm:w-12 dark:bg-gray-700">
            <svg
              className="h-5 w-5 text-gray-500 sm:h-6 sm:w-6 dark:text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-gray-900 sm:text-lg dark:text-gray-100">
                Bola's Guided Test
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Test Title */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-center text-sm font-medium text-gray-700 sm:text-base dark:text-gray-300">
          {selectedTest}
        </h2>
      </div>

      {/* Test Sections */}
      <div className="space-y-4 sm:space-y-6">
        {tests.map((test) => (
          <div
            key={test.id}
            className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:rounded-xl sm:p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            {/* Test Title */}
            <div className="mb-2.5 flex items-center gap-2 sm:mb-4">
              <svg
                className="h-4 w-4 shrink-0 text-gray-600 sm:h-5 sm:w-5 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-sm font-semibold text-gray-900 sm:text-base dark:text-gray-100">
                {test.title}
              </h3>
            </div>

            {/* Purpose */}
            <div className="mb-3 sm:mb-4">
              <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">
                <span className="font-semibold">Purpose:</span> {test.purpose}
              </p>
            </div>

            {/* Instructions */}
            <div className="mb-3 sm:mb-4">
              <h4 className="mb-1.5 text-xs font-semibold text-gray-900 sm:mb-2 sm:text-sm dark:text-gray-100">
                Instructions
              </h4>
              <p className="text-xs leading-relaxed whitespace-pre-line text-gray-600 sm:text-sm dark:text-gray-400">
                {test.instructions}
              </p>
            </div>

            {/* Video Player */}
            <div className="mb-3 overflow-hidden rounded-lg bg-gray-700 sm:mb-4 dark:bg-gray-900">
              <div className="flex aspect-video items-center justify-center">
                <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-gray-900 transition-transform hover:scale-110 sm:h-16 sm:w-16 md:h-20 md:w-20">
                  <Play
                    className="ml-1 h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10"
                    fill="currentColor"
                  />
                </button>
              </div>
            </div>

            {/* Alert */}
            <div className="mb-3 flex items-start gap-2 sm:mb-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500 sm:h-5 sm:w-5" />
              <p className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">
                Follow instructions carefully, stop if you feel any pain
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <button className="rounded-lg bg-cyan-500 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-cyan-600 sm:flex-1 sm:py-2 sm:text-sm">
                Follow
              </button>
              <button className="rounded-lg bg-cyan-500 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-cyan-600 sm:flex-1 sm:py-2 sm:text-sm">
                Negative
              </button>
              <button className="rounded-lg bg-cyan-500 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-cyan-600 sm:flex-1 sm:py-2 sm:text-sm">
                Update to positive
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
