'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Stethoscope, ClipboardCheck, Plus } from 'lucide-react';

const ACTION_MAPPING = {
  'Lumbar Disc Herniation': [
    { title: 'Straight Leg Raise (SLR) Test', type: 'Physical Exam' },
    { title: 'Slump Test', type: 'Physical Exam' },
  ],
  'Suspected Cauda Equina Syndrome': [
    { title: 'Urgent MRI Lumbar Spine', type: 'Imaging' },
    { title: 'Anal Tone Assessment', type: 'Physical Exam' },
  ],
  'Achilles Tendon Rupture': [
    { title: "Thompson's Test (Simmonds' Triad)", type: 'Physical Exam' },
    { title: 'Matles Test', type: 'Physical Exam' },
  ],
  'Cervical Disc Herniation': [
    { title: "Spurling's Test", type: 'Physical Exam' },
    { title: 'Upper Limb Tension Test', type: 'Physical Exam' },
  ],
  'Knee Osteoarthritis': [
    { title: 'Weight-bearing X-Ray', type: 'Imaging' },
    { title: 'Range of Motion Assessment', type: 'Physical Exam' },
  ],
};

export default function DecisionSupportActions({ diagnosis, onLogResult }) {
  const actions = ACTION_MAPPING[diagnosis] || [
    { title: 'Comprehensive Physical Exam', type: 'General' },
  ];

  const [loggingId, setLoggingId] = useState(null);

  const handleLogClick = (idx) => {
    // In a real app, this would open a modal or expanded form
    setLoggingId(idx);
    setTimeout(() => {
      setLoggingId(null);
      if (onLogResult) onLogResult(actions[idx].title, 'Positive'); // Mock result
    }, 1000);
  };

  return (
    <Card className="border-border/50 bg-card/50 h-full backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium tracking-wider uppercase">
          <Stethoscope className="h-4 w-4" />
          Recommended Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, idx) => (
          <div
            key={idx}
            className="border-border/40 bg-background/50 hover:bg-background flex items-center justify-between rounded-lg border p-3 transition-colors"
          >
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{action.title}</span>
              <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
                {action.type}
              </span>
            </div>
            <Button
              size="sm"
              variant={loggingId === idx ? 'outline' : 'default'} // Visual feedback
              className="h-8 gap-1"
              onClick={() => handleLogClick(idx)}
              disabled={loggingId !== null}
            >
              {loggingId === idx ? (
                <>
                  <ClipboardCheck className="h-3 w-3 animate-pulse" />
                  Logging...
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" />
                  Log Result
                </>
              )}
            </Button>
          </div>
        ))}

        <div className="border-border/30 border-t pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-8 w-full text-xs"
          >
            View Full Protocol
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
