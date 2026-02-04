'use client';

import { useState, useEffect, useCallback } from 'react';
import useAssessmentStore from '@/store/assessmentStore';
import { Card, CardContent, Button } from '@/components/ui';
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  SkipForward,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  initializeEngine,
  getCurrentQuestion,
  processAnswer,
  getAssessmentSummary,
  previousQuestion,
} from '@/lib/branching-assessment-engine';

/**
 * QUESTION ENGINE COMPONENT (V2 - Dynamic Branching)
 * ===================================================
 * Implements the dynamic branching question flow using JSON rules.
 *
 * KEY IMPROVEMENTS FROM V1:
 * 1. Questions are resolved dynamically - never preloaded/pre-rendered
 * 2. Ruled-out conditions skip ALL their questions immediately
 * 3. Branching logic: answers can jump to specific questions
 * 4. Real-time progress shows remaining questions (not total)
 * 5. Shows ruled-out conditions for transparency
 *
 * BEHAVIOR:
 * 1. Loads region-specific JSON rules on mount
 * 2. Initializes the branching assessment engine
 * 3. Presents ONE question at a time
 * 4. Click answer → processes → shows next valid question
 * 5. Skips questions for ruled-out conditions
 * 6. Moves to summary when all relevant questions answered
 *
 * TRACEABILITY:
 * All answers recorded with timestamps, effects, and condition context.
 */
export default function QuestionEngine() {
  const {
    selectedRegion,
    engineState,
    initializeEngine: storeInitEngine,
    updateEngineState,
    completeQuestions,
    biodata,
  } = useAssessmentStore();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * LOAD REGION RULES & INITIALIZE ENGINE
   */
  useEffect(() => {
    const loadRules = async () => {
      if (!selectedRegion) {
        setLoadError('No region selected');
        setIsLoading(false);
        return;
      }

      try {
        const regionName =
          selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1);
        const response = await fetch(`/rules/${regionName} Region.json`);

        if (!response.ok) {
          throw new Error(`Rules not found for region: ${selectedRegion}`);
        }

        const rulesJson = await response.json();

        // Initialize the V2 branching engine
        const initialState = initializeEngine(rulesJson);
        storeInitEngine(initialState);

        // Get the first valid question
        const firstQuestion = getCurrentQuestion(initialState);
        setCurrentQuestion(firstQuestion);

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading region rules:', error);
        setLoadError(error.message);
        setIsLoading(false);
      }
    };

    // Only load if we don't already have engine state
    if (!engineState) {
      loadRules();
    } else {
      // Resume from existing state
      const question = getCurrentQuestion(engineState);
      setCurrentQuestion(question);
      setIsLoading(false);
    }
  }, [selectedRegion, engineState, storeInitEngine]);

  /**
   * HANDLE ANSWER CLICK - SEAMLESS FLOW WITH BRANCHING
   */
  const handleAnswerClick = useCallback(
    (answerValue) => {
      if (isProcessing || !currentQuestion || !engineState) {
        return;
      }

      setSelectedAnswer(answerValue);
      setIsProcessing(true);

      // Small delay for visual feedback
      setTimeout(() => {
        try {
          // Process through branching engine
          const newState = processAnswer(engineState, currentQuestion.id, answerValue);

          // Update store
          updateEngineState(newState);

          // Check for red flags
          if (newState.redFlags.length > (engineState.redFlags?.length || 0)) {
            const newFlag = newState.redFlags[newState.redFlags.length - 1];
            toast.warning('Clinical Attention Required', {
              description: newFlag.redFlagText || 'A clinical concern has been detected.',
            });
          }

          // Get next valid question (with branching logic)
          const nextQuestion = getCurrentQuestion(newState);

          if (nextQuestion) {
            setCurrentQuestion(nextQuestion);
            setSelectedAnswer(null);
          } else {
            // No more questions - complete assessment
            toast.success('Assessment Progress Saved', {
              description:
                'Your responses have been recorded. Please complete the final review.',
            });
            completeQuestions();
          }
        } catch (error) {
          console.error('Error processing answer:', error);
          toast.error('Error processing your answer. Please try again.');
        } finally {
          setIsProcessing(false);
        }
      }, 150);
    },
    [isProcessing, currentQuestion, engineState, updateEngineState, completeQuestions]
  );

  /**
   * HANDLE BACK - Undo last answer
   */
  const handleBack = useCallback(() => {
    if (
      isProcessing ||
      !engineState ||
      (engineState.answeredQuestions?.length || 0) === 0
    ) {
      return;
    }

    try {
      const prevState = previousQuestion(engineState);
      updateEngineState(prevState);

      const prevQuestion = getCurrentQuestion(prevState);
      setCurrentQuestion(prevQuestion);
      setSelectedAnswer(null);
    } catch (error) {
      console.error('Error going back:', error);
      toast.error('Unable to return to previous question.');
    }
  }, [isProcessing, engineState, updateEngineState]);

  /**
   * HANDLE SKIP - Skip current question
   */
  const handleSkip = useCallback(() => {
    if (isProcessing || !currentQuestion || !engineState) {
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      try {
        const newState = processAnswer(engineState, currentQuestion.id, 'Skipped');
        updateEngineState(newState);

        const nextQuestion = getCurrentQuestion(newState);

        if (nextQuestion) {
          setCurrentQuestion(nextQuestion);
          setSelectedAnswer(null);
        } else {
          completeQuestions();
        }
      } catch (error) {
        console.error('Error skipping question:', error);
        toast.error('Error moving to next question. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }, 150);
  }, [isProcessing, currentQuestion, engineState, updateEngineState, completeQuestions]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto h-10 w-10 animate-spin" />
          <p className="text-muted-foreground mt-4 text-sm font-medium">
            Loading assessment questions...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />
            <h3 className="mt-4 font-bold text-red-700 dark:text-red-400">
              Unable to Load Assessment
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">{loadError}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No question available
  if (!currentQuestion) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <CheckCircle2 className="text-primary mx-auto h-10 w-10" />
          <p className="text-muted-foreground mt-4 text-sm font-medium">
            Assessment questions complete. Proceeding to review...
          </p>
        </div>
      </div>
    );
  }

  // Calculate progress (dynamic based on remaining questions, not total)
  const answered = currentQuestion.answeredCount || 0;
  const remaining = currentQuestion.remainingEstimate || 0;
  const estimated = answered + remaining;
  const progress = estimated > 0 ? Math.round((answered / estimated) * 100) : 0;
  const ruledOutCount = currentQuestion.ruledOutCount || 0;
  const skippedCount = currentQuestion.skippedCount || 0;

  // Get ruled out conditions for display
  const ruledOutConditions = engineState?.ruledOutConditions
    ? Array.from(engineState.ruledOutConditions)
    : [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Assessment Progress Header */}
      <div className="text-center">
        <h1 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
          Assessment Progress
        </h1>
        <div className="mb-4 flex items-center justify-center gap-4 text-sm">
          <span className="text-muted-foreground font-medium">
            Question {answered + 1}
          </span>
          <span className="text-muted-foreground/30">•</span>
          <div className="h-2 max-w-[200px] flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="bg-primary h-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <Card className="border-2 border-slate-100 dark:border-slate-800">
        <CardContent className="p-6">
          {/* Question Text */}
          <h2 className="mb-6 text-lg leading-relaxed font-semibold">
            {currentQuestion.question}
          </h2>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.answers.length > 0 ? (
              currentQuestion.answers.map((answer, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAnswerClick(answer.value)}
                  disabled={isProcessing}
                  className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                    selectedAnswer === answer.value
                      ? 'border-primary bg-primary/10 scale-[0.98]'
                      : 'hover:border-primary/50 dark:hover:border-primary/50 border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                  } ${isProcessing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer active:scale-[0.98]'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{answer.value}</span>
                    {selectedAnswer === answer.value && (
                      <CheckCircle2 className="text-primary h-5 w-5" />
                    )}
                  </div>
                </button>
              ))
            ) : (
              /* Open-ended Question: Show Text Area */
              <div className="space-y-4">
                <textarea
                  className="ring-primary/20 min-h-[120px] w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium transition-all outline-none focus:ring-2 dark:border-slate-800 dark:bg-slate-900"
                  placeholder="Please describe here..."
                  value={selectedAnswer || ''}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  disabled={isProcessing}
                />
                <Button
                  size="lg"
                  className="h-14 w-full text-lg font-bold"
                  onClick={() => handleAnswerClick(selectedAnswer)}
                  disabled={
                    !selectedAnswer || selectedAnswer.trim().length === 0 || isProcessing
                  }
                >
                  {isProcessing ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={
                isProcessing ||
                !engineState ||
                (engineState.answeredQuestions?.length || 0) === 0
              }
              className="h-10 rounded-xl px-4"
            >
              Previous Question
            </Button>

            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={isProcessing}
              className="text-muted-foreground hover:text-foreground h-10 rounded-xl px-4"
            >
              <SkipForward className="mr-2 h-4 w-4" />
              Skip
            </Button>

            <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              Secure Assessment System
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Observation Summary */}
      {engineState?.redFlags?.length > 0 && (
        <Card className="border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-slate-400" />
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  Observations recorded for review
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Your notes and responses have been flagged for clinical review by the
                  therapist.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
