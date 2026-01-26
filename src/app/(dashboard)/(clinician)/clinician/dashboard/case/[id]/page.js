'use client';

import React from 'react';
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
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button, Card } from '@/components/ui';

export default function CaseDetailsPage({ params }) {
  const { id } = params;

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
        <div className="bg-muted border-border flex h-20 w-20 items-center justify-center rounded-full border shadow-inner">
          <User className="text-muted-foreground/50 h-10 w-10" />
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
    </div>
  );
}

function ReportCard({ color, icon, title, desc, actionText = 'Book Now' }) {
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
      <button className="mt-4 rounded-xl bg-white py-2.5 text-[10px] font-black text-gray-900 uppercase shadow-sm transition-all hover:bg-gray-100 active:scale-95">
        {actionText}
      </button>
    </div>
  );
}
