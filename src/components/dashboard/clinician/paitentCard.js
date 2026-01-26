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
      className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:gap-4 sm:p-5 dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex flex-1 items-center gap-3 sm:gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 sm:h-14 sm:w-14 dark:bg-gray-700">
          <svg
            className="h-8 w-8 text-gray-400 sm:h-9 sm:w-9 dark:text-gray-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 sm:text-base dark:text-gray-100">
            {patient?.name}
          </h3>
          <p className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">
            {patient?.gender}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-0.5">
        <span className="text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">
          {patient?.time}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{patient?.date}</span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          href={`${url}/${patient?.id}`}
          className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-cyan-600 sm:px-6 sm:text-sm"
        >
          {buttonLabel || 'View'}
        </Link>
        <div
          className={`h-3 w-3 shrink-0 rounded-full ${getStatusColor(patient.status)}`}
        />
      </div>
    </div>
  );
}
