'use client';

import Link from 'next/link';
import { Activity, ChevronRight } from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';
import useAssessmentStore from '@/store/assessmentStore';
import { useEffect, useState } from 'react';

export default function AssessmentHero({ latestSession }) {
  const { selectedRegion, currentStep } = useAssessmentStore();
  const [isDraftActive, setIsDraftActive] = useState(false);

  useEffect(() => {
    // Check if there's a local draft in progress
    // If selectedRegion exists and we aren't at the body-map step, it's a draft
    if (selectedRegion && currentStep !== 'body-map' && currentStep !== 'complete') {
      setIsDraftActive(true);
    } else {
      setIsDraftActive(false);
    }
  }, [selectedRegion, currentStep]);

  // Determine status and labels
  const isInProgress = isDraftActive || latestSession?.sessionStatus === 'in_progress';

  const statusLabel = isInProgress ? 'Assessment in progress' : 'Assessment Result';

  const title = isInProgress
    ? 'Continue Your Assessment'
    : latestSession?.aiAnalysis?.temporalDiagnosis || 'Start a New Assessment';

  const description = isInProgress
    ? 'Finish your assessment to get a comprehensive diagnostic report and personalized treatment plan.'
    : 'Track your symptoms and complete daily check-ins to monitor your recovery journey effectively.';

  const buttonLabel = isInProgress ? 'Continue Assessment' : 'Start New Assessment';

  // Logic for the link: If continuing a draft, don't use ?new=true
  const href = isInProgress ? '/patient/assessment' : '/patient/assessment?new=true';

  return (
    <Card className="bg-primary text-primary-foreground overflow-hidden">
      <CardContent className="p-0">
        <div className="relative p-8">
          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-md space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-white/20 bg-white/20 text-white"
                >
                  {statusLabel}
                </Badge>
                <span className="text-xs text-white/60">
                  Updated{' '}
                  {latestSession
                    ? new Date(latestSession.updatedAt).toLocaleDateString()
                    : 'recently'}
                </span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
              <p className="text-primary-foreground/80 text-sm leading-relaxed">
                {description}
              </p>
              <div className="pt-2">
                <Link
                  href={href}
                  className="bg-secondary text-secondary-foreground border-primary hover:bg-primary/10 flex h-12 items-center justify-center rounded-lg border px-8 text-base font-bold transition-colors"
                >
                  {buttonLabel}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="hidden opacity-20 lg:block">
              <Activity className="h-40 w-40" />
            </div>
          </div>
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 -mt-32 -mr-32 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
        </div>
      </CardContent>
    </Card>
  );
}
