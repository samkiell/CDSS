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
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of using the CDSS platform.',
    icon: <BookOpen className="h-6 w-6 text-blue-500" />,
    articles: [
      {
        id: 'overview',
        title: 'Clinician Dashboard Overview',
        content:
          'Navigate the main dashboard, interpret patient statistics, and access quick actions for your daily workflow.',
        readTime: '3 min read',
      },
      {
        id: 'profile-setup',
        title: 'Setting up your profile',
        content:
          'Manage your professional details, clinical specializations, and availability schedule to ensure accurate patient matching.',
        readTime: '5 min read',
      },
      {
        id: 'first-patient',
        title: 'Adding your first patient',
        content:
          'Step-by-step guide to onboarding a new patient, entering initial symptoms, and assigning a treatment plan.',
        readTime: '4 min read',
      },
    ],
  },
  {
    id: 'diagnostic-engine',
    title: 'Diagnostic Engine',
    description: 'Understand how the rule-based engine works.',
    icon: <Stethoscope className="h-6 w-6 text-purple-500" />,
    articles: [
      {
        id: 'weighted-matching',
        title: 'How weighted matching works',
        content:
          'The engine uses a heuristic algorithm to match reported symptoms against known clinical patterns. Each symptom carries a specific weight.',
        readTime: '6 min read',
      },
      {
        id: 'confidence-scores',
        title: 'Interpreting confidence scores',
        content:
          'Confidence scores indicate the correlation strength between reported symptoms and a diagnosis. >80% suggests a strong match.',
        readTime: '3 min read',
      },
      {
        id: 'refining-diagnosis',
        title: 'Refining a diagnosis',
        content:
          'How to use manual overrides and additional clinical notes to refine the AI-suggested diagnostic output.',
        readTime: '5 min read',
      },
    ],
  },
  {
    id: 'patient-management',
    title: 'Patient Management',
    description: 'Tools for tracking and managing patient care.',
    icon: <Activity className="h-6 w-6 text-green-500" />,
    articles: [
      {
        id: 'viewing-history',
        title: 'Viewing patient history',
        content:
          'Access comprehensive logs of past sessions, treatment progress, and archived diagnostic reports.',
        readTime: '2 min read',
      },
      {
        id: 'medical-records',
        title: 'Uploading medical records',
        content:
          'Securely upload external documents like MRI scans, X-rays, and previous referral letters to a patient profile.',
        readTime: '4 min read',
      },
      {
        id: 'treatment-plans',
        title: 'Managing Treatment Plans',
        content:
          'Create, modify, and track adherence to prescribed rehabilitation and recovery programs.',
        readTime: '7 min read',
      },
    ],
  },
  {
    id: 'security-compliance',
    title: 'Security & Compliance',
    description: 'Data protection and regulatory information.',
    icon: <ShieldCheck className="h-6 w-6 text-indigo-500" />,
    articles: [
      {
        id: 'data-privacy',
        title: 'Patient Data Privacy',
        content:
          'Overview of encryption standards (AES-256) and HIPAA/GDPR compliance measures implemented in CDSS.',
        readTime: '4 min read',
      },
      {
        id: 'session-security',
        title: 'Managing Active Sessions',
        content:
          'How to use the Security Settings to monitor active logins and remotely log out suspicious devices.',
        readTime: '3 min read',
      },
    ],
  },
];

const RESOURCES = [];

const FAQS = [
  {
    question: 'How accurate is the diagnostic engine?',
    answer:
      'The heuristic engine uses a weighted matching paradigm based on established clinical patterns. While highly reliable for screening, it is designed to support, not replace, clinical judgment.',
  },
  {
    question: "Can I customize a patient's treatment plan?",
    answer:
      'Yes, the Treatment Planner tool allows you to modify suggested plans or create entirely new ones based on your clinical assessment.',
  },
  {
    question: 'Is patient data secure?',
    answer:
      'All data is encrypted in transit and at rest. We comply with standard healthcare data protection regulations to ensure patient privacy.',
  },
  {
    question: 'How do I reset my 2FA?',
    answer:
      'Navigate to Settings > Security. If you have lost access to your device, please contact support immediately for identity verification.',
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

    // deeply filter categories and articles
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
    <div className="space-y-12">
      {/* Search & Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-700 p-8 text-center text-white shadow-xl md:p-12">
        <div className="absolute top-0 left-0 h-full w-full bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="relative z-10 mx-auto max-w-3xl space-y-6">
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            How can we help you?
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-medium text-indigo-100">
            Find answers, expert guides, and technical documentation to help you support
            your patients.
          </p>

          <div className="group relative mx-auto max-w-xl">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
              <Search className="h-5 w-5 text-indigo-300 transition-colors group-focus-within:text-indigo-500" />
            </div>
            <Input
              placeholder="Search for articles, guides, or error codes..."
              className="text-foreground placeholder:text-muted-foreground h-16 rounded-2xl border-none bg-white/95 pl-12 text-base font-semibold shadow-lg transition-all placeholder:font-medium focus:bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Sidebar / Filters (Desktop) */}
        <div className="hidden space-y-6 lg:col-span-3 lg:block">
          <div className="sticky top-24">
            <h3 className="mb-4 px-2 text-lg font-bold">Categories</h3>
            <div className="space-y-1">
              <Button
                variant={activeCategory === 'all' ? 'secondary' : 'ghost'}
                className="w-full justify-start rounded-xl font-semibold"
                onClick={() => setActiveCategory('all')}
              >
                All Topics
              </Button>
              {KNOWLEDGE_BASE.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? 'secondary' : 'ghost'}
                  className="text-muted-foreground hover:text-foreground w-full justify-start rounded-xl font-medium"
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.title}
                </Button>
              ))}
            </div>

            {RESOURCES.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-4 px-2 text-lg font-bold">Official Docs</h3>
                <div className="space-y-3">
                  {RESOURCES.map((doc) => (
                    <a
                      key={doc.name}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:bg-muted hover:border-border group flex items-center gap-3 rounded-xl border border-transparent p-3 transition-colors"
                    >
                      <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="group-hover:text-primary truncate text-sm font-bold transition-colors">
                          {doc.name}
                        </p>
                        <p className="text-muted-foreground text-[10px] font-bold uppercase">
                          {doc.type} • {doc.size}
                        </p>
                      </div>
                      <Download className="text-muted-foreground h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="space-y-10 lg:col-span-9">
          {filteredContent.length > 0 ? (
            filteredContent.map((category) => (
              <div
                key={category.id}
                className="animate-in fade-in slide-in-from-bottom-4 space-y-4 duration-500"
              >
                <div className="mb-2 flex items-center gap-3">
                  <div className="bg-muted rounded-xl p-2">{category.icon}</div>
                  <div>
                    <h2 className="text-xl font-bold">{category.title}</h2>
                    <p className="text-muted-foreground text-sm font-medium">
                      {category.description}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {category.articles.map((article) => (
                    <Card
                      key={article.id}
                      className="group border-border hover:border-primary/50 cursor-pointer rounded-2xl transition-all hover:shadow-md"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="group-hover:text-primary text-lg leading-tight font-bold transition-colors">
                            {article.title}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="shrink-0 text-[10px] font-bold uppercase"
                          >
                            {article.readTime}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mt-3 line-clamp-3 text-sm leading-relaxed">
                          {article.content}
                        </p>
                        <div className="text-primary mt-4 flex translate-y-2 transform items-center text-xs font-bold tracking-widest uppercase opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                          Read Article <ChevronRight className="ml-1 h-3 w-3" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
              <Search className="text-muted-foreground mb-4 h-16 w-16 opacity-50" />
              <h3 className="text-xl font-bold">No results found</h3>
              <p className="text-muted-foreground">Try adjusting your search terms</p>
            </div>
          )}

          {/* FAQs Section - Only show when not searching or if relevant */}
          {!searchQuery && (
            <div className="border-t pt-8">
              <h2 className="mb-8 text-2xl font-bold">Frequently Asked Questions</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {FAQS.map((faq, i) => (
                  <div
                    key={i}
                    className="bg-card rounded-2xl border p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <h3 className="mb-3 flex items-start gap-3 font-bold">
                      <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground pl-8 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Support CTA */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-center text-white shadow-2xl md:p-12">
        <div className="animate-blob absolute top-0 right-0 rounded-full bg-blue-500 p-32 opacity-20 mix-blend-overlay blur-3xl filter"></div>
        <div className="animate-blob animation-delay-2000 absolute bottom-0 left-0 rounded-full bg-purple-500 p-32 opacity-20 mix-blend-overlay blur-3xl filter"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-6 rounded-full bg-white/10 p-4 backdrop-blur-sm">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>

          <h2 className="mb-4 text-3xl font-black tracking-tight">Still need support?</h2>
          <p className="mb-8 max-w-lg text-lg font-medium text-slate-300">
            Our clinical support team is available 24/7 to assist you with technical
            issues or complicated diagnostic cases.
          </p>
          <Button className="h-14 rounded-2xl bg-white px-10 text-lg font-bold text-slate-900 shadow-lg transition-colors hover:bg-indigo-50 hover:shadow-xl">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
