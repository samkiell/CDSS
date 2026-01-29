'use client';

import React, { useState } from 'react';
import {
  Compass,
  ChevronRight,
  Stethoscope,
  Activity,
  MoveHorizontal,
  Info,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Card, CardContent, Button, Badge, StatusModal } from '@/components/ui';
import { cn } from '@/lib/cn';
import Link from 'next/link';

export default function ClinicianDiagnosticPage() {
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const diagnosticModules = [
    {
      title: 'Lumbar Pain Screener',
      region: 'Lumbar',
      intensity: 'Detailed',
      description:
        'Comprehensive screening for sciatica, disc herniation, and mechanical low back pain.',
    },
    {
      title: 'Cervical Posture Diagnostic',
      region: 'Cervical',
      intensity: 'Standard',
      description:
        'Assessment for radiculopathy, nerve root compression, and postural dysfunction.',
    },
    {
      title: 'Ankle Stability Test',
      region: 'Ankle',
      intensity: 'Quick',
      description:
        'Stability testing for ATFL tears, syndromesmosis injuries, and Achilles tendon health.',
    },
    {
      title: 'Shoulder Mobility Screener',
      region: 'Shoulder',
      intensity: 'Detailed',
      description:
        'Assessment for rotator cuff tears, impingement syndrome, and instability.',
    },
    {
      title: 'Leg Raise Tests (Clinical)',
      region: 'Lumbar',
      intensity: 'Clinical',
      description:
        'Advanced clinical module for precise neurological tension and core stability assessment.',
    },
    {
      title: 'Knee Pain Assessment',
      region: 'Knee',
      intensity: 'Rapid',
      description:
        'Quick screening for ACL/MCL stability and meniscus pathology indicators.',
    },
  ];

  const handleSync = () => {
    setStatusModal({
      isOpen: true,
      type: 'info',
      title: 'Synchronizing Cases',
      message:
        'Cloud database is currently synchronizing with local clinician records. This may take a moment...',
    });
    setTimeout(() => {
      setStatusModal({
        isOpen: true,
        type: 'success',
        title: 'Sync Complete',
        message:
          'All localized cases have been successfully synchronized with the AI Heuristic Engine.',
      });
    }, 2000);
  };

  const handleRulebook = () => {
    setStatusModal({
      isOpen: true,
      type: 'info',
      title: 'Clinical Rulebook',
      message:
        'The comprehensive clinical decision rulebook effectively integrates MSK heuristic patterns. Viewing permissions are standard for therapists.',
    });
  };

  return (
    <div className="animate-fade-in space-y-10 overflow-hidden pb-12">
      <header className="relative overflow-hidden rounded-[3rem] bg-[#111827] p-12 text-white shadow-2xl">
        {/* Abstract background elements */}
        <div className="bg-primary/20 absolute top-0 right-0 h-full w-1/3 translate-x-1/4 -translate-y-1/2 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-1/2 w-1/4 -translate-x-1/4 translate-y-1/2 rounded-full bg-blue-500/10 blur-[80px]" />

        <div className="relative z-10 flex flex-col items-center gap-10 md:flex-row">
          <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl">
            <Compass className="text-primary h-12 w-12" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="mb-2 text-4xl font-extrabold uppercase">
              Guided Diagnostic Mode
            </h1>
            <p className="max-w-xl text-base font-medium text-gray-400">
              Select a specialized medical module to perform structured clinical
              assessments. Data is automatically synchronized with the AI Heuristic
              Engine.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3">
            <div className="text-primary flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase">
              <ShieldCheck className="h-4 w-4" />
              HIPAA Compliant
            </div>
            <Button
              onClick={handleSync}
              className="bg-primary shadow-primary/30 h-14 rounded-2xl px-10 font-black tracking-widest text-white uppercase shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              Sync All Cases
            </Button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {diagnosticModules.map((module, i) => (
          <Card
            key={i}
            className="group border-border bg-card relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <CardContent className="flex flex-1 flex-col p-10">
              <div className="mb-8 flex items-center justify-between">
                <div className="bg-primary/5 text-primary group-hover:bg-primary rounded-2xl p-4 transition-all duration-300 group-hover:text-white">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <Badge
                  variant="outline"
                  className="border-border text-muted-foreground group-hover:border-primary/30 rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase transition-colors"
                >
                  {module.intensity}
                </Badge>
              </div>

              <div className="flex-1">
                <h3 className="text-foreground group-hover:text-primary mb-4 text-xl leading-tight font-black transition-colors">
                  {module.title}
                </h3>
                <p className="text-muted-foreground mb-8 text-sm leading-relaxed font-medium opacity-80">
                  {module.description}
                </p>
              </div>

              <div className="mt-auto space-y-6">
                <div className="border-border flex items-center gap-6 border-t pt-6">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest uppercase">
                      Region
                    </span>
                    <span className="text-foreground text-sm font-black uppercase">
                      {module.region}
                    </span>
                  </div>
                  <div className="bg-border h-8 w-[1px]" />
                  <div className="flex flex-col">
                    <span className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest uppercase">
                      Complexity
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((dot) => (
                        <div
                          key={dot}
                          className={cn(
                            'h-1.5 w-4 rounded-full',
                            dot <=
                              (module.intensity === 'Detailed' ||
                              module.intensity === 'Clinical'
                                ? 3
                                : module.intensity === 'Standard'
                                  ? 2
                                  : 1)
                              ? 'bg-primary'
                              : 'bg-muted'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/clinician/diagnostic/${module.title
                    .toLowerCase()
                    .replace(/\s+/g, '-')}`}
                  className="block"
                >
                  <Button className="bg-muted hover:bg-primary h-14 w-full rounded-2xl text-sm font-black tracking-widest uppercase transition-all duration-300 hover:text-white">
                    Initial Assessment
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integration Banner */}
      <div className="to-primary group relative overflow-hidden rounded-[3rem] bg-gradient-to-r from-indigo-600 p-12 text-white">
        <div className="absolute top-0 right-0 rotate-12 p-12 opacity-10 transition-all group-hover:opacity-20">
          <Zap className="h-48 w-48" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-between gap-10 lg:flex-row">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="mb-4 flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-white/70 uppercase">
              <Activity className="h-4 w-4" />
              Live Heuristic Processing
            </div>
            <h3 className="mb-4 text-3xl font-extrabold uppercase">
              Advanced Clinical Confirmatory Tests
            </h3>
            <p className="leading-relaxed font-medium text-white/80">
              Access region-specific physical validation modules like Lasegue’s Test
              (SLR), Spurling’s, and Thompson’s directly within your case review flow.
            </p>
          </div>
          <Button
            onClick={handleRulebook}
            className="h-16 shrink-0 rounded-2xl bg-white px-12 text-sm font-black tracking-widest text-gray-900 uppercase shadow-xl hover:bg-gray-100 active:scale-95"
          >
            Access Rulebook
          </Button>
        </div>
      </div>

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
