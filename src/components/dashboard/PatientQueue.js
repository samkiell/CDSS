'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAssignedCases, CASE_STATUS } from '@/services/api';
import StatusBadge from './StatusBadge';
import Card from '@/components/ui/Card';

export default function PatientQueue() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    async function fetchCases() {
      try {
        const data = await getAssignedCases();
        setCases(data);
      } catch (err) {
        setError('Failed to load assigned cases.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCases();
  }, []);

  const filteredCases =
    filter === 'ALL' ? cases : cases.filter((c) => c.status === filter);

  if (loading) {
    return (
      <Card className="animate-pulse p-6 text-center text-gray-500">
        Loading patient assessments...
      </Card>
    );
  }

  if (error) {
    return <Card className="p-6 text-center text-red-500">{error}</Card>;
  }

  return (
    <div className="space-y-6">
      {/* Filters (Implied by "Tabs" or "Filters" in requirements) */}
      <div className="flex space-x-2 overflow-x-auto border-b border-gray-200 pb-2">
        <FilterButton
          active={filter === 'ALL'}
          onClick={() => setFilter('ALL')}
          label="All Cases"
          count={cases.length}
        />
        <FilterButton
          active={filter === CASE_STATUS.NEW}
          onClick={() => setFilter(CASE_STATUS.NEW)}
          label="New"
          count={cases.filter((c) => c.status === CASE_STATUS.NEW).length}
        />
        <FilterButton
          active={filter === CASE_STATUS.IN_PROGRESS}
          onClick={() => setFilter(CASE_STATUS.IN_PROGRESS)}
          label="In Progress"
          count={cases.filter((c) => c.status === CASE_STATUS.IN_PROGRESS).length}
        />
        <FilterButton
          active={filter === CASE_STATUS.READY_FOR_REVIEW}
          onClick={() => setFilter(CASE_STATUS.READY_FOR_REVIEW)}
          label="Ready"
          count={cases.filter((c) => c.status === CASE_STATUS.READY_FOR_REVIEW).length}
        />
      </div>

      {/* Patient List Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Patient / ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Completeness
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Submitted
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredCases.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  No cases found with this status.
                </td>
              </tr>
            ) : (
              filteredCases.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">{c.patientName}</span>
                      <span className="text-xs text-gray-500">{c.patientId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="mr-2 h-1.5 w-16 rounded-full bg-gray-200">
                        <div
                          className={`h-1.5 rounded-full ${c.completeness === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${c.completeness}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{c.completeness}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    {new Date(c.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                    <Link
                      href={`/dashboard/case/${c.id}`}
                      className="font-semibold text-indigo-600 hover:text-indigo-900"
                    >
                      Open Case &rarr;
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-t-lg border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
          : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
      } `}
    >
      {label}
      {count !== undefined && (
        <span
          className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${active ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
