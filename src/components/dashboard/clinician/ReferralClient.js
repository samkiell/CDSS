'use client';

import React, { useState, useMemo } from 'react';
import { Search, FileOutput, MapPin, Calendar, User, X, Clock } from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
  StatusModal,
} from '@/components/ui';
import { cn } from '@/lib/cn';

export default function ReferralClient({ initialPatients = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const [referralData, setReferralData] = useState({
    specialty: 'Orthopedic Surgeon',
    reason: '',
    urgency: 'Medium',
    date: '',
    time: '',
  });

  const filteredPatients = useMemo(
    () =>
      initialPatients.filter((patient) =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [initialPatients, searchQuery]
  );

  const openReferralModal = (patient) => {
    setSelectedPatient(patient);
    setReferralData({
      specialty: 'Orthopedic Surgeon',
      reason: '',
      urgency: 'Medium',
      date: '',
      time: '',
    });
    setIsReferralOpen(true);
  };

  const handleReferralSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          specialty: referralData.specialty,
          reason: referralData.reason,
          preferredDate: referralData.date,
          preferredTime: referralData.time,
        }),
      });

      if (res.ok) {
        setIsReferralOpen(false);
        setStatusModal({
          isOpen: true,
          type: 'success',
          title: 'Referral Sent',
          message: `Referral for ${selectedPatient.name} to ${referralData.specialty} has been authorized.`,
        });
      } else {
        setStatusModal({
          isOpen: true,
          type: 'error',
          title: 'Referral Failed',
          message: 'Could not create referral authorization. Please try again.',
        });
      }
    } catch (err) {
      console.error(err);
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Network Error',
        message: 'A system error occurred while processing the referral.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Enhanced Search */}
      <div className="relative max-w-2xl">
        <Search className="text-muted-foreground absolute top-1/2 left-6 h-5 w-5 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search patients for referral..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-card focus:ring-primary/20 h-16 w-full rounded-[1.5rem] border-none pr-6 pl-16 text-sm font-bold shadow-sm transition-all focus:ring-2 focus:outline-none"
        />
      </div>

      <div className="space-y-6">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <Card
              key={patient.id}
              className="group bg-card overflow-hidden rounded-[2.5rem] border-none shadow-sm transition-all duration-500 hover:shadow-xl"
            >
              <CardContent className="p-0">
                <div className="divide-border/50 flex flex-col divide-y md:flex-row md:divide-x md:divide-y-0">
                  {/* Patient Profile */}
                  <div className="flex items-center gap-6 p-8 md:w-1/3">
                    <Avatar className="ring-primary/5 group-hover:ring-primary/20 h-16 w-16 rounded-2xl ring-4 transition-all">
                      <AvatarImage src={patient.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {patient.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-foreground text-lg font-bold tracking-tight uppercase">
                        {patient.name}
                      </h3>
                      <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                        {patient.gender}
                      </p>
                    </div>
                  </div>

                  {/* Stats & Info */}
                  <div className="grid flex-1 grid-cols-2 items-center gap-6 p-8">
                    <div className="flex flex-col gap-1">
                      <div className="text-muted-foreground flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase opacity-60">
                        <Calendar className="h-3 w-3" />
                        Last Assessment
                      </div>
                      <p className="text-foreground text-sm font-bold">
                        {new Date(patient.lastActive).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="text-muted-foreground flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase opacity-60">
                        <MapPin className="h-3 w-3" />
                        Status
                      </div>
                      <Badge
                        className={cn(
                          'w-fit rounded-full border-none px-3 py-1 text-[10px] font-bold',
                          patient.status === 'urgent'
                            ? 'bg-red-500 text-white'
                            : 'bg-emerald-500 text-white'
                        )}
                      >
                        {patient.status === 'urgent' ? 'URGENT' : 'STABLE'}
                      </Badge>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="bg-muted/10 flex items-center justify-center p-8 md:w-48">
                    <Button
                      onClick={() => openReferralModal(patient)}
                      className="bg-primary h-12 w-full gap-2 rounded-xl text-[10px] font-bold tracking-widest text-white uppercase shadow-sm transition-all hover:brightness-110 active:scale-95"
                    >
                      <FileOutput className="h-4 w-4" />
                      Create
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="bg-muted text-muted-foreground flex h-20 w-20 items-center justify-center rounded-full">
              <User className="h-10 w-10 opacity-20" />
            </div>
            <p className="text-muted-foreground/30 text-xl font-bold tracking-tight uppercase">
              No patients found
            </p>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="flex flex-col items-center gap-8 rounded-[2.5rem] border border-white/10 bg-[#0f172a] p-8 text-white shadow-2xl md:flex-row">
        <div className="bg-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
          <MapPin className="h-7 w-7" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="mb-1 text-lg font-bold tracking-tight uppercase">
            External Facility Network
          </h4>
          <p className="text-sm font-medium text-gray-400">
            Connect patients with verified radiology centers and orthopaedic specialists
            across our partner network.
          </p>
        </div>
        <Button
          variant="outline"
          className="h-14 rounded-2xl border-white/10 px-8 text-[10px] font-bold tracking-widest text-white uppercase hover:bg-white/5"
        >
          Manage Facilities
        </Button>
      </div>

      {/* Referral Modal */}
      {isReferralOpen && selectedPatient && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <Card className="animate-in zoom-in-95 dark:bg-card w-full max-w-md border-none bg-white p-8 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-foreground text-2xl font-black tracking-tight uppercase">
                  Refer Patient
                </h3>
                <p className="text-muted-foreground mt-2 text-xs font-bold tracking-widest uppercase">
                  For {selectedPatient.name}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsReferralOpen(false)}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleReferralSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <label className="text-muted-foreground text-[10px] font-black tracking-[0.2em] uppercase">
                  Target Specialty
                </label>
                <select
                  className="border-input bg-background focus:ring-primary/20 h-12 w-full rounded-xl border px-4 text-sm font-bold outline-none focus:ring-2"
                  value={referralData.specialty}
                  onChange={(e) =>
                    setReferralData({ ...referralData, specialty: e.target.value })
                  }
                >
                  <option>Orthopedic Surgeon</option>
                  <option>Radiology (MRI/X-Ray)</option>
                  <option>Neurologist</option>
                  <option>Sports Physician</option>
                  <option>Pain Management Specialist</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-muted-foreground text-[10px] font-black tracking-[0.2em] uppercase">
                  Clinical Reason
                </label>
                <textarea
                  className="border-input bg-background focus:ring-primary/20 h-32 w-full resize-none rounded-xl border p-4 text-sm font-medium outline-none focus:ring-2"
                  placeholder="Describe the clinical reason for this referral..."
                  value={referralData.reason}
                  onChange={(e) =>
                    setReferralData({ ...referralData, reason: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-muted-foreground text-[10px] font-black tracking-[0.2em] uppercase">
                    Urgency
                  </label>
                  <select
                    className="border-input bg-background focus:ring-primary/20 h-12 w-full rounded-xl border px-4 text-sm font-bold outline-none focus:ring-2"
                    value={referralData.urgency}
                    onChange={(e) =>
                      setReferralData({ ...referralData, urgency: e.target.value })
                    }
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-muted-foreground text-[10px] font-black tracking-[0.2em] uppercase">
                    Pref. Date
                  </label>
                  <input
                    type="date"
                    className="border-input bg-background focus:ring-primary/20 h-12 w-full rounded-xl border px-4 text-sm font-bold outline-none focus:ring-2"
                    value={referralData.date}
                    onChange={(e) =>
                      setReferralData({ ...referralData, date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsReferralOpen(false)}
                  className="h-14 flex-1 rounded-2xl font-bold tracking-wider uppercase"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary shadow-primary/20 h-14 flex-1 rounded-2xl font-bold tracking-wider text-white uppercase shadow-lg"
                >
                  {isSubmitting ? 'Processing...' : 'Authorize Referral'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Status Modal for Feedback */}
      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
      />
    </div>
  );
}
