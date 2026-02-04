'use client';

import { Card, CardContent } from '@/components/ui';
import {
  ArrowLeft,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Activity,
  ShieldCheck,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/cn';

const faqs = [
  {
    question: 'How do I start a new assessment?',
    answer:
      'Navigate to "New Assessment" from the sidebar or dashboard. Follow the guided questions to describe your symptoms. The AI analysis engine will provide preliminary recommendations based on established medical rules.',
  },
  {
    question: 'How accurate is the AI temporal diagnosis?',
    answer:
      'Our AI provides preliminary assessments based on clinical weighted rules. It is a powerful screening tool designed to support professional diagnosis. Your therapist will refine these outcomes during your clinical session.',
  },
  {
    question: 'Is my clinical data secure?',
    answer:
      'Yes, we implement AES-256 level encryption and international data residency protocols. Your medical history and biodata snapshots are accessible only to you and your authorized clinical support team.',
  },
  {
    question: 'How do I message my assigned therapist?',
    answer:
      'Use the secure Messages module in your dashboard. You can send text-based clinical updates or questions directly to your practitioner.',
  },
];

const contactOptions = [
  {
    title: 'Clinical Support',
    description: 'Direct medical assistance',
    icon: MessageCircle,
    color: 'blue',
    action: '/patient/messages',
  },
  {
    title: 'Email Protocol',
    description: 'cdssoau@gmail.com',
    icon: Mail,
    color: 'green',
    action: 'mailto:cdssoau@gmail.com',
  },
  {
    title: 'Urgent Desk',
    description: '+1 (800) CDSS-MSK',
    icon: Phone,
    color: 'purple',
    action: 'tel:+18001234567',
  },
  {
    title: 'Knowledge Base',
    description: 'Technical documentation',
    icon: FileText,
    color: 'yellow',
    action: '/docs/patient',
  },
];

const getColorClasses = (color) => {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    purple: 'bg-indigo-500/10 text-indigo-500',
    yellow: 'bg-amber-500/10 text-amber-600',
  };
  return colors[color] || 'bg-slate-500/10 text-slate-500';
};

export default function HelpSettingsPage() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="animate-fade-in mx-auto max-w-4xl space-y-12 pb-20">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-10 text-white shadow-2xl">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-0 h-full w-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent)]" />
          <div className="absolute bottom-0 left-0 h-full w-full bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.15),transparent)]" />
        </div>

        <div className="relative z-10 flex flex-col gap-6">
          <Link
            href="/patient/settings"
            className="group flex w-fit items-center gap-2 text-xs font-black tracking-widest text-white/40 uppercase transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Account Settings
          </Link>

          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              Help <span className="text-primary">&</span> Support
            </h1>
            <p className="max-w-md text-lg font-medium text-slate-400">
              Assistance protocols, clinical documentation, and direct support lines.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Discovery Area */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card className="border-border bg-card/50 rounded-[2rem] border shadow-sm backdrop-blur-xl">
          <CardContent className="p-8">
            <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-2xl">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Diagnostic Engine Help</h3>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Learn how clinical rules determine your preliminary assessment outcomes.
            </p>
            <button className="text-primary mt-6 text-xs font-black tracking-widest uppercase hover:underline">
              Explore Rules Library
            </button>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50 rounded-[2rem] border shadow-sm backdrop-blur-xl">
          <CardContent className="p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Security & Privacy</h3>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Find out how we protect your clinical data and medical history.
            </p>
            <button className="text-primary mt-6 text-xs font-black tracking-widest uppercase hover:underline">
              Privacy Protocols
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Support Channels */}
      <div className="space-y-6">
        <h2 className="text-sm font-black tracking-[0.2em] text-slate-400 uppercase">
          Support Channels
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {contactOptions.map((option) => {
            const Icon = option.icon;
            const isExternal =
              option.action.startsWith('mailto:') || option.action.startsWith('tel:');
            const isLink = isExternal || option.action.startsWith('/');

            const CardWrapper = ({ children }) => (
              <Card className="group hover:border-primary/30 rounded-2xl border-slate-100 bg-white transition-all hover:scale-[1.02] hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/50">
                <CardContent className="flex items-center gap-5 p-6">
                  <div
                    className={cn(
                      'rounded-2xl p-4 transition-transform group-hover:scale-110',
                      getColorClasses(option.color)
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="text-lg font-black tracking-tight">{option.title}</h3>
                    <p className="truncate text-sm font-medium text-slate-500">
                      {option.description}
                    </p>
                  </div>
                  {isExternal ? (
                    <ExternalLink className="group-hover:text-primary h-5 w-5 text-slate-300 transition-colors" />
                  ) : (
                    <ChevronRight className="group-hover:text-primary h-6 w-6 text-slate-300 transition-transform group-hover:translate-x-1" />
                  )}
                </CardContent>
              </Card>
            );

            if (isLink) {
              return (
                <Link key={option.title} href={option.action}>
                  <CardWrapper />
                </Link>
              );
            }

            return <CardWrapper key={option.title} />;
          })}
        </div>
      </div>

      {/* Technical FAQ */}
      <div className="space-y-6">
        <h2 className="text-sm font-black tracking-[0.2em] text-slate-400 uppercase">
          Common Inquiry Protocols
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className={cn(
                'overflow-hidden rounded-3xl border border-slate-100 bg-white transition-all dark:border-slate-900 dark:bg-slate-950',
                expandedFaq === index && 'ring-primary/20 scale-[1.01] ring-2'
              )}
            >
              <CardContent className="p-0">
                <button
                  className="flex w-full items-center justify-between p-6 text-left"
                  onClick={() => toggleFaq(index)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                        expandedFaq === index
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-slate-400'
                      )}
                    >
                      <HelpCircle className="h-4 w-4" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronRight
                    className={cn(
                      'h-6 w-6 text-slate-400 transition-transform',
                      expandedFaq === index && 'text-primary rotate-90'
                    )}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="border-t border-slate-50 bg-slate-50/50 px-6 py-5 dark:border-slate-900 dark:bg-slate-900/30">
                    <p className="text-lg leading-relaxed font-medium text-slate-500">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Still Lost? Footer */}
      <div className="flex flex-col items-center justify-center rounded-[3rem] border border-dashed border-slate-200 py-12 text-center dark:border-slate-800">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-900">
          <Search className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-bold">Unresolved Query?</h3>
        <p className="mt-1 text-sm font-medium text-slate-400">
          Try clinical keyword search or contact support directly.
        </p>
      </div>
    </div>
  );
}
