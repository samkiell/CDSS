import React from 'react';

const STATUS_CONFIG = {
  NEW: {
    label: 'New',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  AWAITING_INPUT: {
    label: 'Awaiting Input',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  READY_FOR_REVIEW: {
    label: 'Ready for Review',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
