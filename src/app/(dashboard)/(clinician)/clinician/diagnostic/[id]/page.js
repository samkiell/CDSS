'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  AlertCircle,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Activity,
} from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/cn';
import { Button, Card, Badge, StatusModal } from '@/components/ui';

export default function DiagnosticTestPage() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const patientName = searchParams.get('patient') || 'Patient';

  const [findings, setFindings] = useState({}); // { testId: 'positive' | 'negative' | 'follow' }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  // Map slug ID to title
  const testTitle = id
    ? id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ')
    : 'Guided Diagnostic Test';

  const tests = [
    {
      id: 1,
      title: 'Straight Leg Raise (SLR) - Lasegue’s Test',
      purpose:
        'To assess for nerve root irritation or disc herniation (L4-S1) by inducing dural tension.',
      instructions: `1. Have the patient lie supine on the examination table.
2. Ensure the hip is in neutral rotation and the knee is fully extended.
3. Slowly lift the symptomatic leg, keeping the knee straight.
4. Note the degree of elevation where pain or neurological symptoms are reproduced.
5. Positive result: Pain below the knee at 30-70 degrees of hip flexion.`,
    },
    {
      id: 2,
      title: 'Bragard’s Sign (Ankle Dorsiflexion)',
      purpose:
        'Confirmatory test to differentiate between neural tension and hamstring tightness.',
      instructions: `1. Perform a passive SLR until symptoms are reached.
2. Slowly lower the leg by 5-10 degrees until pain disappears.
3. Passively dorsiflex the patient's foot.
4. Positive result: Reproduction of radicular pain in the leg.`,
    },
  ];

  const handleResult = (testId, result) => {
    setFindings((prev) => ({
      ...prev,
      [testId]: result,
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(findings).length === 0) {
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'No Findings recorded',
        message: 'Please record at least one clinical finding before submitting.',
      });
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setStatusModal({
        isOpen: true,
        type: 'success',
        title: 'Assessment Complete',
        message: `Clinical findings for ${patientName} have been recorded and synced with the AI engine.`,
      });
    }, 1500);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="hover:bg-accent flex h-10 w-10 items-center justify-center rounded-full transition-colors"
          >
            <ArrowLeft className="text-muted-foreground h-6 w-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                {patientName}'s Guided Test
              </h1>
              <span className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                Clinical Examination
              </span>
            </div>
          </div>
        </div>
        <div className="hidden border-l-2 pl-4 sm:block">
          <Badge variant="outline" className="px-3 py-1 font-bold">
            <Clock className="mr-1.5 h-3.5 w-3.5" />
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Badge>
        </div>
      </div>

      {/* Main Title Section - Removed Italics & Reduced Accent */}
      <div className="mb-10 text-center">
        <h2 className="text-muted-foreground text-sm font-extrabold tracking-[0.2em] uppercase">
          Dynamic Diagnostic Protocol
        </h2>
        <h3 className="text-foreground mt-2 text-3xl font-extrabold">
          {testTitle === 'Lumbar-pain-screener' || id?.includes('lumbar')
            ? 'Lumbar Disc Herniation Assessment'
            : testTitle}
        </h3>
        <div className="bg-primary mx-auto mt-4 h-1 w-12 rounded-full" />
      </div>

      {/* Test Items */}
      <div className="space-y-8">
        {tests.map((test) => (
          <Card
            key={test.id}
            className={cn(
              'border-border group bg-card relative overflow-hidden rounded-[2.5rem] p-1 shadow-sm transition-all',
              findings[test.id] === 'positive' && 'ring-destructive ring-2',
              findings[test.id] === 'negative' && 'ring-success ring-2',
              findings[test.id] === 'follow' && 'ring-warning ring-2'
            )}
          >
            <CardContent className="p-8">
              <div className="mb-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/5 text-primary flex h-12 w-12 items-center justify-center rounded-2xl">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold tracking-tight">
                      {test.title}
                    </h3>
                    <div className="mt-1 flex gap-2">
                      <Badge
                        variant="secondary"
                        className="px-2 py-0 text-[10px] font-bold uppercase"
                      >
                        Clinical Test
                      </Badge>
                      {findings[test.id] && (
                        <Badge
                          className={cn(
                            'border-none px-2 py-0 text-[10px] font-bold text-white uppercase',
                            findings[test.id] === 'positive' && 'bg-destructive',
                            findings[test.id] === 'negative' && 'bg-success',
                            findings[test.id] === 'follow' && 'bg-warning'
                          )}
                        >
                          {findings[test.id] === 'positive'
                            ? 'Positive'
                            : findings[test.id]}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <span className="text-muted-foreground text-[10px] font-extrabold tracking-widest uppercase">
                      Purpose
                    </span>
                    <p className="text-foreground mt-1 text-sm leading-relaxed font-medium">
                      {test.purpose}
                    </p>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-[10px] font-extrabold tracking-widest uppercase">
                      Instructions
                    </span>
                    <div className="mt-2 space-y-2">
                      {test.instructions.split('\n').map((line, i) => (
                        <p
                          key={i}
                          className="text-muted-foreground text-sm leading-relaxed font-bold"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Media / Video Placeholder */}
                  <div className="group/video relative aspect-video overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-900">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-primary flex h-16 w-16 items-center justify-center rounded-full text-white shadow-xl transition-transform group-hover/video:scale-110">
                        <Play className="ml-1 h-8 w-8" />
                      </div>
                    </div>
                    <div className="absolute right-4 bottom-4 left-4 flex items-center gap-2 rounded-xl bg-black/40 p-2 text-xs font-bold text-white backdrop-blur-md">
                      <AlertCircle className="text-warning h-4 w-4" />
                      Visual Reference Guide
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleResult(test.id, 'follow')}
                      className={cn(
                        'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 py-4 transition-all active:scale-95',
                        findings[test.id] === 'follow'
                          ? 'border-warning bg-warning/10 text-warning ring-warning/20 ring-2'
                          : 'border-border bg-card hover:border-warning/50 text-muted-foreground'
                      )}
                    >
                      <Clock className="h-5 w-5" />
                      <span className="text-[10px] font-extrabold uppercase">Follow</span>
                    </button>
                    <button
                      onClick={() => handleResult(test.id, 'negative')}
                      className={cn(
                        'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 py-4 transition-all active:scale-95',
                        findings[test.id] === 'negative'
                          ? 'border-success bg-success/10 text-success ring-success/20 ring-2'
                          : 'border-border bg-card hover:border-success/50 text-muted-foreground'
                      )}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-[10px] font-extrabold uppercase">
                        Negative
                      </span>
                    </button>
                    <button
                      onClick={() => handleResult(test.id, 'positive')}
                      className={cn(
                        'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 py-4 transition-all active:scale-95',
                        findings[test.id] === 'positive'
                          ? 'border-destructive bg-destructive/10 text-destructive ring-destructive/20 ring-2'
                          : 'border-border bg-card hover:border-destructive/50 text-muted-foreground'
                      )}
                    >
                      <XCircle className="h-5 w-5" />
                      <span className="text-[10px] font-extrabold uppercase">
                        Update to positive
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Final Action */}
      <div className="mt-12 flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-primary shadow-primary/30 h-16 w-full max-w-md rounded-2xl text-base font-black tracking-widest text-white uppercase shadow-2xl transition-all hover:scale-[1.02] active:scale-95 sm:w-auto sm:px-20"
        >
          {isSubmitting ? 'Processing Findings...' : 'Complete Documentation'}
        </Button>
      </div>

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => {
          setStatusModal({ ...statusModal, isOpen: false });
          if (statusModal.type === 'success') router.push('/clinician/diagnostic');
        }}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
      />
    </div>
  );
}
