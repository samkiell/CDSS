'use client';

import React, { useState } from 'react';
import SmartQueue from './SmartQueue';
import { cn } from '@/lib/cn';
import { Menu, Layout, X } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ClinicianDashboard({ patients = [] }) {
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [showQueueMobile, setShowQueueMobile] = useState(true);

  const selectedPatient = patients.find((p) => p._id === selectedPatientId);

  const handlePatientSelect = (patient) => {
    setSelectedPatientId(patient._id);
    // On mobile, hide queue after selection to show details
    if (window.innerWidth < 768) {
      setShowQueueMobile(false);
    }
  };

  return (
    <div className="bg-background relative flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Mobile Queue Toggle (Only visible on small screens when viewing details) */}
      {!showQueueMobile && selectedPatient && (
        <div className="absolute top-4 left-4 z-50 md:hidden">
          <Button variant="outline" size="sm" onClick={() => setShowQueueMobile(true)}>
            <Menu className="mr-2 h-4 w-4" />
            Show Queue
          </Button>
        </div>
      )}

      {/* Left Panel: Smart Queue */}
      <div
        className={cn(
          'border-border bg-card/30 absolute z-40 h-full w-full flex-shrink-0 border-r transition-transform duration-300 md:relative md:w-80 lg:w-96',
          showQueueMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <SmartQueue
          patients={patients}
          selectedPatientId={selectedPatientId}
          onSelectPatient={handlePatientSelect}
        />

        {/* Mobile Close Button */}
        <div className="absolute top-2 right-2 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setShowQueueMobile(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right Panel: Patient Details (The "Essence" View) */}
      <div className="bg-background/50 relative flex h-full flex-1 flex-col overflow-hidden">
        {selectedPatient ? (
          <div className="h-full overflow-y-auto p-6">
            {/* Placeholder for DetailedPatientView */}
            <div className="mx-auto max-w-4xl space-y-6">
              <header>
                <h1 className="text-foreground text-2xl font-bold">
                  {selectedPatient.fullName}
                </h1>
                <p className="text-muted-foreground">{selectedPatient.chiefComplaint}</p>
              </header>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* We will build these widgets next */}
                <div className="border-border text-muted-foreground bg-muted/20 flex items-center justify-center rounded-lg border border-dashed p-10">
                  Diagnostic Confidence Surface Placeholder
                </div>
                <div className="border-border text-muted-foreground bg-muted/20 flex items-center justify-center rounded-lg border border-dashed p-10">
                  Clinical Vitals Placeholder
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center">
            <Layout className="mb-4 h-16 w-16 opacity-20" />
            <p className="text-lg font-medium">Select a patient to review</p>
            <p className="text-sm opacity-60">High priority cases are marked in red</p>
          </div>
        )}
      </div>
    </div>
  );
}
