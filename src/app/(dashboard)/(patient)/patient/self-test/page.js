'use client';

import React from 'react';
import { Play, Info, Activity } from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';
import { cn } from '@/lib/cn';

export default function SelfTestPage() {
  const tests = [
    {
      id: 'leg-raise',
      title: 'Leg Raise Tests',
      category: 'Lumbar / Hip',
      purpose:
        'Leg raises help check nerve tension and strengthen the core and hip muscles that support the lower back, reducing pressure and improving stability.',
      instructions: [
        'Lie flat on your back on a firm surface.',
        'Ensure both legs are straight and the toes are pointing upward.',
        'Slowly raise one leg to about 45 degrees.',
        'Observe whether you experience pain, tingling or numbness.',
        'Note the angle at which the pain begins (e.g., 30, 45, 60 degrees).',
        'Slowly lower the leg back down and repeat for the other side.',
      ],
      image: '/leg_raise_demonstration.png', // I'll use the path where it would be served if moved to public, but for now I'll use a placeholder or the actual generated path if I can
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
      image: '/neck_rotation_demonstration.png',
      premium: true,
    },
    {
      id: 'arm-raise',
      title: 'Arm Raise Test',
      category: 'Shoulder / Cervical',
      purpose:
        'Assess nerve tension and functional mobility in the upper extremities to detect impingement or nerve irritation.',
      instructions: [
        'Stand or sit upright with your arms at your sides.',
        'Slowly lift one arm out to the side and then up towards your head.',
        'Keep your elbow straight and palm facing forward.',
        'Lower the arm slowly and repeat with the other side.',
        'Note if pain occurs at a specific height or if you feel tingling in your fingers.',
      ],
      image: '/shoulder_mobility_demonstration.png',
      premium: true,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tighter text-gray-900 uppercase dark:text-white">
          Guided Self-Tests
        </h1>
        <p className="text-muted-foreground font-medium">
          Follow these clinical movements to help us understand your condition and provide
          an accurate diagnosis.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {tests.map((test) => (
          <Card
            key={test.id}
            className="bg-card overflow-hidden rounded-[2.5rem] border-none shadow-md"
          >
            <div className="flex flex-col lg:flex-row">
              {/* Image/Video Section */}
              <div className="relative aspect-video shrink-0 bg-slate-900 lg:aspect-square lg:w-[400px]">
                {/* Background Image Placeholder - using the generated medical illustrations */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4 text-white/20">
                    <Activity className="h-16 w-16" />
                    <span className="text-[10px] font-bold tracking-widest uppercase">
                      Clinical Visualization
                    </span>
                  </div>
                </div>

                {/* Play Overlay */}
                <div className="group absolute inset-0 flex cursor-pointer items-center justify-center bg-black/20 transition-all hover:bg-black/40">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-transform group-hover:scale-110">
                    <Play className="ml-1 h-8 w-8 fill-white text-white" />
                  </div>
                </div>

                <Badge className="bg-primary absolute top-6 left-6 rounded-full border-none px-4 py-1.5 text-[10px] font-black tracking-widest text-white uppercase">
                  {test.category}
                </Badge>
              </div>

              {/* Content Section */}
              <div className="flex-1 space-y-8 p-8 lg:p-12">
                <div>
                  <h2 className="text-foreground mb-4 text-2xl font-black tracking-tight uppercase">
                    {test.title}
                  </h2>
                  <div className="bg-muted/30 flex items-start gap-3 rounded-2xl p-4">
                    <Info className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                    <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                      <span className="text-foreground mb-1 block text-[10px] font-bold tracking-widest uppercase">
                        Purpose
                      </span>
                      {test.purpose}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-muted-foreground mb-4 text-xs font-black tracking-widest uppercase">
                    Step-by-Step Instructions
                  </h3>
                  <div className="grid grid-cols-1 gap-x-12 gap-y-4 md:grid-cols-2">
                    {test.instructions.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-4">
                        <span className="bg-primary/10 text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black">
                          {idx + 1}
                        </span>
                        <p className="text-foreground/80 text-sm leading-snug font-medium">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-border flex gap-4 border-t pt-4">
                  <button className="bg-primary shadow-primary/20 h-14 flex-1 rounded-2xl text-sm font-black tracking-widest text-white uppercase shadow-lg transition-all hover:brightness-110 active:scale-95">
                    Start Virtual Test
                  </button>
                  <button className="border-border text-foreground hover:bg-muted h-14 rounded-2xl border-2 px-8 text-sm font-black tracking-widest uppercase transition-all">
                    Save for Later
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
