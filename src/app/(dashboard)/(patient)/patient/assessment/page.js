'use client';

import { useState } from 'react';
import useAssessmentStore from '@/store/assessmentStore';
import BiodataConfirmation from './components/BiodataConfirmation';
import BodyMapPicker from './components/BodyMapPicker';
import QuestionCard from './components/QuestionCard';
import ProgressBar from './components/ProgressBar';
import SupportingMediaGrid from './components/SupportingMediaGrid';
import DisclaimerModal from './components/DisclaimerModal';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle2,
  ChevronRight,
  FileJson,
  ClipboardList,
  Image as ImageIcon,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/cn';

import { useSearchParams, useRouter } from 'next/navigation';
import { MEDICAL_RULES } from '@/constants/medicalRules';

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
  } = useAssessmentStore();
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const hasResetOnce = useRef(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (isNewAssessment) {
      resetAssessment();
      // Remove the query param to prevent accidental resets on refreshes
      const timeout = setTimeout(() => {
        router.replace('/patient/assessment');
      }, 100);
      return () => clearTimeout(timeout);
    }

    if (currentStep === 'complete' && !isNewAssessment) {
      // If we are finished but not starting fresh, don't auto-reset
      // unless we want to allow viewing the complete screen only once.
    }
  }, [isNewAssessment, resetAssessment, isHydrated, router]);

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/diagnosis/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedRegion,
          responses,
          redFlags,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAiAnalysis(data.analysis);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('AI Analysis Error:', error);
      toast.error('Could not generate preliminary AI analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmAndAnalyze = () => {
    setIsDisclaimerOpen(true);
  };

  const handleDisclaimerConfirm = async () => {
    setIsDisclaimerOpen(false);
    if (!aiAnalysis) {
      await handleAiAnalysis();
    } else {
      await handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    try {
      const payload = {
        bodyRegion: selectedRegion,
        symptomData: Object.entries(responses).map(([questionId, answer]) => {
          // Find the question object from MEDICAL_RULES if possible
          const regionRules = MEDICAL_RULES[selectedRegion];
          const questionObj = regionRules?.questions[questionId];
          return {
            questionId,
            question: questionObj?.text || questionId,
            response: answer,
            questionCategory: questionObj?.category || 'general',
          };
        }),
        mediaUrls: [], // For now, handle media separately if needed or add here
        aiAnalysis: aiAnalysis, // Pass the analysis matched during summary
      };

      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit assessment');
      }

      toast.success('Assessment submitted successfully! A clinician will review it.');

      resetAssessment();
      setStep('complete');
    } catch (error) {
      console.error('Submission Error:', error);
      toast.error(error.message || 'Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
         * The self-guided test feature has been deprecated.
         *
         * CURRENT FLOW (IMPLEMENTED):
         * 1. biodata   → Patient confirms/edits biodata (MANDATORY - cannot be skipped)
         * 2. body-map  → Patient selects affected body region
         * 3. questions → Dynamic symptom questions based on region
         * 4. upload    → Supporting media/documents
         * 5. summary   → AI analysis and review
         * 6. complete  → Confirmation screen
         *
         * BIODATA STEP GUARDRAILS:
         * - Biodata confirmation is MANDATORY before proceeding
         * - Changes to biodata here do NOT update patient's main profile
         * - Biodata is snapshotted per assessment for historical accuracy
         *
         * TODO: FUTURE INTEGRATION - BRANCHING DIAGNOSTIC QUESTIONS
         * ===========================================================
         * Location: Enhance QuestionCard component during 'questions' step
         * Purpose: Load region-specific questions from public/rules/
         *
         * Implementation notes:
         * - Rule files exist in: public/rules/{region}.docx (DOCX format)
         * - If rule file missing or unreadable, show TODO/fallback message
         * - Dynamic question flow based on red flags and responses
         * - Support for conditional branching (if answer X, ask question Y)
         * - Do NOT invent medical logic - only use rules from files
         */}

        {/*
         * STEP 1: BIODATA CONFIRMATION (MANDATORY)
         * =========================================
         * Patient must confirm their biodata before any assessment questions.
         * This step cannot be skipped or bypassed.
         * Biodata is snapshotted and stored with the assessment record.
         */}
        {currentStep === 'biodata' && <BiodataConfirmation />}

        {/*
         * STEP 2: BODY REGION SELECTION
         * ==============================
         * Only accessible after biodata confirmation.
         * Guardrail in store prevents direct navigation without confirmed biodata.
         */}
        {currentStep === 'body-map' && <BodyMapPicker />}

        {/*
         * STEP 3: DIAGNOSTIC QUESTIONS
         * =============================
         * TODO: This is where branching diagnostic logic will be integrated.
         *
         * FUTURE IMPLEMENTATION:
         * - Load questions from public/rules/{selectedRegion}.docx
         * - Parse rule file to extract question tree
         * - Implement conditional branching based on responses
         * - If rule file missing, show fallback with TODO marker
         *
         * IMPORTANT CONSTRAINTS:
         * - Do NOT invent medical logic
         * - Only use rules from files in public/rules/
         * - Leave TODO comments if rules are missing
         */}
        {currentStep === 'questions' && <QuestionCard />}

        {currentStep === 'upload' && <SupportingMediaGrid />}

        {currentStep === 'summary' && (
          <div className="animate-in zoom-in mx-auto max-w-2xl space-y-8 duration-300">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Review Your Report</h2>
              <p className="mt-2 text-slate-500">
                Almost done. Review your answers before sending to our AI agent.
              </p>
            </div>

            <Card className="border-2 border-slate-100 dark:border-slate-800">
              <CardContent className="divide-y divide-slate-100 p-6 dark:divide-slate-800">
                {/* Region Header */}
                <div className="flex justify-between py-4">
                  <span className="font-medium text-slate-500">Assessment Region</span>
                  <span className="text-primary font-bold tracking-wide uppercase">
                    {selectedRegion}
                  </span>
                </div>

                {/* Compact Assessment Overview */}
                <div className="py-6">
                  <span className="mb-4 block text-xs font-bold tracking-wider text-slate-400 uppercase">
                    Assessment Overview
                  </span>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-900/50">
                      <ClipboardList className="text-primary mb-2" size={20} />
                      <span className="text-xl font-bold">
                        {Object.keys(responses).length}
                      </span>
                      <span className="text-[10px] font-medium tracking-tight text-slate-500 uppercase">
                        Answers
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-900/50">
                      <ImageIcon className="mb-2 text-indigo-500" size={20} />
                      <span className="text-xl font-bold">{files.length}</span>
                      <span className="text-[10px] font-medium tracking-tight text-slate-500 uppercase">
                        Images
                      </span>
                    </div>

                    <div
                      className={cn(
                        'flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-colors',
                        redFlags.length > 0
                          ? 'border-red-100 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10'
                          : 'border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50'
                      )}
                    >
                      <AlertTriangle
                        className={
                          redFlags.length > 0
                            ? 'mb-2 text-red-500'
                            : 'mb-2 text-slate-400'
                        }
                        size={20}
                      />
                      <span
                        className={cn(
                          'text-xl font-bold',
                          redFlags.length > 0 && 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {redFlags.length}
                      </span>
                      <span className="text-[10px] font-medium tracking-tight text-slate-500 uppercase">
                        Alerts
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Analysis Section */}
                <div className="py-6">
                  <span className="mb-3 block font-medium text-slate-500">
                    Preliminary AI Analysis
                  </span>
                  {isAnalyzing ? (
                    <div className="animate-in fade-in zoom-in flex items-center justify-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-900">
                      <Loader2 className="text-primary animate-spin" size={24} />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          Analyzing Symptoms
                        </span>
                        <span className="animate-pulse text-xs text-slate-500">
                          Our clinical AI agent is processing your data...
                        </span>
                      </div>
                    </div>
                  ) : aiAnalysis ? (
                    <div className="prose prose-blue dark:prose-invert prose-p:leading-relaxed prose-headings:mb-4 prose-headings:mt-6 animate-in slide-in-from-bottom-4 max-w-none rounded-2xl border border-blue-100 bg-blue-50/50 p-4 duration-500 md:p-8 dark:border-blue-900/30 dark:bg-blue-900/10">
                      {typeof aiAnalysis === 'string' ? (
                        <ReactMarkdown>
                          {aiAnalysis
                            .replace(/^```(markdown|md)?\n/, '')
                            .replace(/\n```$/, '')}
                        </ReactMarkdown>
                      ) : (
                        <div className="space-y-4 text-slate-900 dark:text-white">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-lg font-bold md:text-xl">
                              {aiAnalysis.temporalDiagnosis}
                            </h3>
                            <span
                              className={cn(
                                'shrink-0 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase md:text-xs',
                                aiAnalysis.riskLevel === 'Urgent'
                                  ? 'bg-red-100 text-red-700'
                                  : aiAnalysis.riskLevel === 'Moderate'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-green-100 text-green-700'
                              )}
                            >
                              {aiAnalysis.riskLevel} Risk
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-500 md:text-sm">
                              Confidence:
                            </span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                              <div
                                className="bg-primary h-full"
                                style={{ width: `${aiAnalysis.confidenceScore}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold md:text-sm">
                              {aiAnalysis.confidenceScore}%
                            </span>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold tracking-tight text-slate-400 uppercase md:text-xs">
                              Clinical Reasoning
                            </p>
                            <ul className="list-inside list-disc space-y-1 text-xs text-slate-600 md:text-sm dark:text-slate-400">
                              {aiAnalysis.reasoning?.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/30 p-8 text-center dark:border-slate-800/50 dark:bg-slate-900/10">
                      <div className="text-sm font-medium text-slate-400">
                        Click below to generate your preliminary AI clinical report.
                      </div>
                    </div>
                  )}
                </div>
                {redFlags.length > 0 && (
                  <div className="py-4">
                    <span className="mb-2 block text-xs font-bold tracking-wider text-red-500 uppercase">
                      Clinical Alerts
                    </span>
                    <ul className="space-y-1">
                      {redFlags.map((flag, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4">
              {!aiAnalysis ? (
                <Button
                  size="lg"
                  onClick={handleConfirmAndAnalyze}
                  loading={isAnalyzing}
                  className="h-14 w-full text-lg"
                >
                  Generate AI Preliminary Report
                  <ChevronRight size={18} className="ml-2" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={handleFinalSubmit}
                  loading={isSubmitting}
                  className="h-14 w-full bg-green-600 text-lg hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                >
                  Submit Final Assessment
                  <ChevronRight size={18} className="ml-2" />
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={() => setStep('upload')}
                disabled={isAnalyzing || isSubmitting}
              >
                Go back to uploads
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="animate-in fade-in py-20 text-center duration-1000">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <h1 className="text-3xl font-bold">Assessment Received</h1>
            <p className="mx-auto mt-4 max-w-md text-slate-500">
              Your preliminary report is being processed by our AI agent and will be
              shared with your assigned clinician shortly.
            </p>
            <Button
              className="mt-10"
              variant="secondary"
              onClick={() => {
                resetAssessment();
                router.push('/patient/dashboard');
              }}
            >
              Return to Dashboard
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
