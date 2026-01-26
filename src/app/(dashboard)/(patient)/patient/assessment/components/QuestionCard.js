'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MEDICAL_RULES } from '@/constants/medicalRules';
import useAssessmentStore from '@/store/assessmentStore';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

export default function QuestionCard() {
  const {
    selectedRegion,
    currentQuestionId,
    answerQuestion,
    goBack,
    responses,
    redFlags,
  } = useAssessmentStore();

  const resetAssessment = useAssessmentStore((state) => state.resetAssessment);

  if (!selectedRegion || !currentQuestionId) return null;

  const regionRules = MEDICAL_RULES[selectedRegion];
  const question = regionRules?.questions?.[currentQuestionId];

  // If question doesn't exist, we might have reached the end or logic is missing
  if (!question) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-primary/10 mb-6 flex h-20 w-20 items-center justify-center rounded-full">
          <AlertCircle className="text-primary" size={40} />
        </div>
        <h2 className="text-2xl font-black">Assessment Logic Pending</h2>
        <p className="text-muted-foreground mt-2 max-w-xs">
          The questionnaire for the <strong>{selectedRegion}</strong> region is currently
          being finalized.
        </p>
        <div className="mt-8 flex gap-4">
          <Button variant="outline" onClick={resetAssessment}>
            Choose Another Region
          </Button>
        </div>
      </div>
    );
  }

  const handleAnswer = (option) => {
    answerQuestion(currentQuestionId, option.text, option.next, option.tags || []);
  };

  return (
    <Card className="mx-auto w-full max-w-2xl border-none bg-transparent shadow-none">
      <CardHeader className="px-0">
        <div className="mb-4 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="p-0 hover:bg-transparent"
          >
            <ChevronLeft size={20} />
            <span className="ml-1 text-xs font-bold tracking-wider uppercase">
              Previous
            </span>
          </Button>
        </div>
        <CardTitle className="text-3xl leading-tight font-bold text-slate-900 dark:text-white">
          {question.text}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 py-8">
        <div className="grid grid-cols-1 gap-4">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(option)}
              className={cn(
                'flex items-center justify-between rounded-2xl border-2 p-5 text-left transition-all',
                'hover:border-primary hover:bg-blue-50/50 dark:hover:bg-slate-800/50',
                'border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900',
                responses[currentQuestionId] === option.text &&
                  'border-primary bg-blue-50 dark:bg-slate-800'
              )}
            >
              <span className="text-lg font-semibold">{option.text}</span>
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full border-2',
                  responses[currentQuestionId] === option.text
                    ? 'border-primary bg-primary'
                    : 'border-slate-200 dark:border-slate-700'
                )}
              >
                {responses[currentQuestionId] === option.text && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>
            </button>
          ))}
        </div>
      </CardContent>

      {redFlags.length > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 shrink-0 text-red-500" size={20} />
          <div>
            <h4 className="text-sm font-bold tracking-wider text-red-800 uppercase">
              Clinical Alert
            </h4>
            <p className="mt-1 text-sm text-red-700">
              Some of your symptoms may require immediate attention. Our AI will flag
              these for your clinician.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
