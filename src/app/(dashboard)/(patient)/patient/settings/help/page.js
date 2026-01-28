'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui';
import {
  ArrowLeft,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  ChevronRight,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const faqs = [
  {
    question: 'How do I start a new assessment?',
    answer:
      'Navigate to "New Assessment" from the sidebar or dashboard. Follow the guided questions to describe your symptoms. The AI will analyze your responses and provide recommendations.',
  },
  {
    question: 'How accurate is the AI diagnosis?',
    answer:
      'Our AI provides preliminary assessments based on your symptoms. It is designed to support, not replace, professional medical advice. Always consult with a healthcare provider for definitive diagnosis and treatment.',
  },
  {
    question: 'How do I contact my clinician?',
    answer:
      'Use the Messages section in the sidebar to send secure messages to your assigned clinician. You can also view their contact information in your appointment details.',
  },
  {
    question: 'Can I view my past assessments?',
    answer:
      'Yes! Go to the Progress section to view all your past assessments, diagnoses, and treatment progress over time.',
  },
  {
    question: 'How do I update my profile information?',
    answer:
      'Navigate to Settings > Profile Settings to update your personal information, contact details, and profile picture.',
  },
  {
    question: 'Is my health data secure?',
    answer:
      'Yes, we take data security seriously. All your health information is encrypted and stored securely in compliance with healthcare data protection regulations.',
  },
];

const contactOptions = [
  {
    title: 'Live Chat',
    description: 'Chat with our support team',
    icon: MessageCircle,
    color: 'blue',
    action: 'Coming soon',
  },
  {
    title: 'Email Support',
    description: 'cdssoau@gmail.com',
    icon: Mail,
    color: 'green',
    action: 'mailto:cdssoau@gmail.com',
  },
  {
    title: 'Phone Support',
    description: '+1 (800) 123-4567',
    icon: Phone,
    color: 'purple',
    action: 'tel:+18001234567',
  },
  {
    title: 'Documentation',
    description: 'Browse our help guides',
    icon: FileText,
    color: 'yellow',
    action: '/docs/patient',
  },
];

const getColorClasses = (color) => {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    purple: 'bg-purple-500/10 text-purple-500',
    yellow: 'bg-yellow-500/10 text-yellow-600',
  };
  return colors[color] || 'bg-gray-500/10 text-gray-500';
};

export default function HelpSettingsPage() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="animate-fade-in mx-auto max-w-4xl space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/patient/settings"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Help & Support</h1>
          <p className="text-muted-foreground text-sm">
            FAQs, contact support, and documentation
          </p>
        </div>
      </div>

      {/* Contact Options */}
      <div>
        <h2 className="text-foreground mb-4 text-lg font-semibold">Contact Us</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {contactOptions.map((option) => {
            const Icon = option.icon;
            const isLink =
              option.action.startsWith('mailto:') ||
              option.action.startsWith('tel:') ||
              option.action.startsWith('/');

            const content = (
              <Card className="hover:border-primary/50 cursor-pointer transition-all hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`rounded-xl p-3 ${getColorClasses(option.color)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground font-semibold">{option.title}</h3>
                    <p className="text-muted-foreground text-sm">{option.description}</p>
                  </div>
                  {isLink ? (
                    <ExternalLink className="text-muted-foreground h-4 w-4" />
                  ) : (
                    <ChevronRight className="text-muted-foreground h-5 w-5" />
                  )}
                </CardContent>
              </Card>
            );

            if (isLink) {
              return (
                <Link key={option.title} href={option.action}>
                  {content}
                </Link>
              );
            }

            return <div key={option.title}>{content}</div>;
          })}
        </div>
      </div>

      {/* FAQs */}
      <div>
        <h2 className="text-foreground mb-4 text-lg font-semibold">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardContent className="p-0">
                <button
                  className="flex w-full items-center justify-between p-4 text-left"
                  onClick={() => toggleFaq(index)}
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="text-primary h-5 w-5 shrink-0" />
                    <span className="text-foreground font-medium">{faq.question}</span>
                  </div>
                  <ChevronRight
                    className={`text-muted-foreground h-5 w-5 shrink-0 transition-transform ${
                      expandedFaq === index ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="border-border border-t px-4 py-3">
                    <p className="text-muted-foreground text-sm">{faq.answer}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
