import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  Activity,
} from 'lucide-react';

const RISK_CONFIG = {
  Urgent: {
    label: 'High Priority',
    color: 'destructive', // Red
    icon: AlertTriangle,
    sortWeight: 3,
  },
  Moderate: {
    label: 'Medium Priority',
    color: 'warning', // Amber/Yellow
    icon: Activity,
    sortWeight: 2,
  },
  Low: {
    label: 'Routine',
    color: 'success', // Green
    icon: CheckCircle2,
    sortWeight: 1,
  },
};

export default function SmartQueue({
  patients = [],
  onSelectPatient,
  selectedPatientId,
}) {
  // Sort patients by Risk Level (Urgent > Moderate > Low) then by Confidence Score (Low confidence first? or High? Usually low confidence might need more attention, but high confidence with high risk is also important.
  // The prompt says "prioritizes patients based on... risk analysis".
  // Let's sort by Risk DESC, then Submission Time (Mocked) or Confidence?
  // Let's stick to Risk Level as primary.
  const sortedPatients = useMemo(() => {
    return [...patients].sort((a, b) => {
      const riskA = RISK_CONFIG[a.aiAnalysis?.riskLevel || 'Low'].sortWeight;
      const riskB = RISK_CONFIG[b.aiAnalysis?.riskLevel || 'Low'].sortWeight;

      if (riskA !== riskB) return riskB - riskA; // Higher risk first

      // Secondary sort: Confidence Score (Lower confidence might need more review time, but maybe Higher confidence is "Quick Win"?
      // Let's sort by Date Desc (Newest first) as secondary for now if dates exist, otherwise Name
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });
  }, [patients]);

  return (
    <Card className="border-border/50 bg-card/50 flex h-full flex-col overflow-hidden shadow-sm backdrop-blur-sm">
      <CardHeader className="border-border/40 border-b px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <div className="bg-primary/10 rounded-md p-1.5">
              <Activity className="text-primary h-4 w-4" />
            </div>
            Smart Queue
            <Badge variant="secondary" className="ml-2 h-5 font-mono text-[10px]">
              {patients.length}
            </Badge>
          </CardTitle>
          <div className="flex gap-1">{/* Filter/Sort controls could go here */}</div>
        </div>
      </CardHeader>
      <CardContent className="scrollbar-thin scrollbar-thumb-muted-foreground/20 flex-1 overflow-y-auto p-0">
        {sortedPatients.length === 0 ? (
          <div className="text-muted-foreground flex h-40 flex-col items-center justify-center text-sm">
            <CheckCircle2 className="mb-2 h-8 w-8 opacity-20" />
            <p>No active cases</p>
          </div>
        ) : (
          <div className="divide-border/30 divide-y">
            {sortedPatients.map((patient) => {
              const risk = patient.aiAnalysis?.riskLevel || 'Low';
              const config = RISK_CONFIG[risk];
              const RiskIcon = config.icon;
              const isSelected = selectedPatientId === patient._id;

              return (
                <button
                  key={patient._id}
                  onClick={() => onSelectPatient(patient)}
                  className={cn(
                    'hover:bg-muted/40 group relative w-full border-l-4 border-transparent p-4 text-left transition-all duration-200',
                    isSelected ? 'bg-muted/60 border-primary' : 'border-l-transparent'
                  )}
                >
                  <div className="mb-1 flex items-start justify-between">
                    <h3
                      className={cn(
                        'truncate pr-2 text-sm font-semibold',
                        isSelected ? 'text-primary' : 'text-foreground'
                      )}
                    >
                      {patient.fullName || `${patient.firstName} ${patient.lastName}`}
                    </h3>
                    <Badge
                      variant={config.color}
                      className="h-5 shrink-0 px-1.5 py-0 text-[10px]"
                    >
                      {config.label}
                    </Badge>
                  </div>

                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                      {patient.aiAnalysis?.temporalDiagnosis || 'Undiagnosed'}
                    </span>

                    {patient.aiAnalysis?.confidenceScore && (
                      <span
                        className={cn(
                          'rounded-full border px-1.5 text-[10px]',
                          patient.aiAnalysis.confidenceScore > 80
                            ? 'border-success/30 text-success'
                            : patient.aiAnalysis.confidenceScore < 50
                              ? 'border-warning/30 text-warning'
                              : 'border-muted text-muted-foreground'
                        )}
                      >
                        {patient.aiAnalysis.confidenceScore}% Match
                      </span>
                    )}
                  </div>

                  <div className="text-muted-foreground/70 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      {patient.chiefComplaint || 'No complaint recorded'}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10px] opacity-70">
                      <Clock className="h-3 w-3" />
                      {new Date(patient.updatedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Hover Action */}
                  <div className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                    <MoreHorizontal className="text-muted-foreground h-4 w-4" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
