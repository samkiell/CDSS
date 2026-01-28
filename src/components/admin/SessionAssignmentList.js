'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  User as UserIcon,
  Stethoscope,
  ChevronRight,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { assignCase } from '@/actions/admin';
import { toast } from 'sonner';

export function SessionAssignmentList({ sessions, clinicians, initialSelectedId }) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(initialSelectedId || null);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAssign = async (clinicianId) => {
    if (!selectedSessionId) return;

    setAssignmentLoading(true);
    const result = await assignCase(selectedSessionId, clinicianId);
    if (result.success) {
      toast.success('Case assigned successfully!');
      setSelectedSessionId(null);
    } else {
      toast.error('Failed to assign case.');
    }
    setAssignmentLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'assigned':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const filteredClinicians = clinicians.filter((c) => {
    const search = searchTerm.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(search) ||
      c.lastName.toLowerCase().includes(search) ||
      (c.specialization && c.specialization.toLowerCase().includes(search))
    );
  });

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* Sessions List */}
      <div className="flex-1 space-y-4">
        {sessions.map((session) => (
          <div
            key={session._id}
            className={`group relative overflow-hidden rounded-[2rem] border-2 p-6 transition-all duration-300 ${
              selectedSessionId === session._id
                ? 'border-primary bg-primary/5 shadow-xl'
                : 'border-transparent bg-white shadow-sm hover:border-gray-200 dark:bg-gray-900'
            }`}
          >
            <div className="flex items-center justify-between gap-6">
              {/* Clinician Side (Left) */}
              <div className="flex flex-1 items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
                  {session.clinicianId?.avatar ? (
                    <Image
                      src={session.clinicianId.avatar}
                      alt="Clinician"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-500 dark:bg-blue-900/20">
                      <Stethoscope className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                    Assigned Clinician
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {session.clinicianId
                      ? `Dr. ${session.clinicianId.lastName}`
                      : 'Unassigned'}
                  </p>
                  {session.clinicianId && (
                    <p className="text-xs font-medium text-gray-400">
                      {session.clinicianId.specialization || 'General Practice'}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 dark:bg-gray-800">
                <ArrowRight className="h-5 w-5" />
              </div>

              {/* Patient Side (Right) */}
              <div className="flex flex-1 items-center justify-end gap-4 text-right">
                <div>
                  <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                    Patient Case
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {session.patientId?.firstName} {session.patientId?.lastName}
                  </p>
                  <p className="text-xs font-medium text-gray-400">
                    ID: ...{session._id.toString().slice(-6)}
                  </p>
                </div>
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
                  {session.patientId?.avatar ? (
                    <Image
                      src={session.patientId.avatar}
                      alt="Patient"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400 dark:bg-gray-800">
                      <UserIcon className="h-8 w-8" />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="ml-4">
                <button
                  onClick={() => setSelectedSessionId(session._id)}
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all ${
                    selectedSessionId === session._id
                      ? 'bg-primary scale-110 text-white shadow-lg'
                      : 'hover:bg-primary bg-gray-50 text-gray-400 hover:text-white dark:bg-gray-800'
                  }`}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Status Footer */}
            <div
              className={`mt-4 flex items-center gap-2 border-t pt-4 text-xs font-bold tracking-widest uppercase ${
                selectedSessionId === session._id
                  ? 'border-primary/20'
                  : 'border-gray-50 dark:border-gray-800'
              }`}
            >
              {getStatusIcon(session.status)}
              <span
                className={
                  session.status === 'completed'
                    ? 'text-green-500'
                    : session.status === 'assigned'
                      ? 'text-blue-500'
                      : 'text-yellow-500'
                }
              >
                {session.status.replace('_', ' ')}
              </span>
              <span className="mx-2 h-1 w-1 rounded-full bg-gray-300"></span>
              <span className="text-gray-400">
                Created: {new Date(session.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Assignment Panel (Fixed on Right if selected) */}
      <div className="w-full lg:w-96">
        <div
          className={`sticky top-28 space-y-6 rounded-[2.5rem] bg-white p-8 shadow-2xl transition-all duration-500 dark:bg-gray-900 ${
            selectedSessionId
              ? 'translate-x-0 opacity-100'
              : 'pointer-events-none translate-x-12 opacity-50 grayscale'
          }`}
        >
          <div className="mb-4">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              Assign Clinician
            </h3>
            <p className="text-sm font-medium text-gray-400">
              Select the best match for this case
            </p>
          </div>

          <div className="relative">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter clinicians..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:border-primary/20 h-12 w-full rounded-2xl border border-transparent bg-gray-50 pr-4 pl-12 text-sm outline-none dark:bg-gray-800"
            />
          </div>

          <div className="custom-scrollbar max-h-[500px] space-y-3 overflow-y-auto pr-2">
            {filteredClinicians.map((clinician) => (
              <button
                key={clinician._id}
                onClick={() => handleAssign(clinician._id)}
                disabled={assignmentLoading}
                className="hover:bg-primary/5 hover:border-primary/20 group flex w-full items-center gap-4 rounded-3xl border border-gray-50 p-4 transition-all dark:border-gray-800 dark:hover:bg-gray-800"
              >
                <div className="h-12 w-12 overflow-hidden rounded-xl bg-gray-100">
                  {clinician.avatar ? (
                    <Image
                      src={clinician.avatar}
                      alt="Avatar"
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-bold text-gray-400">
                      {clinician.firstName[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Dr. {clinician.lastName}
                  </p>
                  <p className="text-xs font-medium text-gray-400">
                    {clinician.specialization || 'GP'}
                  </p>
                </div>
                <div className="group-hover:bg-primary flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 transition-colors group-hover:text-white dark:bg-gray-800">
                  <Plus className="h-4 w-4" />
                </div>
              </button>
            ))}
            {filteredClinicians.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-400">
                No clinicians matching search.
              </p>
            )}
          </div>

          {selectedSessionId && (
            <button
              onClick={() => setSelectedSessionId(null)}
              className="w-full py-4 text-sm font-bold text-gray-400 transition-colors hover:text-gray-600"
            >
              Cancel Assignment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
