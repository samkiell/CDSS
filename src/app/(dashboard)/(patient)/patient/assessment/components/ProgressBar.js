'use client';

import useAssessmentStore from '@/store/assessmentStore';

/**
 * PROGRESS BAR COMPONENT
 * =======================
 * Shows the patient's progress through the assessment flow.
 *
 * FLOW ORDER:
 * 1. biodata    → Patient confirms biodata (Step 0 - no bar shown yet)
 * 2. body-map   → Patient selects body region (Step 1)
 * 3. questions  → Dynamic branching questions
 * 4. summary    → Review all answers (Step 4)
 * 5. analyzing  → AI processing (Step 5)
 * 6. complete   → Confirmation (Step 6)
 */
export default function ProgressBar() {
  const { currentStep, engineState, biodataConfirmed } = useAssessmentStore();

  // Don't show progress bar during biodata confirmation (it's a pre-step)
  if (currentStep === 'biodata') return null;

  // Don't show on body-map if biodata not confirmed (shouldn't happen due to guardrails)
  if (!biodataConfirmed) return null;

  // Don't show on complete step
  if (currentStep === 'complete') return null;

  let progress = 0;
  let label = '';

  if (currentStep === 'body-map') {
    progress = 10;
    label = 'Select Body Region';
  } else if (currentStep === 'questions') {
    // Use engine state for accurate progress
    const answeredCount = engineState?.askedQuestions?.length || 0;
    const totalQuestions =
      engineState?.conditions?.reduce((sum, c) => sum + c.questions.length, 0) || 50; // Fallback estimate

    // Progress from 15% to 75% during questions
    progress = Math.min(15 + (answeredCount / totalQuestions) * 60, 75);
    label = `Question ${answeredCount + 1}`;
  } else if (currentStep === 'summary') {
    progress = 85;
    label = 'Review Your Answers';
  } else if (currentStep === 'analyzing') {
    progress = 95;
    label = 'AI Analysis in Progress';
  }

  return (
    <div className="mx-auto mb-12 w-full max-w-2xl">
      <div className="mb-2 flex items-end justify-between">
        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
          Your Assessment
        </span>
        <span className="text-primary text-sm font-bold">{label}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="bg-primary h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
