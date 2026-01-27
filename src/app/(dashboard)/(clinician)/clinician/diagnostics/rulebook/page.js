import React from 'react';
import {
  ClipboardList,
  ChevronRight,
  Activity,
  Stethoscope,
  Info,
  ShieldCheck,
  Search,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { cn } from '@/lib/cn';

export default function ClinicalRulebookPage() {
  const regions = [
    {
      name: 'Lumbar Region',
      tests: [
        { name: 'Lasegue’s Test (SLR)', purpose: 'For Sciatica/Disc Herniation.' },
        { name: 'Bragard Test', purpose: 'Modification of SLR with dorsiflexion.' },
        { name: 'Bowstring Test', purpose: 'Popliteal compression for sciatic nerve.' },
        {
          name: 'Femoral Nerve Stretch Test',
          purpose: 'For anterior thigh pain (Wasserman sign).',
        },
        { name: 'Kernig Test', purpose: 'For meningeal/nerve root irritation.' },
        { name: 'Milgram Test', purpose: 'Intrathecal pressure test.' },
        {
          name: 'Bicycle Stress Test',
          purpose: 'Differentiates neurogenic vs. vascular claudication.',
        },
        { name: 'Two-stage Treadmill Test', purpose: 'For Spinal Stenosis.' },
        { name: 'Lumbar Extension-Loading Test', purpose: 'For Spinal Stenosis.' },
        { name: 'Modified Schober’s Test', purpose: 'For Ankylosing Spondylitis (ROM).' },
        {
          name: 'Lateral Lumbar Flexion',
          purpose: 'For Ankylosing Spondylitis (Fingertip to Floor).',
        },
      ],
    },
    {
      name: 'Ankle Region',
      tests: [
        { name: 'Thompson’s (Simmond’s) Test', purpose: 'For Achilles Tendon Rupture.' },
        { name: 'Talar Tilt Test', purpose: 'For Calcaneofibular/ATFL ligament injury.' },
        { name: 'Anterior Drawer Test', purpose: 'For ATFL tear.' },
        { name: 'Squeeze Test', purpose: 'For Syndesmosis injury (High ankle sprain).' },
        { name: 'Tinel’s Sign', purpose: 'For Tarsal Tunnel Syndrome.' },
        { name: 'Dorsiflexion-Eversion Test', purpose: 'For Tarsal Tunnel Syndrome.' },
      ],
    },
    {
      name: 'Cervical Region',
      tests: [
        {
          name: 'Spurling’s Test',
          purpose: 'For Cervical Radiculitis/Nerve root compression.',
        },
        { name: 'Cervical Distraction Test', purpose: 'Relief test for radiculopathy.' },
      ],
    },
    {
      name: 'Shoulder Region',
      tests: [
        { name: 'Painful Arc Test', purpose: 'For Impingement Syndrome (SIS).' },
        { name: 'Neer Impingement Sign', purpose: 'For Subacromial Impingement.' },
        { name: 'Hawkins-Kennedy Test', purpose: 'For Anterolateral impingement.' },
        { name: 'Jobe’s Test', purpose: 'For Supraspinatus irritation.' },
        { name: 'Empty Can Test', purpose: 'For Supraspinatus tear/weakness.' },
        { name: 'Infraspinatus Test', purpose: 'For Infraspinatus tear.' },
        { name: 'Belly Press Test', purpose: 'For Subscapularis tear.' },
        { name: 'Lift-Off Test', purpose: 'For Subscapularis weakness.' },
        { name: 'Lag Sign / Drop Sign', purpose: 'For Rotator Cuff tears.' },
        { name: 'Speed’s Test', purpose: 'For Bicipital Tendinitis.' },
        { name: 'Yergason’s Test', purpose: 'For Bicipital Tendinitis.' },
        { name: 'O’Brien’s Test', purpose: 'For SLAP Lesions.' },
        { name: 'Apprehension Test', purpose: 'For Shoulder Instability/Subluxation.' },
        { name: 'Fulcrum’s Test', purpose: 'For Shoulder Instability.' },
        { name: 'Drawer’s Test', purpose: 'For Shoulder Instability.' },
      ],
    },
    {
      name: 'Elbow Region',
      tests: [
        { name: 'Maudsley’s Test', purpose: 'For Lateral Epicondylitis (Tennis Elbow).' },
        { name: 'Cozen’s Test', purpose: 'For Lateral Epicondylitis.' },
        { name: 'Mill’s Sign', purpose: 'For Lateral Epicondylitis.' },
        { name: 'Valgus Stress Test', purpose: 'For Medial Ligament Injury.' },
        { name: 'O’Driscoll’s Hook Test', purpose: 'For Distal Biceps Tendon Avulsion.' },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-10 pb-20">
      <header className="bg-card border-border flex flex-col gap-6 rounded-[3rem] border p-10 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-6">
          <div className="bg-primary/10 text-primary shrink-0 rounded-2xl p-4">
            <BookOpen className="h-8 w-8" />
          </div>
          <div>
            <h1 className="mb-1 text-3xl font-black tracking-tighter uppercase italic">
              Clinical Heuristic Rulebook
            </h1>
            <p className="text-muted-foreground max-w-xl font-medium">
              Comprehensive repository of confirmatory physical tests used by the MSK
              Heuristic Engine for automated validation.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-14 gap-2 rounded-2xl px-6 font-bold">
            <Search className="h-4 w-4" />
            Search Library
          </Button>
          <Button className="bg-primary shadow-primary/20 h-14 rounded-2xl px-8 text-xs font-black tracking-widest text-white uppercase shadow-lg">
            View Whitepapers
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-12">
        {regions.map((region, idx) => (
          <section key={idx} className="space-y-6">
            <div className="flex items-center gap-4 px-4">
              <h2 className="text-foreground shrink-0 text-xl font-black tracking-widest uppercase italic">
                {region.name}
              </h2>
              <div className="bg-border h-px flex-1" />
              <Badge
                variant="outline"
                className="bg-muted/30 rounded-full px-4 py-1 text-[10px] font-black tracking-[0.2em] uppercase"
              >
                {region.tests.length} Tests
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {region.tests.map((test, tIdx) => (
                <Card
                  key={tIdx}
                  className="group bg-card overflow-hidden rounded-[2rem] border-none shadow-sm transition-all hover:shadow-md"
                >
                  <CardContent className="p-8">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary flex h-10 w-10 items-center justify-center rounded-xl transition-colors">
                        <Activity className="h-5 w-5" />
                      </div>
                      <ArrowRight className="text-muted-foreground h-4 w-4 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                    </div>
                    <h3 className="text-foreground mb-2 text-base leading-tight font-black">
                      {test.name}
                    </h3>
                    <p className="text-muted-foreground text-xs leading-relaxed font-medium opacity-80">
                      {test.purpose}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="bg-primary/5 border-primary/20 flex flex-col items-center gap-8 rounded-[2.5rem] border p-10 text-center md:flex-row md:text-left">
        <div className="bg-primary flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <div className="flex-1">
          <h4 className="mb-1 text-lg font-black tracking-tighter uppercase">
            Clinical Accuracy Guarantee
          </h4>
          <p className="text-muted-foreground text-sm font-medium italic">
            All tests listed above are pulled from vetted technical whitepapers and mapped
            to the AI diagnostic engine for real-time verification.
          </p>
        </div>
        <Button className="bg-foreground text-background h-14 rounded-xl px-10 text-[10px] font-black tracking-widest uppercase hover:brightness-110">
          Download PDF PDF
        </Button>
      </div>
    </div>
  );
}
