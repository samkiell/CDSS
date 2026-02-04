'use client';

import { useState } from 'react';
import useAssessmentStore from '@/store/assessmentStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Loader2,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Send,
  Edit3,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getAssessmentSummary,
  completeAssessment,
  prepareForAiAnalysis,
} from '@/lib/branching-assessment-engine';

/**
 * ASSESSMENT SUMMARY COMPONENT
 * =============================
 * Displays a full summary of all answered questions before AI analysis.
 *
 * TASK 4 IMPLEMENTATION:
 * - Shows all questions answered
 * - Displays patient responses
 * - Allows patient to review
 * - Requires confirmation before submission
 * - No diagnosis shown before patient confirmation
 *
 * TRACEABILITY:
 * This component generates the assessment trace that will be stored
 * for therapist review.
 */
export default function AssessmentSummary({ onSubmit, onEdit }) {
  const { selectedRegion, engineState, biodata, redFlags, setStep, setAssessmentTrace } =
    useAssessmentStore();

  const [isExpanded, setIsExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get summary from engine state
  const summary = engineState ? getAssessmentSummary(engineState) : null;

  /**
   * HANDLE SUBMIT FOR ANALYSIS
   * ===========================
   * Prepares the assessment data and sends for AI temporal diagnosis.
   * Creates an assessment trace for therapist review.
   */
  const handleSubmitForAnalysis = async () => {
    if (!engineState || !biodata) {
      toast.error('Missing assessment data. Please restart the assessment.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Complete the engine state and prepare for AI analysis
      const completedState = completeAssessment(engineState);
      const aiPayload = prepareForAiAnalysis(completedState, biodata);

      /**
       * ASSESSMENT TRACE
       * =================
       * Store the full trace for therapist review.
       * This includes:
       * - All questions and answers
       * - Condition likelihood analysis
       * - Red flags detected
       * - Rule-out decisions
       * - Timestamps for audit
       */
      const assessmentTrace = {
        region: selectedRegion,
        biodata,
        questionsAnswered: completedState.askedQuestions,
        conditionAnalysis: completedState.summary.rankedConditions,
        redFlags: completedState.redFlags,
        primarySuspicion: completedState.summary.primarySuspicion,
        differentialDiagnoses: completedState.summary.differentialDiagnoses,
        startedAt: completedState.startedAt,
        completedAt: completedState.completedAt,
        totalQuestions: completedState.askedQuestions.length,
      };

      setAssessmentTrace(assessmentTrace);

      // Call the parent onSubmit with prepared data
      if (onSubmit) {
        await onSubmit(aiPayload);
      }
    } catch (error) {
      console.error('Error preparing submission:', error);
      toast.error('Error preparing your assessment. Please try again.');
      setIsSubmitting(false);
    }
  };

  /**
   * HANDLE EDIT ANSWERS
   * ====================
   * Returns to the questions step to modify answers.
   * In current implementation, this resets the engine state.
   */
  const handleEditAnswers = () => {
    try {
      // Revert the last answer to un-complete the assessment and allow editing
      const prevState = previousQuestion(engineState);
      updateEngineState(prevState);
      setStep('questions');
      toast.info('Returning to assessment...');
    } catch (error) {
      console.error('Error returning to questions:', error);
      // Fallback: just try to go back
      setStep('questions');
    }

    if (onEdit) {
      onEdit();
    }
  };

  if (!summary) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto h-10 w-10 animate-spin" />
          <p className="text-muted-foreground mt-4">Loading summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Assessment Progress
        </h1>
        <p className="text-muted-foreground mt-2">
          You&apos;ve completed the required questions. Your responses have been recorded
          for review.
        </p>
      </div>

      {/* Biodata Summary */}
      <Card className="border-2 border-slate-100 dark:border-slate-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-full p-2">
              <User className="text-primary h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">{biodata?.fullName}</p>
              <p className="text-muted-foreground text-sm">
                {biodata?.sex} • {biodata?.ageRange} • {biodata?.occupation}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Region Info */}
      <Card className="border-2 border-slate-100 dark:border-slate-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <ClipboardList className="text-primary h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Assessment Region</p>
                <p className="text-primary text-sm font-semibold uppercase">
                  {summary.title || selectedRegion}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{summary.answeredCount}</p>
              <p className="text-muted-foreground text-xs">Questions Answered</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observations Summary */}
      {redFlags.length > 0 && (
        <Card className="border-2 border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-slate-400" />
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Assessment Notes Recorded
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  The following details have been highlighted for the reviewing therapist
                  to prioritize.
                </p>
                <ul className="mt-3 space-y-2">
                  {summary.redFlagsDetected.map((flag, index) => (
                    <li
                      key={index}
                      className="flex gap-2 text-sm font-medium text-slate-600 dark:text-slate-400"
                    >
                      <span className="text-slate-300">•</span>
                      {flag.redFlagText || flag.question}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions & Answers List */}
      <Card className="border-2 border-slate-100 dark:border-slate-800">
        <CardContent className="p-0">
          {/* Collapsible Header */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex w-full items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            <span className="font-medium">View All Answers</span>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>

          {/* Questions List */}
          {isExpanded && (
            <div className="divide-y divide-slate-100 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-800">
              {summary.questionsAnswered.map((qa, index) => (
                <div key={index} className="p-4">
                  <p className="text-muted-foreground text-sm">
                    {index + 1}. {qa.question}
                  </p>
                  <p className="mt-1 font-medium">
                    <CheckCircle2 className="mr-2 inline h-4 w-4 text-green-500" />
                    {qa.answer}
                  </p>
                  {/* Removed category tags per user request */}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handleEditAnswers}
          disabled={isSubmitting}
          className="flex-1"
        >
          <Edit3 className="mr-2 h-5 w-5" />
          Edit Answers
        </Button>
        <Button
          size="lg"
          onClick={handleSubmitForAnalysis}
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/90 flex-1 font-bold"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Submit for Review
            </>
          )}
        </Button>
      </div>

      {/* Disclaimer */}
      <p className="text-muted-foreground text-center text-xs">
        By submitting, you confirm that the information provided is accurate to the best
        of your knowledge. Your assessment will be reviewed by a qualified therapist.
      </p>
    </div>
  );
}
