'use client';

import { 
  upgradeUserRole, 
} from '@/actions/admin';
import { toast } from 'sonner';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function TriageQueue({ cases }) {
  if (!cases || cases.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-gray-100 p-12 text-center dark:border-gray-800">
        <p className="text-gray-400 font-medium">No pending cases in the queue.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {cases.map((item) => (
        <div 
          key={item._id} 
          className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
        >
          {/* Status Badge */}
          <div className="absolute right-4 top-4">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
              item.aiAnalysis?.riskLevel === 'Urgent' 
                ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
            }`}>
              <span className={`h-2 w-2 rounded-full ${
                item.aiAnalysis?.riskLevel === 'Urgent' ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
              }`}></span>
              {item.aiAnalysis?.riskLevel}
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
              <p className="text-sm font-medium text-gray-400">{item.patientId?.gender || 'N/A'} • MSK Case</p>
            </div>
          </div>

          <div className="mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 font-medium">Body Region:</span>
              <span className="font-bold text-gray-700 dark:text-gray-300 capitalize">{item.bodyRegion}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 font-medium">AI Confidence:</span>
              <span className="font-bold text-gray-700 dark:text-gray-300">{item.aiAnalysis?.confidenceScore}%</span>
            </div>
          </div>

          <Link 
            href={`/admin/sessions?id=${item._id}`}
            className="flex w-full items-center justify-center rounded-2xl bg-gray-50 py-3 text-sm font-bold text-gray-900 transition-colors hover:bg-primary hover:text-white dark:bg-gray-800 dark:text-white dark:hover:bg-primary"
          >
            Details
          </Link>
        </div>
      ))}
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
      <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-gray-400">{title}</h4>
      <div className="space-y-4">
        {therapists.map((user) => (
          <div key={user._id} className="flex items-center justify-between rounded-2xl border border-gray-50 p-4 transition-all hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                {user.avatar ? (
                  <Image src={user.avatar} alt="User" fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-bold text-gray-400">
                    {user.firstName[0]}
                  </div>
                )}
                <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 ${
                  type === 'approved' ? 'bg-green-500' : 'bg-yellow-500'
                }`}></span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-400 font-medium">{user.email}</p>
              </div>
            </div>
            
            {type === 'pending' ? (
              <button 
                onClick={() => handleApprove(user._id)}
                disabled={loadingId === user._id}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-lg shadow-primary/20 transition-transform active:scale-95 disabled:opacity-50"
              >
                {loadingId === user._id ? 'Processing...' : 'Approve'}
              </button>
            ) : (
              <button className="rounded-xl border border-gray-100 bg-white px-4 py-2 text-xs font-bold text-gray-900 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white">
                View Profile
              </button>
            )}
          </div>
        ))}
        {therapists.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-4">No users found.</p>
        )}
      </div>
    </div>
  );
}
