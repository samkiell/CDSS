'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { Activity, Ruler } from 'lucide-react';
import PainChart from './PainChart';

// Color scale for VAS
const getVasColor = (value) => {
  if (value < 4) return 'bg-success';
  if (value < 7) return 'bg-warning';
  return 'bg-destructive';
};

export default function ClinicalVitalWidgets({ vitals, painHistory }) {
  // Mock data handling if props are missing
  const vasScore = vitals?.vasScore ?? 0;
  const motorGrades = vitals?.motorGrades || [];
  const romData = vitals?.rom || [];

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-muted-foreground flex items-center justify-between text-sm font-medium tracking-wider uppercase">
            <span>Clinical Vitals</span>
            <Activity className="h-4 w-4" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* VAS Score Widget */}
          <div>
            <div className="mb-2 flex items-end justify-between">
              <span className="text-sm font-semibold">Pain Intensity (VAS)</span>
              <span
                className={cn(
                  'text-2xl font-bold',
                  getVasColor(vasScore).replace('bg-', 'text-')
                )}
              >
                {vasScore}
                <span className="text-muted-foreground text-sm font-normal">/10</span>
              </span>
            </div>
            <div className="bg-muted/50 relative flex h-4 overflow-hidden rounded-full">
              {/* Gradient background for scale context */}
              <div className="from-success via-warning to-destructive absolute inset-0 bg-gradient-to-r opacity-20"></div>
              <div
                className={cn(
                  'h-full rounded-r-full shadow-sm transition-all duration-500',
                  getVasColor(vasScore)
                )}
                style={{ width: `${(vasScore / 10) * 100}%` }}
              ></div>
            </div>
            <p className="text-muted-foreground mt-1 text-right text-xs">
              {vasScore === 0
                ? 'No Pain'
                : vasScore < 4
                  ? 'Mild'
                  : vasScore < 7
                    ? 'Moderate'
                    : 'Severe'}
            </p>
          </div>

          {/* Motor Grade (Oxford Scale 0-5) */}
          {motorGrades.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">Motor Grade</span>
                <Badge variant="outline" className="text-[10px]">
                  Oxford Scale
                </Badge>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {motorGrades.map((muscle, idx) => (
                  <div
                    key={idx}
                    className="bg-muted/30 border-border/30 flex items-center justify-between rounded-md border p-2 text-sm"
                  >
                    <span className="text-muted-foreground">{muscle.name}</span>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4, 5].map((grade) => (
                        <div
                          key={grade}
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded border text-[10px] font-bold transition-colors',
                            muscle.grade === grade
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background border-border text-muted-foreground opacity-50'
                          )}
                        >
                          {grade}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ROM Indicators */}
          {romData.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">Range of Motion</span>
                <Ruler className="text-muted-foreground h-4 w-4" />
              </div>
              <div className="flex flex-wrap gap-2">
                {romData.map((rom, idx) => (
                  <div
                    key={idx}
                    className="bg-muted/30 border-border/30 flex min-w-[120px] flex-1 flex-col items-center rounded-lg border p-3"
                  >
                    <span className="text-muted-foreground text-xs uppercase">
                      {rom.motion}
                    </span>
                    <span
                      className={cn(
                        'mt-1 text-xl font-bold',
                        rom.isRestricted ? 'text-destructive' : 'text-foreground'
                      )}
                    >
                      {rom.value}°
                    </span>
                    <span className="text-muted-foreground text-[10px] opacity-70">
                      Limit: {rom.normal}°
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historical Trend */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Progression History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PainChart history={painHistory} />
        </CardContent>
      </Card>
    </div>
  );
}
