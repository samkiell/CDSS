import React from 'react';
import {
  ClipboardList,
  Settings2,
  Plus,
  Search,
  ChevronRight,
  Activity,
  FileText,
  Stethoscope,
} from 'lucide-react';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { cn } from '@/lib/cn';

export default function AdminDiagnosticsPage() {
  const diagnosticModules = [
    { title: 'Lumbar Pain Screener', questions: 12, status: 'Active', region: 'Lumbar' },
    {
      title: 'Cervical Posture Diagnostic',
      questions: 9,
      status: 'Active',
      region: 'Cervical',
    },
    { title: 'Ankle Stability Test', questions: 8, status: 'Draft', region: 'Ankle' },
    {
      title: 'Shoulder Mobility Screener',
      questions: 11,
      status: 'Active',
      region: 'Shoulder',
    },
    {
      title: 'Leg Raise Tests (Clinical)',
      questions: 14,
      status: 'Review',
      region: 'Lumbar',
    },
    { title: 'Knee Pain Assessment', questions: 1, status: 'Active', region: 'Knee' },
  ];

  return (
    <div className="space-y-10 pb-12">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase dark:text-white">
            Guided Diagnostics
          </h2>
          <p className="font-medium text-gray-500">
            Configure AI diagnostic heuristics and assessment flows for clinicians.
          </p>
        </div>
        <Button className="bg-primary shadow-primary/20 h-12 gap-2 rounded-2xl px-6 font-black tracking-widest text-white uppercase shadow-lg transition-all">
          <Plus className="h-5 w-5" />
          Create Module
        </Button>
      </header>

      {/* Control Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search diagnostic modules..."
            className="border-border bg-card focus:ring-primary/20 h-14 w-full rounded-2xl pr-4 pl-12 text-sm font-medium focus:ring-2 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-14 gap-2 rounded-2xl px-6 font-bold">
            <Settings2 className="h-4 w-4" />
            Global Settings
          </Button>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {diagnosticModules.map((module, i) => (
          <Card
            key={i}
            className="group bg-card overflow-hidden rounded-[2rem] border-none shadow-sm transition-all hover:shadow-md"
          >
            <CardContent className="p-0">
              <div className="flex flex-col">
                <div className="p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="bg-primary/10 text-primary rounded-xl p-3">
                      <Activity className="h-6 w-6" />
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase',
                        module.status === 'Active'
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                          : module.status === 'Draft'
                            ? 'border-slate-500/20 bg-slate-500/10 text-slate-600'
                            : 'border-warning/20 bg-warning/10 text-warning'
                      )}
                    >
                      {module.status}
                    </Badge>
                  </div>

                  <h3 className="text-foreground group-hover:text-primary mb-2 text-lg font-black transition-colors">
                    {module.title}
                  </h3>

                  <div className="text-muted-foreground flex items-center gap-4 text-xs font-bold tracking-widest uppercase">
                    <span className="flex items-center gap-1.5">
                      <Stethoscope className="h-3.5 w-3.5" />
                      {module.region}
                    </span>
                    <span className="bg-border h-1 w-1 rounded-full" />
                    <span>{module.questions} Questions</span>
                  </div>
                </div>

                <div className="bg-muted/30 border-border mt-auto flex items-center justify-between border-t p-6">
                  <button className="text-primary text-[10px] font-black tracking-widest uppercase hover:underline">
                    Edit Flow
                  </button>
                  <ChevronRight className="text-muted-foreground h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Technical Configuration Section */}
      <section className="pt-8">
        <div className="mb-6">
          <h3 className="text-xl font-black tracking-tight text-gray-900 uppercase dark:text-white">
            Heuristic Engine Configuration
          </h3>
          <p className="text-sm font-medium text-gray-500">
            Manage the clinical confirmatory tests and weighted matching patterns.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card className="group relative overflow-hidden rounded-[2.5rem] border-none bg-[#111827] p-10 text-white">
            <div className="absolute top-0 right-0 p-8 opacity-10 transition-opacity group-hover:opacity-20">
              <ClipboardList className="h-32 w-32" />
            </div>
            <div className="relative z-10">
              <h4 className="mb-4 text-2xl font-black tracking-tighter uppercase">
                Clinical Rulebook
              </h4>
              <p className="mb-8 max-w-sm text-sm font-medium text-gray-400">
                Define the clinical validation levels for regions like Lumbar, Cervical,
                and Shoulder.
              </p>
              <Button className="h-12 rounded-xl bg-white px-10 text-[10px] font-black tracking-widest text-gray-900 uppercase hover:bg-gray-100">
                Open Engine
              </Button>
            </div>
          </Card>

          <Card className="bg-primary group relative overflow-hidden rounded-[2.5rem] border-none p-10 text-white">
            <div className="absolute top-0 right-0 p-8 opacity-10 transition-opacity group-hover:opacity-20">
              <FileText className="h-32 w-32" />
            </div>
            <div className="relative z-10">
              <h4 className="mb-4 text-2xl font-black tracking-tighter uppercase">
                Diagnostic Whitepapers
              </h4>
              <p className="mb-8 max-w-sm text-sm font-medium text-white/80">
                Review and update the technical documentation powering the AI matching
                engine.
              </p>
              <Button className="text-primary h-12 rounded-xl bg-white px-10 text-[10px] font-black tracking-widest uppercase hover:bg-gray-100">
                Manage Whitepapers
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
