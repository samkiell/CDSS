'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useAssessmentStore from '@/store/assessmentStore';
import BiodataConfirmation from './components/BiodataConfirmation';
import BodyMapPicker from './components/BodyMapPicker';
import QuestionEngine from './components/QuestionEngine';
import AssessmentSummary from './components/AssessmentSummary';
import ProgressBar from './components/ProgressBar';
import DisclaimerModal from './components/DisclaimerModal';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  AlertTriangle,
  Loader2,
  User,
  Stethoscope,
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * PATIENT ASSESSMENT PAGE
 * ========================
 * Main entry point for the patient assessment flow.
 *
 * FLOW ORDER:
 * 1. biodata   → Patient confirms/edits biodata (MANDATORY - cannot be skipped)
 * 2. body-map  → Patient selects affected body region
 * 3. questions → Dynamic branching questions based on JSON rules
 * 4. summary   → Review all answers before AI analysis
 * 5. analyzing → AI temporal diagnosis in progress
 * 6. complete  → Confirmation and therapist handoff
 *
 * BRANCHING ENGINE:
 * This page now uses the QuestionEngine component which loads
 * region-specific JSON rules and implements dynamic branching.
 */
export default function PatientAssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewAssessment = searchParams.get('new') === 'true';

  const {
    currentStep,
    selectedRegion,
    responses,
    redFlags,
    files,
    resetAssessment,
    setStep,
    aiAnalysis,
    setAiAnalysis,
    biodataConfirmed,
    biodata,
    engineState,
    assessmentTrace,
    submittedToTherapist,
    submitToTherapist,
  } = useAssessmentStore();

  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (isNewAssessment) {
      resetAssessment();
      const timeout = setTimeout(() => {
        router.replace('/patient/assessment');
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isNewAssessment, resetAssessment, isHydrated, router]);

  /**
   * HANDLE AI SUBMISSION
   * =====================
   * Called from AssessmentSummary when patient confirms submission.
   * Sends the prepared payload to the submission API.
   */
  const handleAiSubmission = async (aiPayload) => {
    setIsAnalyzing(true);
    setStep('analyzing');

    try {
      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...aiPayload,
          mediaUrls: files.map((f) => f.url).filter(Boolean),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit assessment');
      }

      // Store the AI analysis result
      setAiAnalysis(data.aiAnalysis);
      setSubmissionResult(data);

      // Mark as submitted to therapist
      submitToTherapist();

      toast.success('Assessment submitted successfully!', {
        description: 'A therapist will review your case shortly.',
      });
    } catch (error) {
      console.error('Submission Error:', error);
      toast.error(error.message || 'Failed to submit assessment. Please try again.');
      setStep('summary'); // Allow retry
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * HANDLE DISCLAIMER CONFIRM
   * ==========================
   * Called when patient accepts the disclaimer before analysis.
   */
  const handleDisclaimerConfirm = () => {
    setIsDisclaimerOpen(false);
    // Move to summary step for review
    setStep('summary');
  };

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen max-w-5xl px-4 py-2 pb-32">
      <ProgressBar />

      {/* Resume Session Banner */}
      {currentStep === 'body-map' && selectedRegion && !isNewAssessment && (
        <div className="animate-in slide-in-from-top-4 mb-8 duration-500">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <ClipboardList className="text-primary" size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold">Unfinished Assessment Found</p>
                  <p className="text-xs text-slate-500">
                    You were previously assessing your {selectedRegion}.
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={() => setStep('questions')}>
                Resume Session
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <main className="transform-gpu transition-all duration-300">
        {/*
         * PATIENT ASSESSMENT FLOW - PRIMARY ENTRY POINT
         * ==============================================
         * This is the ONLY way patients can begin a clinical assessment.
         *
         * CURRENT FLOW (IMPLEMENTED WITH BRANCHING ENGINE):
         * 1. biodata   → Patient confirms/edits biodata (MANDATORY)
         * 2. body-map  → Patient selects affected body region
         * 3. questions → Branching engine with JSON rules
         * 4. summary   → Review all answers before submission
         * 5. analyzing → AI temporal diagnosis in progress
         * 6. complete  → Confirmation and therapist handoff
         */}

        {/* STEP 1: BIODATA CONFIRMATION (MANDATORY) */}
        {currentStep === 'biodata' && <BiodataConfirmation />}

        {/* STEP 2: BODY REGION SELECTION */}
        {currentStep === 'body-map' && <BodyMapPicker />}

        {/*
         * STEP 3: BRANCHING QUESTION ENGINE
         * ==================================
         * Uses the new QuestionEngine component that:
         * - Loads region-specific JSON rules
         * - Implements dynamic branching based on answers
         * - Tracks condition likelihood and rule-out decisions
         * - Handles red flag detection
         */}
        {currentStep === 'questions' && <QuestionEngine />}

        {/*
         * STEP 4: ASSESSMENT SUMMARY
         * ===========================
         * Shows all questions and answers for patient review.
         * Patient must confirm before AI analysis.
         * No diagnosis is shown before confirmation.
         */}
        {currentStep === 'summary' && <AssessmentSummary onSubmit={handleAiSubmission} />}

        {/* STEP 5: ANALYZING (AI Processing) */}
        {currentStep === 'analyzing' && (
          <div className="animate-in fade-in flex min-h-[400px] items-center justify-center duration-500">
            <div className="text-center">
              <Loader2 className="text-primary mx-auto h-16 w-16 animate-spin" />
              <h2 className="mt-6 text-xl font-bold">Analyzing Your Assessment</h2>
              <p className="text-muted-foreground mt-2">
                Our AI is processing your responses and generating a preliminary
                analysis...
              </p>
              <p className="text-muted-foreground mt-4 text-sm">
                This usually takes 10-30 seconds
              </p>
            </div>
          </div>
        )}

        {/* STEP 6: COMPLETE - Therapist Handoff */}
        {currentStep === 'complete' && (
          <div className="animate-in fade-in py-16 text-center duration-1000">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
              <CheckCircle2 size={56} className="text-green-500" />
            </div>
            <h1 className="text-3xl font-bold">Assessment Submitted</h1>
            <p className="mx-auto mt-4 max-w-lg text-slate-500">
              Your assessment has been submitted for therapist review. A qualified
              professional will analyze your case and provide clinical confirmation.
            </p>

            {/* AI Analysis Summary */}
            {aiAnalysis && (
              <Card className="mx-auto mt-8 max-w-lg border-slate-200 dark:border-slate-800">
                <CardContent className="p-6 text-left">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <Stethoscope className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold">Preliminary Analysis</p>
                      <p className="text-xs text-slate-500">
                        AI-Generated (Pending Therapist Review)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Suspected Condition
                      </p>
                      <p className="text-lg font-semibold">
                        {aiAnalysis.temporalDiagnosis}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-500">Confidence</p>
                        <p className="font-semibold">{aiAnalysis.confidenceScore}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Risk Level</p>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${
                            aiAnalysis.riskLevel === 'Urgent'
                              ? 'bg-red-100 text-red-700'
                              : aiAnalysis.riskLevel === 'Moderate'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {aiAnalysis.riskLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                    <AlertTriangle className="mb-1 inline h-4 w-4" />{' '}
                    {aiAnalysis.disclaimer}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Red Flags Notice */}
            {submissionResult?.redFlagsCount > 0 && (
              <Card className="mx-auto mt-4 max-w-lg border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
                    <div className="text-left">
                      <p className="font-bold text-red-700 dark:text-red-400">
                        {submissionResult.redFlagsCount} Clinical Concern
                        {submissionResult.redFlagsCount > 1 ? 's' : ''} Detected
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-300">
                        These have been flagged for priority review by your therapist.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Next Steps */}
            <div className="mx-auto mt-8 max-w-lg">
              <h3 className="mb-4 font-bold">What Happens Next?</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold dark:bg-slate-800">
                    1
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    A qualified therapist will review your assessment and AI analysis
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold dark:bg-slate-800">
                    2
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    They may request additional information or schedule a consultation
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold dark:bg-slate-800">
                    3
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    You'll receive a notification when your diagnosis is confirmed
                  </p>
                </div>
              </div>
            </div>

            <Button
              className="mt-10"
              size="lg"
              onClick={() => {
                resetAssessment();
                router.push('/patient/dashboard');
              }}
            >
              Return to Dashboard
              <ChevronRight size={18} className="ml-2" />
            </Button>
          </div>
        )}
      </main>

      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onConfirm={handleDisclaimerConfirm}
        onCancel={() => setIsDisclaimerOpen(false)}
      />
    </div>
  );
}
