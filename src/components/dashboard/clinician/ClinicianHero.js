'use client';

import Link from 'next/link';
import { Activity, ChevronRight, Users } from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';

export default function ClinicianHero({ latestPatient }) {
  const statusLabel = 'Critical Review Needed';

  const title = latestPatient
    ? `Review: ${latestPatient.name}`
    : 'New Assessment Received';

  const description = latestPatient
    ? `${latestPatient.name} has submitted a new assessment for ${latestPatient.region}. AI indicates high risk levels.`
    : "Monitor your patients' recovery progress and review new assessment results as they arrive.";

  const buttonLabel = 'Open Case File';
  const href = latestPatient
    ? `/clinician/dashboard/case/${latestPatient.id}`
    : '/clinician/dashboard/patients';

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
                  Updated {new Date().toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
              <p className="text-primary-foreground/80 text-sm leading-relaxed">
                {description}
              </p>
              <div className="pt-2">
                <Link
                  href={href}
                  className="bg-secondary text-secondary-foreground border-primary hover:bg-primary/10 flex h-12 w-fit items-center justify-center rounded-lg border px-8 text-base font-bold transition-colors"
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
