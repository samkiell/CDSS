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
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button, Card, Badge } from '@/components/ui';

export default function CaseDetailsPage({ params }) {
  const { id } = params;
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

  useEffect(() => {
    if (isDocsOpen) {
      fetchDocuments();
    }
  }, [isDocsOpen]);

  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      // id is patientId linked from PatientQueue
      const res = await fetch(
        `/api/documents?patientId=${id === '1' ? '69756da7494dd880c45762b4' : id}`
      );
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
          patientId: id === '1' ? '69756da7494dd880c45762b4' : id,
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
            <h1 className="text-2xl font-black tracking-tight">David's Case File</h1>
            <div className="bg-destructive ml-2 h-3 w-3 animate-pulse rounded-full" />
            <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              Urgent
            </span>
          </div>
        </div>
      </div>

      {/* Patient Header Card */}
      <Card className="border-border bg-card flex items-center gap-8 rounded-[2.5rem] p-8 shadow-sm">
        <div className="bg-primary/10 text-primary border-primary/20 flex h-20 w-20 items-center justify-center rounded-full border text-2xl font-black shadow-inner">
          B
        </div>
        <div className="grid flex-1 grid-cols-2 gap-6 lg:grid-cols-4">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              Name
            </span>
            <span className="text-foreground text-base font-black">
              Bola Ahmed Tinubu
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              Sex
            </span>
            <span className="text-foreground text-base font-black">Male</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              Age
            </span>
            <span className="text-foreground text-base font-black">56 yrs</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-right text-xs font-bold tracking-wider uppercase">
              Pattern
            </span>
            <span className="text-foreground text-right text-xs font-bold">
              12-11-2025
            </span>
          </div>
        </div>
      </Card>

      {/* Assessment Summary */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black">Assessment Summary</h2>
          <span className="text-muted-foreground text-xs font-bold uppercase opacity-70">
            12 NOVEMBER, 2025
          </span>
        </div>
        <Card className="border-border bg-card text-muted-foreground rounded-[2.5rem] p-10 text-sm leading-relaxed">
          <div className="space-y-4">
            <p>
              Based on the completed lumbar assessment test, the patient demonstrates
              signs consistent with mechanical low back pain. Movement patterns indicate
              reduced flexibility and mild-to-moderate functional limitation. Pain was
              reproduced during specific lumbar motions, suggesting involvement of
              musculoskeletal structures such as lumbar extensors, facet joints, or
              surrounding soft tissues.
            </p>

            <div className="pt-2">
              <strong className="text-foreground">Key Findings:</strong>
              <ul className="mt-2 ml-5 list-disc space-y-1">
                <li>
                  Pain Triggered By: Forward bending, prolonged sitting, lifting, and
                  twisting.
                </li>
                <li>Pain Relieved By: Rest, lying supine, light stretching.</li>
                <li>
                  Range of Motion: Mild restriction in lumbar flexion and extension.
                </li>
                <li>
                  Strength Observations: Slight weakness in core stabilizers and lower
                  back muscles.
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <strong className="text-foreground">Functional Impact:</strong>
              <p className="mt-1">
                The lumbar discomfort affects daily activities such as bending, sitting
                for long periods, standing up from a seated position, and performing
                lifting tasks.
              </p>
            </div>

            <div className="pt-2">
              <strong className="text-foreground">Overall Assessment:</strong>
              <p className="mt-1">
                The findings suggest a non-specific lumbar strain or mechanical
                dysfunction, likely due to muscle imbalance, poor posture habits, or
                movement-related stress. Condition appears manageable with guided
                physiotherapy interventions.
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
          <h3 className="mt-8 text-4xl font-black tracking-tight">
            Lumbar Disc Herniation
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
                className="stroke-warning"
                strokeWidth="3.5"
                strokeDasharray="84, 100"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Empty in screenshot, but usually 84% goes here. In Image 1 it's next to it. */}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-5xl font-black tracking-tighter italic">84%</span>
            <span className="text-muted-foreground mt-1 text-xs font-bold uppercase">
              Confidence Rate
            </span>
          </div>
        </Card>
      </div>

      {/* Metrics Row 2 */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card className="border-border bg-card flex flex-col items-center justify-center rounded-[2.5rem] p-10 text-center">
          <span className="text-primary/40 mb-2 text-6xl leading-none font-light">C</span>
          <div className="border-border mt-2 w-full border-t pt-6">
            <span className="text-5xl font-black tracking-tight">7/10</span>
            <p className="text-muted-foreground mt-3 text-xs font-bold tracking-widest uppercase">
              VAS Scale
            </p>
          </div>
        </Card>
        <Card className="border-border bg-card flex flex-col items-center justify-center rounded-[2.5rem] p-10 text-center">
          <span className="text-success/40 mb-2 text-6xl leading-none font-light">C</span>
          <div className="border-border mt-2 w-full border-t pt-6">
            <span className="text-5xl font-black tracking-tight">4/5</span>
            <p className="text-muted-foreground mt-3 text-xs font-bold tracking-widest uppercase">
              Oxford Motor Grade
            </p>
          </div>
        </Card>
      </div>

      {/* Reports Section */}
      <div className="space-y-6 pt-4">
        <h2 className="px-2 text-xl font-black tracking-wide uppercase">Reports</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ReportCard
            color="bg-success/90 dark:bg-success/80"
            icon={<ClipboardList />}
            title="Book Appointment"
            desc="Schedule your next physiotherapy session with your patient."
            onClick={() => setIsBookingOpen(true)}
          />
          <ReportCard
            color="bg-[#7fb2f0]"
            icon={<CheckCircle2 />}
            title="Check Guided-Test"
            desc="Guided tests already assigned to your patient."
            actionText="Check"
          />
          <ReportCard
            color="bg-[#f472d0]"
            icon={<FileText />}
            title="Uploaded Documents"
            desc="Check documents uploaded by the your patient."
            actionText="Check"
            onClick={() => setIsDocsOpen(true)}
          />

          <div className="bg-border col-span-full my-6 h-[1px] opacity-50" />

          <ReportCard
            color="bg-[#7c4d7c]"
            icon={<PlusCircle />}
            title="Treatment Plan"
            desc="Check documents uploaded by the your patient."
            actionText="Create"
          />
          <ReportCard
            color="bg-warning dark:opacity-90"
            icon={<Calendar />}
            title="Session Note"
            desc="Check documents uploaded by the your patient."
            actionText="Create"
          />
          <ReportCard
            color="bg-foreground text-background"
            icon={<Info />}
            title="Referral Or Order"
            desc="Request for other important documents and refer your patient."
            actionText="Create"
          />
        </div>
      </div>

      {/* Final Action */}
      <div className="flex justify-center pt-10">
        <Button className="h-16 rounded-2xl border-none bg-[#3da9f5] px-20 text-sm font-black text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#2c91db] active:scale-95">
          Finalize Case
        </Button>
      </div>

      {/* Booking Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md border-none p-6 shadow-2xl">
            <h3 className="text-xl font-black">Schedule Appointment</h3>
            <p className="text-muted-foreground mt-2 text-xs font-medium">
              Select a date and time for Bola Ahmed Tinubu
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
                  {isSubmitting ? 'Scheduling...' : 'Confirm Booking'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Documents Modal */}
      {isDocsOpen && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <Card className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden border-none shadow-2xl">
            <div className="flex items-center justify-between border-b p-6">
              <div>
                <h3 className="text-xl font-black">Patient Documents</h3>
                <p className="text-muted-foreground text-xs font-medium">
                  Uploaded by Bola Ahmed Tinubu
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
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-800">
                          <FileIcon className="h-6 w-6 text-slate-400" />
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
        'flex min-h-[180px] flex-col justify-between rounded-[2rem] p-7 text-white shadow-md transition-transform hover:-translate-y-1',
        color
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {React.cloneElement(icon, { className: 'h-5 w-5' })}
          <span className="text-sm leading-none font-black tracking-tight uppercase">
            {title}
          </span>
        </div>
        <p className="line-clamp-2 text-[11px] leading-relaxed font-bold opacity-90">
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
