'use client';

import useAssessmentStore from '@/store/assessmentStore';
import { MEDICAL_RULES } from '@/constants/medicalRules';

export default function ProgressBar() {
  const { currentStep, history, selectedRegion } = useAssessmentStore();

  if (currentStep === 'body-map') return null;

  // Simple heuristic for progress during questioning
  // In a real logic tree, total length is variable, so we estimate based on average path
  let progress = 0;
  let label = '';

  if (currentStep === 'questions') {
    const historyLength = history.length;
    // Assume average assessment is ~15 questions
    progress = Math.min((historyLength / 15) * 100, 90);
    label = `Question ${historyLength + 1} of ~15`;
  } else if (currentStep === 'upload') {
    progress = 95;
    label = 'Supporting Documents';
  } else if (currentStep === 'summary') {
    progress = 100;
    label = 'Ready to Submit';
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
