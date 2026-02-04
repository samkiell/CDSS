'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Activity,
  User,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/cn';
import { Button, Card, CardContent, Badge, StatusModal } from '@/components/ui';
import {
  initializeGuidedTestEngine,
  getCurrentTest,
  recordTestResult,
  generateRefinedDiagnosis,
} from '@/lib/guided-test-engine';

export default function DiagnosticExecutionPage() {
  const router = useRouter();
  const { id: moduleSlug } = useParams();
  const searchParams = useSearchParams();
  const patientName = searchParams.get('patient') || 'Anonymous Patient';
  const caseId = searchParams.get('caseId') || 'new-diagnostic';

  const [engineState, setEngineState] = useState(null);
  const [currentTest, setCurrentTestState] = useState(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  // Initialize Engine
  useEffect(() => {
    const initialState = initializeGuidedTestEngine({
      assessmentId: caseId,
      therapistId: 'current-therapist', // In production, get from auth
      moduleSlug: moduleSlug,
    });
    setEngineState(initialState);
    setCurrentTestState(getCurrentTest(initialState));
  }, [moduleSlug, caseId]);

  const handleOutcome = (result) => {
    if (!engineState || !currentTest) return;

    const newState = recordTestResult(engineState, currentTest.id, result);
    setEngineState(newState);

    if (newState.isComplete) {
      handleSessionComplete(newState);
    } else {
      setCurrentTestState(getCurrentTest(newState));
    }
  };

  const handleSessionComplete = (finalState) => {
    setIsFinishing(true);
    const refined = generateRefinedDiagnosis(finalState);

    // Dynamic Clinical Tone message
    const message = refined?.finalSuspectedCondition?.name
      ? `Diagnostic sequence concluded. Refined finding: ${refined.finalSuspectedCondition.name}. Path: ${refined.pathTaken.join(' -> ')}.`
      : 'Clinical diagnostic sequence completed. All findings have been synchronized.';

    setTimeout(() => {
      setStatusModal({
        isOpen: true,
        type: 'success',
        title: 'Session Concluded',
        message: message,
      });
      setIsFinishing(false);
    }, 1200);
  };

  if (!engineState || (!currentTest && !engineState.isComplete)) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Activity className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Map slug ID to title for Clinical header
  const moduleTitle = moduleSlug
    ? moduleSlug.charAt(0).toUpperCase() + moduleSlug.slice(1).replace(/-/g, ' ')
    : 'Guided Diagnostic Mode';

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      {/* Header - Clinical, Neutral */}
      <div className="mb-10 flex items-center justify-between border-b pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="hover:bg-muted flex h-10 w-10 items-center justify-center rounded-full transition-colors"
          >
            <ArrowLeft className="text-muted-foreground h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-muted text-foreground flex h-10 w-10 items-center justify-center rounded-lg border">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">{patientName}</h1>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <ShieldCheck className="h-3 w-3" />
                Case ID: {caseId.slice(0, 8)}...
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <Badge variant="outline" className="border-gray-200 font-bold text-gray-500">
            {moduleTitle}
          </Badge>
          <span className="mt-1 text-[10px] font-black tracking-widest text-gray-400 uppercase">
            Protocol Driven
          </span>
        </div>
      </div>

      {engineState.isComplete ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-primary/20 bg-primary/5 rounded-3xl border-2">
            <CardContent className="p-10 text-center">
              <div className="bg-primary/10 text-primary mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="mb-2 text-2xl font-black uppercase">
                Testing Protocol Complete
              </h2>
              <p className="text-muted-foreground mb-8 font-medium">
                The clinical path has reached a terminal node. Findings are now read-only
                and synchronized with the Case File.
              </p>
              <div className="mb-8 space-y-4 rounded-2xl bg-white p-6 text-left dark:bg-black/20">
                <div className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                  Reconstructed Path
                </div>
                <div className="space-y-2">
                  {engineState.completedTests.map((t, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-bold">
                      <div className="bg-muted flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px]">
                        {i + 1}
                      </div>
                      <span className="flex-1">{t.testName}</span>
                      <Badge
                        className={cn(
                          'ml-auto text-[10px] font-black uppercase',
                          t.result === 'positive'
                            ? 'bg-red-500/10 text-red-600'
                            : 'bg-green-500/10 text-green-600'
                        )}
                      >
                        {t.result}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                onClick={() => router.push('/clinician/diagnostic')}
                className="bg-primary h-14 w-full rounded-2xl font-black tracking-widest text-white uppercase"
              >
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Progress Indication */}
          <div className="flex items-center justify-between px-2">
            <span className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
              Step {currentTest.testNumber} In Sequence
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((dot) => (
                <div
                  key={dot}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    dot === currentTest.testNumber ? 'bg-primary' : 'bg-gray-200'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Atomic Test View */}
          <Card className="border-border overflow-hidden rounded-[2.5rem] shadow-sm">
            <CardContent className="p-0">
              <div className="p-8 lg:p-12">
                <div className="mb-8 flex items-start justify-between">
                  <div>
                    <Badge variant="secondary" className="mb-4 font-bold uppercase">
                      {currentTest.type}
                    </Badge>
                    <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                      {currentTest.name}
                    </h2>
                  </div>
                  <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-2xl">
                    <Activity className="h-6 w-6 text-gray-400" />
                  </div>
                </div>

                <div className="grid gap-10 lg:grid-cols-2">
                  <div className="space-y-8">
                    <section>
                      <h4 className="mb-2 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                        Clinical Purpose
                      </h4>
                      <p className="text-sm leading-relaxed font-bold text-gray-700 dark:text-gray-300">
                        {currentTest.purpose}
                      </p>
                    </section>{' '}
                    section
                    <section>
                      <h4 className="mb-3 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                        Execution Instructions
                      </h4>
                      <div className="space-y-3">
                        {currentTest.instructions.map((step, i) => (
                          <div key={i} className="flex gap-3">
                            <span className="text-primary mt-0.5 text-xs font-black">
                              {i + 1}.
                            </span>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="space-y-6">
                    {/* Visual Reference Only */}
                    <div className="bg-muted relative aspect-[4/3] w-full overflow-hidden rounded-3xl border">
                      {currentTest.image ? (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50 p-6 text-center text-gray-400">
                          <Activity className="mb-2 h-10 w-10 opacity-20" />
                          <span className="text-[10px] font-black tracking-widest uppercase">
                            Visual Reference: {currentTest.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                          <Activity className="h-10 w-10 animate-pulse" />
                        </div>
                      )}
                      <div className="absolute right-4 bottom-4 left-4 flex items-center gap-2 rounded-xl bg-black/60 p-3 text-[10px] font-black text-white uppercase backdrop-blur-md">
                        <Clock className="h-3.5 w-3.5" />
                        Atomic Clinical Reference
                      </div>
                    </div>

                    {/* Binary Outcome Logic ONLY */}
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleOutcome('negative')}
                        className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-gray-200 bg-white py-6 transition-all hover:border-green-500 hover:bg-green-50 active:scale-95 dark:border-gray-800 dark:bg-black/40"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors group-hover:bg-green-100 group-hover:text-green-600">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black tracking-widest uppercase">
                          Negative
                        </span>
                      </button>
                      <button
                        onClick={() => handleOutcome('positive')}
                        className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-gray-200 bg-white py-6 transition-all hover:border-red-500 hover:bg-red-50 active:scale-95 dark:border-gray-800 dark:bg-black/40"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors group-hover:bg-red-100 group-hover:text-red-600">
                          <XCircle className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black tracking-widest uppercase">
                          Positive
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => {
          setStatusModal({ ...statusModal, isOpen: false });
          router.push('/clinician/diagnostic');
        }}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
      />
    </div>
  );
}
