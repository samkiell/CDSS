'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  ClipboardList,
  CheckCircle2,
  FileText,
  PlusCircle,
  Calendar,
  Info,
  Download,
  Eye,
  FileIcon,
  X,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button, Card, Badge } from '@/components/ui';

export default function CaseDetailsPage({ params }) {
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    type: 'Physiotherapy Session',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCaseDetails();
    }
  }, [id]);

  useEffect(() => {
    if (isDocsOpen && session?.patientId?._id) {
      fetchDocuments();
    }
  }, [isDocsOpen, session]);

  const fetchCaseDetails = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/diagnosis/${id}`);
      const result = await res.json();
      if (result.success) {
        setSession(result.data);
      }
    } catch (err) {
      console.error('Error fetching case details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocuments = async () => {
    if (!session?.patientId?._id) return;
    setIsLoadingDocs(true);
    try {
      const res = await fetch(`/api/documents?patientId=${session.patientId._id}`);
      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: session.patientId._id,
          ...bookingData,
        }),
      });

      if (res.ok) {
        alert('Appointment scheduled successfully!');
        setIsBookingOpen(false);
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      alert('Failed to schedule appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2" />
        <p className="text-muted-foreground font-bold">Synchronizing Case Data...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-foreground flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <AlertCircle className="text-destructive h-16 w-16 opacity-50" />
        <h2 className="text-2xl font-black">Case File Not Found</h2>
        <p className="text-muted-foreground max-w-md font-medium">
          The session you are looking for does not exist or has been archived.
        </p>
        <Link href="/clinician/dashboard">
          <Button variant="outline" className="mt-4 rounded-xl border-2 font-bold">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const patient = session.patientId;
  const analysis = session.aiAnalysis;

  return (
    <div className="animate-fade-in text-foreground mx-auto max-w-5xl space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/clinician/dashboard"
            className="bg-card border-border hover:bg-accent rounded-full border p-2 shadow-sm transition-all"
          >
            <ArrowLeft className="text-muted-foreground h-6 w-6" />
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight">
              {patient?.firstName
                ? `${patient.firstName}'s Case File`
                : 'Patient Case File'}
            </h1>
            <div
              className={cn(
                'ml-2 h-3 w-3 animate-pulse rounded-full',
                analysis?.riskLevel === 'Urgent'
                  ? 'bg-destructive'
                  : analysis?.riskLevel === 'Moderate'
                    ? 'bg-warning'
                    : 'bg-success'
              )}
            />
            <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              {analysis?.riskLevel || 'Low'} Risk
            </span>
          </div>
        </div>
      </div>

      {/* Patient Header Card */}
      <Card className="border-border bg-card flex items-center gap-8 rounded-[2.5rem] p-8 shadow-sm">
        <div className="bg-primary/10 text-primary border-primary/20 relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border text-2xl font-black shadow-inner">
          {patient?.avatar ? (
            <img
              src={patient.avatar}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            patient?.firstName?.[0] || 'P'
          )}
        </div>
        <div className="grid flex-1 grid-cols-2 gap-6 lg:grid-cols-4">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              Name
            </span>
            <span className="text-foreground truncate text-base font-black">
              {patient?.firstName} {patient?.lastName}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              Sex
            </span>
            <span className="text-foreground text-base font-black capitalize">
              {patient?.gender || 'Not specified'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              Age
            </span>
            <span className="text-foreground text-base font-black">
              {calculateAge(patient?.dateOfBirth)} yrs
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-right text-xs font-bold tracking-wider uppercase">
              Assigned
            </span>
            <span className="text-foreground text-right text-xs font-bold">
              {new Date(session.createdAt).toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </Card>

      {/* AI Reasoning / Assessment Summary */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black">AI Assessment Summary</h2>
          <span className="text-muted-foreground text-xs font-bold uppercase opacity-70">
            {new Date(session.createdAt).toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'LONG',
              year: 'numeric',
            })}
          </span>
        </div>
        <Card className="border-border bg-card text-muted-foreground rounded-[2.5rem] p-10 text-sm leading-relaxed">
          <div className="space-y-4">
            <p className="text-foreground text-base font-medium">
              Findings for {session.bodyRegion} Assessment:
            </p>
            <ul className="mt-2 ml-5 list-disc space-y-3">
              {analysis?.reasoning?.map((point, idx) => (
                <li key={idx} className="pl-2">
                  {point}
                </li>
              ))}
            </ul>
            {!analysis?.reasoning?.length && (
              <p className="italic">
                AI reasoning details are currently unavailable for this session.
              </p>
            )}

            <div className="border-border mt-6 border-t pt-4">
              <strong className="text-foreground text-[10px] tracking-widest uppercase">
                Diagnosis Reasoning
              </strong>
              <p className="mt-2 text-sm italic">
                Based on machine learning models analyzing clinical heuristic MSK
                patterns. This is a provisional diagnosis pending human physical
                examination.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Metrics Row 1 */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card className="border-border bg-card flex min-h-[220px] flex-col justify-center rounded-[2.5rem] p-10">
          <span className="text-muted-foreground decoration-border text-xs font-bold uppercase underline underline-offset-8">
            Temporary Diagnosis
          </span>
          <h3 className="mt-8 text-4xl leading-tight font-black tracking-tight">
            {analysis?.temporalDiagnosis || 'N/A'}
          </h3>
        </Card>
        <Card className="border-border bg-card flex items-center justify-around gap-8 rounded-[2.5rem] p-10">
          <div className="relative h-28 w-28">
            <svg viewBox="0 0 36 36" className="h-full w-full">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                className="stroke-muted-foreground/10"
                strokeWidth="3.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                className={cn(
                  'stroke-current transition-all duration-1000 ease-out',
                  (analysis?.confidenceScore || 0) > 80
                    ? 'text-success'
                    : (analysis?.confidenceScore || 0) > 50
                      ? 'text-warning'
                      : 'text-destructive'
                )}
                strokeWidth="3.5"
                strokeDasharray={`${analysis?.confidenceScore || 0}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-black">
                {analysis?.confidenceScore || 0}%
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-5xl font-black tracking-tighter italic">
              {analysis?.confidenceScore || 0}%
            </span>
            <span className="text-muted-foreground mt-1 text-xs font-bold uppercase">
              Confidence Rate
            </span>
          </div>
        </Card>
      </div>

      {/* Metrics Row 2 - Dynamic stats if available */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card className="border-border bg-card flex flex-col items-center justify-center rounded-[2.5rem] p-10 text-center">
          <div className="mb-2 flex items-center gap-3">
            <div className="bg-primary h-2 w-2 rounded-full" />
            <span className="text-xs font-bold tracking-widest uppercase opacity-60">
              Status
            </span>
          </div>
          <div className="border-border mt-2 w-full border-t pt-6">
            <span className="text-5xl font-black tracking-tight uppercase">
              {session.status === 'pending_review' ? 'NEW' : session.status}
            </span>
            <p className="text-muted-foreground mt-3 text-xs font-bold tracking-widest uppercase">
              Session Priority
            </p>
          </div>
        </Card>
        <Card className="border-border bg-card flex flex-col items-center justify-center rounded-[2.5rem] p-10 text-center">
          <div className="mb-2 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-indigo-500" />
            <span className="text-xs font-bold tracking-widest uppercase opacity-60">
              Region
            </span>
          </div>
          <div className="border-border mt-2 w-full border-t pt-6">
            <span className="text-5xl font-black tracking-tight uppercase">
              {session.bodyRegion?.slice(0, 3)}
            </span>
            <p className="text-muted-foreground mt-3 text-xs font-bold tracking-widest uppercase">
              Target Area
            </p>
          </div>
        </Card>
      </div>

      {/* Reports Section */}
      <div className="space-y-6 pt-4">
        <h2 className="px-2 text-xl font-black tracking-wide uppercase">
          Reports & Actions
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ReportCard
            color="bg-primary shadow-primary/20"
            icon={<ClipboardList />}
            title="Schedules"
            desc="Book the next clinical session for this patient."
            onClick={() => setIsBookingOpen(true)}
            actionText="Schedule Session"
          />
          <ReportCard
            color="bg-indigo-500 shadow-indigo-500/20"
            icon={<CheckCircle2 />}
            title="Analysis"
            desc="Review the granular heuristic patterns detected via MSK logic."
            actionText="Review Patterns"
          />
          <ReportCard
            color="bg-emerald-500 shadow-emerald-500/20"
            icon={<FileText />}
            title="Clinical Files"
            desc="Access radiological images, lab results and previous prescriptions."
            actionText="Browse Files"
            onClick={() => setIsDocsOpen(true)}
          />

          <div className="bg-border col-span-full my-6 h-[1px] opacity-50" />

          <ReportCard
            color="bg-[#7c4d7c] shadow-[#7c4d7c]/20"
            icon={<PlusCircle />}
            title="Treatment Plan"
            desc="Construct a personalized recovery roadmap and exercise regimen."
            actionText="Generate Plan"
          />
          <ReportCard
            color="bg-warning shadow-warning/20 bg-opacity-90"
            icon={<Calendar />}
            title="Clinical Notes"
            desc="Add specific observational notes and clinician impressions."
            actionText="Add Notes"
          />
          <ReportCard
            color="bg-foreground text-background shadow-foreground/20"
            icon={<Info />}
            title="Referral Plan"
            desc="Authorize secondary referrals or medical investigations."
            actionText="Refer Patient"
          />
        </div>
      </div>

      {/* Final Action */}
      <div className="flex justify-center pt-10">
        <Button className="h-16 rounded-2xl border-none bg-[#3da9f5] px-20 text-sm font-black tracking-widest text-white uppercase shadow-lg transition-transform hover:scale-105 hover:bg-[#2c91db] active:scale-95">
          Complete Documentation
        </Button>
      </div>

      {/* Booking Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <Card className="animate-scale-up w-full max-w-md border-none p-6 shadow-2xl">
            <h3 className="text-xl font-black">Schedule Appointment</h3>
            <p className="text-muted-foreground mt-2 text-xs font-medium">
              Select a date and time for{' '}
              {patient ? `${patient.firstName} ${patient.lastName}` : 'this patient'}
            </p>

            <form onSubmit={handleBook} className="mt-6 space-y-4">
              <div>
                <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  Date
                </label>
                <input
                  type="date"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold dark:border-slate-800 dark:bg-slate-900"
                  value={bookingData.date}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, date: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  Time
                </label>
                <input
                  type="time"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold dark:border-slate-800 dark:bg-slate-900"
                  value={bookingData.time}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, time: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  Session Type
                </label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold dark:border-slate-800 dark:bg-slate-900"
                  value={bookingData.type}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, type: e.target.value })
                  }
                >
                  <option>Physiotherapy Session</option>
                  <option>Consultation</option>
                  <option>Check-up</option>
                  <option>Follow-up</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsBookingOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Scheduling...' : 'Confirm'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Documents Modal */}
      {isDocsOpen && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <Card className="animate-scale-up flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden border-none shadow-2xl">
            <div className="flex items-center justify-between border-b p-6">
              <div>
                <h3 className="text-xl font-black">Patient Documents</h3>
                <p className="text-muted-foreground text-xs font-medium">
                  Viewing clinical files for{' '}
                  {patient ? `${patient.firstName} ${patient.lastName}` : 'this patient'}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsDocsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingDocs ? (
                <div className="flex h-40 flex-col items-center justify-center gap-3">
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
                  <p className="text-muted-foreground text-sm font-bold">
                    Fetching files...
                  </p>
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc._id}
                      className="hover:border-primary/50 group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all dark:border-slate-800 dark:bg-slate-900/40"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-primary flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-800">
                          <FileIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                          <span className="max-w-[200px] truncate text-sm font-black">
                            {doc.fileName}
                          </span>
                          <div className="mt-0.5 flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="h-4 px-1 text-[8px] font-black uppercase"
                            >
                              {doc.category}
                            </Badge>
                            <span className="text-muted-foreground text-[10px] font-bold">
                              {formatFileSize(doc.fileSize)} •{' '}
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="group-hover:bg-primary/10 group-hover:text-primary h-8 w-8 rounded-full p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </a>
                        <a href={doc.fileUrl} download={doc.fileName}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="group-hover:bg-primary/10 group-hover:text-primary h-8 w-8 rounded-full p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <FileText className="mb-2 h-10 w-10 text-slate-300" />
                  <p className="text-sm font-bold text-slate-500">
                    No documents found for this patient.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t bg-slate-50/50 p-6 dark:bg-slate-900/20">
              <Button
                className="h-12 w-full rounded-xl font-black"
                onClick={() => setIsDocsOpen(false)}
              >
                Close Viewer
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function ReportCard({ color, icon, title, desc, actionText = 'Book Now', onClick }) {
  return (
    <div
      className={cn(
        'flex min-h-[190px] flex-col justify-between rounded-[2rem] p-7 text-white shadow-md transition-all hover:-translate-y-1 hover:brightness-110',
        color
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {React.cloneElement(icon, { className: 'h-5 w-5' })}
          <span className="text-[12px] leading-none font-black tracking-widest uppercase opacity-80">
            {title}
          </span>
        </div>
        <p className="line-clamp-3 text-[11px] leading-relaxed font-bold opacity-90">
          {desc}
        </p>
      </div>
      <button
        onClick={onClick}
        className="mt-4 rounded-xl bg-white py-2.5 text-[10px] font-black text-gray-900 uppercase shadow-sm transition-all hover:bg-gray-100 active:scale-95"
      >
        {actionText}
      </button>
    </div>
  );
}
