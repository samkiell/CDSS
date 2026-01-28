'use client';

import React from 'react';
import { Play, Info, Activity, ChevronRight } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { cn } from '@/lib/cn';

export default function SelfTestPage() {
  const tests = [
    {
      id: 'leg-raise',
      title: 'Leg Raise Tests',
      category: 'Lumbar / Hip',
      purpose:
        'Check nerve tension by lifting the leg while lying flat; strengthen core and hip muscles that support the lower back.',
      instructions: [
        'Lie flat on your back on a firm surface.',
        'Ensure both legs are straight and the toes are pointing upward.',
        'Slowly raise one leg to about 45 degrees.',
        'Observe whether you experience pain, tingling or numbness.',
        'Note the angle at which the pain begins (e.g., 30, 45, 60 degrees).',
        'Slowly lower the leg back down and repeat for the other side.',
      ],
      image: '/leg_raise_demonstration.png',
      premium: true,
    },
    {
      id: 'neck-rotation',
      title: 'Neck Rotation Tests',
      category: 'Cervical',
      purpose:
        'Check nerve tension and mobility in the cervical spine to identify potential nerve root compression or muscle stiffness.',
      instructions: [
        'Sit upright with your shoulders relaxed and back straight.',
        'Slowly turn your head to the right as far as comfortable.',
        'Hold for 2 seconds, then slowly return to the center.',
        'Repeat the movement to the left side.',
        'Observe any catching sensations, sharp pain, or radiation into the arms.',
        'Perform 5 repetitions on each side.',
      ],
      image: '/neck_rotation_medical_diagram.png',
      premium: true,
    },
    {
      id: 'arm-raise',
      title: 'Arm Raise Test',
      category: 'Shoulder / Cervical',
      purpose:
        'Check for nerve tension and upper extremity mobility mentioned in your assessment instructions.',
      instructions: [
        'Stand or sit upright with your arms at your sides.',
        'Slowly lift one arm out to the side and then up towards your head.',
        'Keep your elbow straight and palm facing forward.',
        'Lower the arm slowly and repeat with the other side.',
        'Note if pain occurs at a specific height or if you feel tingling in your fingers.',
      ],
      image: '/arm_raise_medical_diagram.png',
      premium: true,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase italic dark:text-white">
          Guided Self-Tests
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg font-medium">
          Follow these structured clinical movements. Your responses help our AI refine
          your diagnosis and recovery plan.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-12">
        {tests.map((test) => (
          <div key={test.id} className="group relative">
            <div className="from-primary/20 absolute -inset-1 rounded-[3rem] bg-gradient-to-r to-blue-500/20 opacity-25 blur transition duration-1000 group-hover:opacity-50 group-hover:duration-200"></div>
            <Card className="bg-card relative overflow-hidden rounded-[2.5rem] border-none shadow-xl">
              <div className="flex flex-col lg:flex-row">
                {/* Visual Section */}
                <div className="relative aspect-video shrink-0 bg-white lg:aspect-auto lg:w-[450px]">
                  <img
                    src={test.image}
                    alt={test.title}
                    className="absolute inset-0 h-full w-full object-contain p-8 transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* This is where the generated images would be displayed */}
                  <div className="relative z-10 flex h-full w-full flex-col items-center justify-center p-8 text-center text-white/60">
                    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-transform duration-500 group-hover:scale-110">
                      <Play className="ml-2 h-10 w-10 fill-white" />
                    </div>
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-50">
                      Instructional Video Loading
                    </span>
                  </div>

                  <Badge className="absolute top-8 left-8 rounded-full border-white/10 bg-black/40 px-5 py-2 text-[10px] font-black tracking-widest text-white uppercase backdrop-blur-md">
                    {test.category}
                  </Badge>
                </div>

                {/* Content Section */}
                <div className="flex-1 space-y-10 p-10 lg:p-14">
                  <div className="space-y-4">
                    <h2 className="text-foreground text-3xl font-black tracking-tight uppercase italic">
                      {test.title}
                    </h2>
                    <div className="flex items-start gap-4">
                      <div className="bg-primary h-6 w-1 shrink-0 rounded-full" />
                      <p className="text-muted-foreground text-base leading-relaxed font-medium">
                        {test.purpose}
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/20 border-border/50 space-y-6 rounded-[2rem] border p-8">
                    <h3 className="text-primary mb-6 text-[10px] font-black tracking-[0.2em] uppercase">
                      Execution Steps
                    </h3>
                    <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
                      {test.instructions.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-5">
                          <span className="bg-primary shadow-primary/20 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[10px] font-black text-white shadow-lg">
                            {idx + 1}
                          </span>
                          <p className="text-foreground/80 text-sm leading-relaxed font-bold">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                    <Button className="bg-primary shadow-primary/30 group h-16 flex-1 rounded-2xl text-sm font-black tracking-widest text-white uppercase shadow-2xl transition-all hover:brightness-110 active:scale-95">
                      Start Assessment
                      <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button
                      variant="outline"
                      className="hover:bg-muted h-16 rounded-2xl border-2 px-10 text-sm font-black tracking-widest uppercase transition-all"
                    >
                      Clinical Details
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="flex flex-col items-center justify-between gap-8 rounded-[2.5rem] bg-[#1e293b] p-10 text-white md:flex-row">
        <div className="flex items-center gap-6">
          <div className="rounded-2xl bg-white/10 p-4">
            <Info className="text-primary h-8 w-8" />
          </div>
          <div>
            <h4 className="text-lg font-black uppercase italic">Need Clinical Help?</h4>
            <p className="text-sm font-medium text-gray-400">
              If you experience sharp, shooting pain during these tests, please STOP
              immediately and contact your assigned clinician.
            </p>
          </div>
        </div>
        <Button className="h-14 shrink-0 rounded-xl bg-white px-10 text-[10px] font-black tracking-widest text-gray-900 uppercase">
          Contact Therapist
        </Button>
      </div>
    </div>
  );
}
