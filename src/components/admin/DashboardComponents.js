'use client';

import { upgradeUserRole } from '@/actions/admin';
import { toast } from 'sonner';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function TriageQueue({ cases }) {
  if (!cases || cases.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-gray-100 p-12 text-center dark:border-gray-800">
        <p className="font-medium text-gray-400">No pending cases in the queue.</p>
      </div>
    );
  }

  // Helper to get status display info
  const getStatusInfo = (status) => {
    switch (status) {
      case 'submitted_to_therapist':
        return { label: 'New Assessment', color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400', dot: 'bg-green-500 animate-pulse' };
      case 'pending_review':
        return { label: 'Pending Review', color: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400', dot: 'bg-yellow-500' };
      case 'assigned':
        return { label: 'Assigned', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400', dot: 'bg-blue-500' };
      default:
        return { label: status || 'Unknown', color: 'bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400', dot: 'bg-gray-500' };
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {cases.map((item) => {
        const statusInfo = getStatusInfo(item.status);
        const isUrgent = item.aiAnalysis?.riskLevel === 'Urgent';
        
        return (
          <div
            key={item._id}
            className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
          >
            {/* Status & Risk Badges */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {/* New Assessment Badge */}
              {item.status === 'submitted_to_therapist' && (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase ${statusInfo.color}`}>
                  <span className={`h-2 w-2 rounded-full ${statusInfo.dot}`}></span>
                  NEW
                </span>
              )}
              {/* Risk Level Badge */}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase ${
                  isUrgent
                    ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    : item.aiAnalysis?.riskLevel === 'Moderate'
                      ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                      : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isUrgent
                      ? 'animate-pulse bg-red-500'
                      : item.aiAnalysis?.riskLevel === 'Moderate'
                        ? 'bg-orange-500'
                        : 'bg-blue-500'
                  }`}
                ></span>
                {item.aiAnalysis?.riskLevel || 'Low'}
              </span>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <div className="h-14 w-14 overflow-hidden rounded-2xl border-2 border-gray-50 shadow-sm dark:border-gray-800">
                {item.patientId?.avatar ? (
                  <Image
                    src={item.patientId.avatar}
                    alt="Patient"
                    width={56}
                    height={56}
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100 text-lg font-black text-gray-400 dark:bg-gray-800">
                    {item.patientId?.firstName?.[0] || 'P'}
                  </div>
                )}
              </div>
              <div>
                <h5 className="font-bold text-gray-900 dark:text-white">
                  {item.patientId?.firstName} {item.patientId?.lastName}
                </h5>
                <p className="text-sm font-medium text-gray-400">
                  {item.patientId?.gender || 'N/A'} • {item.patientId?.email || 'MSK Case'}
                </p>
              </div>
            </div>

            <div className="mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-400">Body Region:</span>
                <span className="font-bold text-gray-700 capitalize dark:text-gray-300">
                  {item.bodyRegion || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-400">AI Confidence:</span>
                <span className="font-bold text-gray-700 dark:text-gray-300">
                  {item.aiAnalysis?.confidenceScore || 0}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-400">Submitted:</span>
                <span className="font-bold text-gray-700 dark:text-gray-300">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            <Link
              href={`/admin/sessions?id=${item._id}`}
              className="hover:bg-primary dark:hover:bg-primary flex w-full items-center justify-center rounded-2xl bg-gray-50 py-3 text-sm font-bold text-gray-900 transition-colors hover:text-white dark:bg-gray-800 dark:text-white"
            >
              Assign to Clinician
            </Link>
          </div>
        );
      })}
    </div>
  );
}

export function TherapistManagement({ title, therapists, type }) {
  const [loadingId, setLoadingId] = useState(null);

  const handleApprove = async (userId) => {
    setLoadingId(userId);
    const result = await upgradeUserRole(userId);
    if (result.success) {
      toast.success('User upgraded to Clinician!');
    } else {
      toast.error('Failed to upgrade user.');
    }
    setLoadingId(null);
  };

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h4 className="mb-6 text-sm font-bold tracking-widest text-gray-400 uppercase">
        {title}
      </h4>
      <div className="space-y-4">
        {therapists.map((user) => (
          <div
            key={user._id}
            className="flex items-center justify-between rounded-2xl border border-gray-50 p-4 transition-all hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
          >
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                {user.avatar ? (
                  <Image src={user.avatar} alt="User" fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-bold text-gray-400">
                    {user.firstName?.[0]}
                  </div>
                )}
                <span
                  className={`absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 ${
                    type === 'approved' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                ></span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs font-medium text-gray-400">{user.email}</p>
              </div>
            </div>
          </div>
        ))}
        {therapists.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-400">No users found.</p>
        )}
      </div>
    </div>
  );
}
