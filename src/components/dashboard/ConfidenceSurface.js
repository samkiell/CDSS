import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { HelpCircle, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ConfidenceSurface({ aiAnalysis }) {
  if (!aiAnalysis) return null;

  const { confidenceScore, baseConfidence, temporalDiagnosis, reasoning, riskLevel } =
    aiAnalysis;

  // Data for Recharts
  const data = [
    {
      name: 'Base',
      value: baseConfidence || 0,
      fill: '#94a3b8', // Slate 400
    },
    {
      name: 'AI Refined',
      value: confidenceScore || 0,
      fill:
        confidenceScore > 80 ? '#22c55e' : confidenceScore < 50 ? '#f59e0b' : '#3b82f6', // Green, Amber, Blue
    },
  ];

  const isLowConfidence = confidenceScore < 50;

  return (
    <Card className="border-border/50 bg-card/50 h-full backdrop-blur-sm">
      <CardHeader className="relative pb-2">
        <div className="absolute top-4 right-4 animate-pulse">
          <Badge
            variant="outline"
            className="border-warning text-warning text-[10px] tracking-widest uppercase"
          >
            Provisional / Temporal
          </Badge>
        </div>
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          Diagnostic Surface
        </CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 items-center gap-6 md:grid-cols-2">
        {/* Confidence Ring */}
        <div className="relative flex h-48 w-full items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="100%"
              barSize={10}
              data={data}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                minAngle={15}
                background
                defaultCurvature={0} // Fix for potential recharts gltich
                dataKey="value"
                cornerRadius={10}
              />
            </RadialBarChart>
          </ResponsiveContainer>

          {/* Center Text */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={cn(
                'font-mono text-3xl font-bold',
                confidenceScore > 80
                  ? 'text-success'
                  : isLowConfidence
                    ? 'text-warning'
                    : 'text-primary'
              )}
            >
              {confidenceScore}%
            </span>
            <span className="text-muted-foreground text-xs tracking-wider uppercase">
              Confidence
            </span>
          </div>
        </div>

        {/* Diagnosis & Reasoning */}
        <div className="space-y-4">
          <div>
            <h3 className="text-muted-foreground mb-1 text-sm font-medium">
              Temporal Diagnosis
            </h3>
            <div className="text-foreground text-2xl leading-tight font-semibold">
              {temporalDiagnosis || 'Undetermined'}
            </div>
            {baseConfidence && (
              <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                Base Heuristic: {baseConfidence}%
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-muted-foreground flex items-center gap-1 text-xs font-semibold tracking-wider uppercase">
              Matched Criteria & Reasoning
            </h4>
            <div className="scrollbar-thin max-h-32 space-y-2 overflow-y-auto pr-2">
              {reasoning && reasoning.length > 0 ? (
                reasoning.map((reason, idx) => (
                  <div
                    key={idx}
                    className="bg-muted/40 border-border/30 flex gap-2 rounded-md border p-2 text-sm"
                  >
                    {reason.includes('Red Flag') ? (
                      <AlertTriangle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
                    ) : (
                      <CheckCircle className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    )}
                    <span
                      className={cn(
                        reason.includes('Red Flag')
                          ? 'text-destructive font-medium'
                          : 'text-foreground/90'
                      )}
                    >
                      {reason}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-sm italic">
                  No reasoning data available
                </div>
              )}
            </div>
          </div>

          {isLowConfidence && (
            <div className="bg-warning/10 text-warning border-warning/20 flex items-center gap-2 rounded-md border p-2 text-xs">
              <HelpCircle className="h-4 w-4" />
              <span>Low confidence: Missing pathognomonic criteria.</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
