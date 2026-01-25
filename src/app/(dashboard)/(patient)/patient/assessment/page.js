'use client';

import { useState } from 'react';
import useAssessmentStore from '@/store/assessmentStore';
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

    // Perform reset strictly once on mount if requested via URL OR if landing on a complete screen
    if (!hasResetOnce.current) {
      if (isNewAssessment || currentStep === 'complete') {
        resetAssessment();
      }
      hasResetOnce.current = true;
    }
  }, [isNewAssessment, resetAssessment, isHydrated, currentStep]);

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
          // Find the question text from MEDICAL_RULES if possible
          const regionRules = MEDICAL_RULES[selectedRegion];
          const question = regionRules?.questions[questionId]?.text || questionId;
          return { question, answer };
        }),
        mediaUrls: [], // For now, handle media separately if needed or add here
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
        {currentStep === 'body-map' && <BodyMapPicker />}

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
                  <div className="grid grid-cols-3 gap-4">
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
                    <div className="prose prose-blue dark:prose-invert prose-p:leading-relaxed prose-headings:mb-4 prose-headings:mt-6 animate-in slide-in-from-bottom-4 max-w-none rounded-2xl border border-blue-100 bg-blue-50/50 p-8 duration-500 dark:border-blue-900/30 dark:bg-blue-900/10">
                      {typeof aiAnalysis === 'string' ? (
                        <ReactMarkdown>
                          {aiAnalysis
                            .replace(/^```(markdown|md)?\n/, '')
                            .replace(/\n```$/, '')}
                        </ReactMarkdown>
                      ) : (
                        <div className="space-y-4 text-slate-900 dark:text-white">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold">
                              {aiAnalysis.temporalDiagnosis}
                            </h3>
                            <span
                              className={cn(
                                'rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase',
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
                            <span className="text-sm font-medium text-slate-500">
                              Confidence:
                            </span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                              <div
                                className="bg-primary h-full"
                                style={{ width: `${aiAnalysis.confidenceScore}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold">
                              {aiAnalysis.confidenceScore}%
                            </span>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs font-bold tracking-tight text-slate-400 uppercase">
                              Clinical Reasoning
                            </p>
                            <ul className="list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
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
