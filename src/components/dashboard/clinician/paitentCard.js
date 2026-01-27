import Link from 'next/link';
export default function PaitentInfoCard({ patient, url, buttonLabel }) {
  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-500',
      pending: 'bg-yellow-400',
      urgent: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };
  return (
    <div
      key={patient?.id}
      className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:gap-4 sm:rounded-xl sm:p-5 dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 sm:h-12 sm:w-12 md:h-14 md:w-14 dark:bg-gray-700">
          <svg
            className="h-6 w-6 text-gray-400 sm:h-8 sm:w-8 md:h-9 md:w-9 dark:text-gray-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-xs font-semibold text-gray-900 sm:text-sm md:text-base dark:text-gray-100">
            {patient?.name}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">{patient?.gender}</p>
        </div>
      </div>

      <div className="hidden flex-col items-end gap-0.5 sm:flex">
        <span className="text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">
          {patient?.time}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{patient?.date}</span>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Link
          href={`${url}/${patient?.id}`}
          className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-cyan-600 sm:px-4 sm:py-2 md:px-6 md:text-sm"
        >
          {buttonLabel || 'View'}
        </Link>
        <div
          className={`h-2.5 w-2.5 shrink-0 rounded-full sm:h-3 sm:w-3 ${getStatusColor(patient.status)}`}
        />
      </div>
    </div>
  );
}
