'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MEDICAL_RULES, BODY_REGIONS } from '@/constants/medicalRules';
import useAssessmentStore from '@/store/assessmentStore';
import * as Icons from 'lucide-react';

export default function BodyMapPicker() {
  const selectRegion = useAssessmentStore((state) => state.selectRegion);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Where is your pain located?
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Select the primary region of discomfort to begin your assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {BODY_REGIONS.map((region) => {
          const Icon = Icons[region.icon] || Icons.Activity;
          return (
            <Card
              key={region.id}
              className="hover:border-primary group cursor-pointer transition-all"
              onClick={() =>
                selectRegion(region.id, MEDICAL_RULES[region.id].startQuestionId)
              }
            >
              <CardContent className="flex flex-col items-center justify-center space-y-4 py-10">
                <div className="group-hover:bg-primary rounded-full bg-blue-50 p-4 transition-colors group-hover:text-white dark:bg-slate-800">
                  <Icon size={32} className="text-primary group-hover:text-white" />
                </div>
                <span className="text-lg font-semibold">{region.name}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
