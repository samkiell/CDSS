'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  MessageCircle,
  FileText,
  ChevronRight,
  HelpCircle,
  Download,
  ExternalLink,
  Stethoscope,
  ShieldCheck,
  Activity,
  Calendar,
} from 'lucide-react';
import { Input, Card, CardContent, Button, Badge } from '@/components/ui';
import { cn } from '@/lib/cn';

// Enhanced content based on project context
const KNOWLEDGE_BASE = [
  {
    id: 'clinical-workflow',
    title: 'Clinical Workflow',
    description: 'Optimize your patient journey and diagnostic path.',
    icon: <Stethoscope className="h-6 w-6 text-blue-500" />,
    articles: [
      {
        id: 'overview',
        title: 'Heuristic Assessment Logic',
        content:
          'Deep dive into the branching engine logic. Understand how responses trigger rule-outs and likelihood increases based on regional patterns.',
        readTime: '5 min read',
      },
      {
        id: 'traceability',
        title: 'Audit-Ready Traceability',
        content:
          'Every diagnostic data point is snapshotted. Learn how to access the full Q&A log and AI reasoning for medical documentation.',
        readTime: '4 min read',
      },
      {
        id: 'guided-testing',
        title: 'Clinician-Guided Testing',
        content:
          'How to perform and record physical tests within the CDSS to refine preliminary AI diagnoses into definitive clinical outcomes.',
        readTime: '6 min read',
      },
    ],
  },
  {
    id: 'engine-mechanics',
    title: 'Engine Mechanics',
    description: 'Technical details of the CDSS reasoning engine.',
    icon: <Activity className="h-6 w-6 text-purple-500" />,
    articles: [
      {
        id: 'red-flags',
        title: 'Red Flag Protocols',
        content:
          'How the engine identifies and flags clinical red flags for immediate intervention. Follow the suggested urgent review protocols.',
        readTime: '3 min read',
      },
      {
        id: 'confidence-scores',
        title: 'Interpreting AI Confidence',
        content:
          'Confidence scores are derived from mathematical correlation. Learn the clinical threshold for various diagnostic suspicions.',
        readTime: '3 min read',
      },
      {
        id: 'rule-ingestion',
        title: 'Medical Rule Libraries',
        content:
          'Our rules are ingested from peer-reviewed MSK journals. Learn about the regional JSON structures for Ankle, Lumbar, and Shoulder.',
        readTime: '7 min read',
      },
    ],
  },
  {
    id: 'patient-data',
    title: 'Patient Data & Privacy',
    description: 'GDPR/HIPAA compliant data management.',
    icon: <ShieldCheck className="h-6 w-6 text-emerald-500" />,
    articles: [
      {
        id: 'biodata-snapshots',
        title: 'Biodata Snapshot Integrity',
        content:
          'Understand why we snapshot patient biodata per assessment. This ensures historical clinical accuracy even if patient profiles change.',
        readTime: '4 min read',
      },
      {
        id: 'encryption',
        title: 'Data Security Standards',
        content:
          'Overview of our AES-256 encryption at rest and TLS 1.3 in transit. Your patient records are secured to international standards.',
        readTime: '5 min read',
      },
    ],
  },
  {
    id: 'platform-training',
    title: 'Platform Training',
    description: 'Master the CDSS interface and features.',
    icon: <BookOpen className="h-6 w-6 text-amber-500" />,
    articles: [
      {
        id: 'dashboard-mastery',
        title: 'Clinician Hub Overview',
        content:
          'Master the new clinician dashboard. Track active assessments, pending reviews, and urgent case files from a single pane.',
        readTime: '3 min read',
      },
      {
        id: 'treatment-planning',
        title: 'Advanced Treatment Planner',
        content:
          'Create complex treatment plans with exercise regimens and physiotherapy protocols tailored to diagnostic outcomes.',
        readTime: '6 min read',
      },
    ],
  },
];

const RESOURCES = [
  { name: 'Clinician User Manual', type: 'PDF', size: '2.4 MB', url: '#' },
  { name: 'MSK Rule Book (V4)', type: 'DOCX', size: '1.8 MB', url: '#' },
  { name: 'Patient Integration Guide', type: 'PDF', size: '920 KB', url: '#' },
];

const FAQS = [
  {
    question: 'How do I override an AI preliminary diagnosis?',
    answer:
      'The AI diagnosis is temporal. You can finalize any diagnosis in the Clinician Review section of the case file after performing physical tests.',
  },
  {
    question: 'Are my clinical notes shared with the patient?',
    answer:
      'By default, clinical impressions are kept for clinician review. You can choose to share summary highlights in the patient-facing plan.',
  },
  {
    question: 'How often are the medical rules updated?',
    answer:
      'We update our regional JSON rule libraries quarterly or when new clinical breakthroughs in MSD are verified by our oversight board.',
  },
  {
    question: 'Is the system cloud or local based?',
    answer:
      'CDSS is a secure cloud platform, ensuring you have real-time access to patient assessments across any clinic location.',
  },
];

export default function HelpCenterClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredContent = useMemo(() => {
    if (!searchQuery) {
      if (activeCategory === 'all') return KNOWLEDGE_BASE;
      return KNOWLEDGE_BASE.filter((cat) => cat.id === activeCategory);
    }

    const lowerQuery = searchQuery.toLowerCase();

    return KNOWLEDGE_BASE.map((cat) => ({
      ...cat,
      articles: cat.articles.filter(
        (article) =>
          article.title.toLowerCase().includes(lowerQuery) ||
          article.content.toLowerCase().includes(lowerQuery)
      ),
    })).filter(
      (cat) =>
        cat.title.toLowerCase().includes(lowerQuery) ||
        cat.description.toLowerCase().includes(lowerQuery) ||
        cat.articles.length > 0
    );
  }, [searchQuery, activeCategory]);

  return (
    <div className="space-y-16 pb-20">
      {/* Search & Hero with Premium Glassmorphism */}
      <div className="relative overflow-hidden rounded-[3rem] bg-slate-950 p-12 text-center text-white shadow-2xl md:p-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="bg-primary/10 absolute top-[-20%] left-[-10%] h-[70%] w-[70%] rounded-full blur-[120px]" />
          <div className="absolute right-[-10%] bottom-[-20%] h-[70%] w-[70%] rounded-full bg-blue-600/10 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl space-y-8">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2 backdrop-blur-md">
            <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
            <span className="text-xs font-black tracking-widest text-white/70 uppercase">
              CDSS Support Center
            </span>
          </div>

          <h1 className="text-5xl font-black tracking-tight md:text-7xl">
            Knowledge for{' '}
            <span className="from-primary bg-gradient-to-r to-blue-400 bg-clip-text text-transparent">
              Better Care.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-xl font-medium text-slate-400">
            Access exhaustive clinical guides, technical rule documentation, and
            operational help.
          </p>

          <div className="group relative mx-auto mt-12 max-w-2xl">
            <div className="pointer-events-none absolute inset-y-0 left-6 flex items-center">
              <Search className="group-focus-within:text-primary h-6 w-6 text-slate-500 transition-colors" />
            </div>
            <Input
              placeholder="Search clinical protocols, rules, or guides..."
              className="focus:border-primary/50 focus:ring-primary/20 h-20 rounded-[2rem] border-white/10 bg-white/5 pl-16 text-lg font-bold text-white shadow-2xl backdrop-blur-2xl transition-all placeholder:font-medium placeholder:text-slate-500 focus:bg-white/10 focus:ring-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-16 px-2 lg:grid-cols-12">
        {/* Sidebar / Filters (Desktop) */}
        <div className="hidden space-y-8 lg:col-span-3 lg:block">
          <div className="sticky top-28 space-y-12">
            <div className="space-y-4">
              <h3 className="text-sm font-black tracking-widest text-slate-400 uppercase">
                Knowledge Categories
              </h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold transition-all',
                    activeCategory === 'all'
                      ? 'bg-primary shadow-primary/20 scale-105 text-white shadow-lg'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
                  )}
                >
                  <Activity className="h-4 w-4" />
                  All Case Support
                </button>
                {KNOWLEDGE_BASE.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold transition-all',
                      activeCategory === cat.id
                        ? 'bg-slate-900 text-white shadow-lg dark:bg-white dark:text-slate-900'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
                    )}
                  >
                    <span className="shrink-0">{cat.icon}</span>
                    {cat.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-black tracking-widest text-slate-400 uppercase">
                Clinical Downloads
              </h3>
              <div className="space-y-3">
                {RESOURCES.map((res) => (
                  <button
                    key={res.name}
                    className="group hover:border-primary/50 hover:bg-primary/5 flex w-full items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left transition-all dark:border-slate-800"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white">
                      <Download className="h-5 w-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-black">{res.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        {res.type} • {res.size}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="space-y-16 lg:col-span-9">
          {filteredContent.length > 0 ? (
            filteredContent.map((category) => (
              <div
                key={category.id}
                className="animate-in fade-in slide-in-from-bottom-6 duration-700"
              >
                <div className="mb-8 flex items-end justify-between border-b border-slate-100 pb-6 dark:border-slate-900">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-2xl shadow-inner">
                      {category.icon}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">
                        {category.title}
                      </h2>
                      <p className="text-lg font-medium text-slate-500">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="h-8 rounded-full border-slate-200 px-4 text-xs font-bold text-slate-400 dark:border-slate-800"
                  >
                    {category.articles.length} articles
                  </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {category.articles.map((article) => (
                    <div
                      key={article.id}
                      className="group hover:border-primary/20 cursor-pointer rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm transition-all hover:bg-slate-50 hover:shadow-xl dark:border-slate-900 dark:bg-slate-950 dark:hover:bg-slate-900/50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="group-hover:text-primary text-xl font-black tracking-tight transition-colors">
                          {article.title}
                        </h3>
                        <span className="shrink-0 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                          {article.readTime}
                        </span>
                      </div>
                      <p className="mt-4 line-clamp-3 text-base leading-relaxed font-medium text-slate-500">
                        {article.content}
                      </p>
                      <div className="text-primary mt-8 flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase opacity-0 transition-all duration-300 group-hover:opacity-100">
                        Explore Methodology <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900">
                <Search className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-black">Clinical Search Exhausted</h3>
              <p className="mt-2 text-lg font-medium text-slate-500">
                Try clinical keywords like "branching", "MSK", or "red flag"
              </p>
              <Button
                variant="outline"
                className="mt-8 h-12 rounded-xl"
                onClick={() => setSearchQuery('')}
              >
                Clear Search Parameters
              </Button>
            </div>
          )}

          {/* FAQs Section */}
          {!searchQuery && (
            <div className="space-y-12 rounded-[3rem] bg-slate-50 p-12 dark:bg-slate-900/50">
              <div className="text-center">
                <h2 className="text-4xl font-black tracking-tight">Clinical FAQ</h2>
                <p className="mt-2 text-lg font-medium text-slate-500">
                  Quick answers for established practitioners.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {FAQS.map((faq, i) => (
                  <div
                    key={i}
                    className="flex flex-col justify-between rounded-3xl bg-white p-8 shadow-sm transition-all hover:shadow-md dark:bg-slate-950"
                  >
                    <div>
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 dark:bg-indigo-900/30">
                        <HelpCircle className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg leading-tight font-black">{faq.question}</h3>
                      <p className="mt-4 text-sm leading-relaxed font-medium text-slate-500">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Extreme Support CTA */}
      <div className="group relative mx-2 overflow-hidden rounded-[3.5rem] bg-slate-950 p-12 text-center text-white shadow-2xl md:p-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-0 h-full w-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.2),transparent)] transition-all duration-700 group-hover:scale-110" />
          <div className="absolute bottom-0 left-0 h-full w-full bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.2),transparent)] transition-all duration-700 group-hover:scale-110" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 shadow-2xl backdrop-blur-3xl">
            <MessageCircle className="text-primary h-10 w-10" />
          </div>

          <h2 className="max-w-xl text-4xl font-black tracking-tight md:text-6xl">
            Unresolved <span className="text-primary">Clinical Context?</span>
          </h2>

          <p className="mt-6 max-w-2xl text-xl font-medium text-slate-400">
            Our medical oversight team is standing by to help with diagnostic logic or
            technical platform issues.
          </p>

          <div className="mt-12 flex flex-col items-center gap-6 sm:flex-row">
            <Button
              size="lg"
              className="h-16 rounded-2xl bg-white px-12 text-lg font-extrabold text-slate-950 shadow-xl transition-all hover:scale-105 hover:bg-slate-100"
            >
              Contact Practitioner Support
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="ring-primary/20 h-10 w-10 rounded-full border-2 border-slate-950 bg-slate-800 ring-2"
                  />
                ))}
              </div>
              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                4 Clinicians Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
