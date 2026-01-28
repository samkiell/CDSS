'use client';

import React from 'react';
import {
  HelpCircle,
  BookOpen,
  MessageSquare,
  FileText,
  PlayCircle,
  ShieldQuestion,
  Search,
  ChevronRight,
  Stethoscope,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';

export default function AdminHelpPage() {
  const sections = [
    {
      title: 'Triage Management',
      icon: <Activity />,
      items: [
        'How to assign clinicians to urgent cases',
        'Managing the pending review pipeline',
        'Understanding risk level escalation',
      ],
    },
    {
      title: 'Heuristic Engine',
      icon: <Stethoscope />,
      items: [
        'Updating weighted matching parameters',
        'Adding new diagnostic modules',
        'Clinical whitepaper integration',
      ],
    },
    {
      title: 'User Governance',
      icon: <ShieldQuestion />,
      items: [
        'Verifying clinician medical licenses',
        'Resetting MFA for platform members',
        'Account suspension protocols',
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-12 pb-20">
      <header className="bg-card border-border flex flex-col justify-between gap-6 rounded-[3rem] border p-10 shadow-sm lg:flex-row lg:items-center">
        <div className="flex items-center gap-6">
          <div className="bg-primary/10 text-primary shrink-0 rounded-2xl p-4">
            <HelpCircle className="h-8 w-8" />
          </div>
          <div>
            <h1 className="mb-1 text-3xl font-black tracking-tighter uppercase italic">
              Admin Support Portal
            </h1>
            <p className="text-muted-foreground font-medium">
              Comprehensive documentation and resources for managing the CDSS healthcare
              ecosystem.
            </p>
          </div>
        </div>
        <div className="relative w-full lg:w-96">
          <Search className="text-muted-foreground absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documentation..."
            className="bg-muted/30 h-14 w-full rounded-2xl pr-4 pl-12 text-xs font-bold focus:outline-none"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section, idx) => (
          <Card
            key={idx}
            className="bg-card group rounded-[2.5rem] border-none shadow-sm transition-all hover:shadow-xl"
          >
            <CardHeader className="p-8 pb-4">
              <div className="bg-primary/10 text-primary group-hover:bg-primary mb-4 flex h-12 w-12 items-center justify-center rounded-2xl transition-colors group-hover:text-white">
                {section.icon}
              </div>
              <CardTitle className="text-lg font-black tracking-tight uppercase italic">
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-8 pt-0">
              <div className="flex flex-col gap-3">
                {section.items.map((item, i) => (
                  <button
                    key={i}
                    className="text-muted-foreground hover:text-primary group/item flex items-center justify-between text-left text-sm font-medium transition-colors"
                  >
                    {item}
                    <ChevronRight className="h-4 w-4 opacity-0 transition-all group-hover/item:translate-x-1 group-hover/item:opacity-100" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative flex flex-col items-center gap-12 overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0f172a] p-12 text-white shadow-2xl lg:flex-row">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <BookOpen className="h-64 w-64 rotate-12" />
        </div>
        <div className="relative z-10 flex-1 space-y-6">
          <Badge className="bg-primary rounded-full border-none px-4 py-1.5 text-[10px] font-black tracking-[0.2em] text-white uppercase">
            Live Training
          </Badge>
          <h2 className="text-4xl leading-none font-black tracking-tighter uppercase italic">
            CDSS Administrator <br /> Academy is Live
          </h2>
          <p className="max-w-xl font-medium text-gray-400">
            Watch technical walkthroughs on managing the diagnostic engine and optimizing
            patient triage workflows.
          </p>
          <div className="flex gap-4">
            <Button className="h-14 gap-2 rounded-2xl bg-white px-10 text-xs font-black tracking-widest text-gray-900 uppercase hover:brightness-110">
              <PlayCircle className="h-5 w-5" />
              Watch Video
            </Button>
            <Button
              variant="outline"
              className="h-14 rounded-2xl border-white/10 px-10 text-xs font-black tracking-widest text-white uppercase hover:bg-white/5"
            >
              View Whitepapers
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
