import { Search, BookOpen, MessageCircle, FileText, ChevronRight, HelpCircle } from 'lucide-react';
import { Input, Card, CardContent } from '@/components/ui';

const categories = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of using the CDSS platform.',
    icon: <BookOpen className="h-6 w-6 text-blue-500" />,
    articles: ['Clinician Dashboard Overview', 'Setting up your profile', 'Adding your first patient'],
  },
  {
    title: 'Diagnostic Engine',
    description: 'Understand how the rule-based engine works.',
    icon: <HelpCircle className="h-6 w-6 text-purple-500" />,
    articles: ['How weighted matching works', 'Interpreting confidence scores', 'Refining a diagnosis'],
  },
  {
    title: 'Patient Management',
    description: 'Tools for tracking and managing patient care.',
    icon: <FileText className="h-6 w-6 text-green-500" />,
    articles: ['Viewing patient history', 'Uploading medical records', 'Sharing reports with colleagues'],
  },
];

const faqs = [
  {
    question: 'How accurate is the diagnostic engine?',
    answer: 'The heuristic engine uses a weighted matching paradigm based on established clinical patterns. While highly reliable for screening, it is designed to support, not replace, clinical judgment.',
  },
  {
    question: "Can I customize a patient's treatment plan?",
    answer: 'Yes, the Treatment Planner tool allows you to modify suggested plans or create entirely new ones based on your clinical assessment.',
  },
  {
    question: 'Is patient data secure?',
    answer: 'All data is encrypted in transit and at rest. We comply with standard healthcare data protection regulations to ensure patient privacy.',
  },
];

export default function HelpCenterPage() {
  return (
    <div className="mx-auto max-w-5xl">
      {/* Hero Section */}
      <div className="mb-12 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-700 p-10 text-center text-white shadow-lg">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight">How can we help you?</h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-cyan-50 opacity-90">
          Find answers, tutorials, and support to help you provide the best care for your patients.
        </p>
        <div className="relative mx-auto max-w-xl text-gray-900">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Search for articles, guides..." 
            className="h-14 rounded-xl border-0 pl-12 shadow-inner focus-visible:ring-white"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-16 grid gap-6 md:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.title} className="group cursor-pointer border-gray-100 transition hover:border-cyan-200 hover:shadow-md dark:border-gray-700 dark:hover:border-cyan-800">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800">
                {category.icon}
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                {category.title}
              </h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {category.description}
              </p>
              <ul className="space-y-2">
                {category.articles.map((article) => (
                  <li key={article} className="flex items-center text-sm font-medium text-gray-700 transition hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400">
                    <ChevronRight className="mr-1 h-3 w-3" />
                    {article}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQs */}
      <div className="mb-16">
        <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="mb-3 font-bold text-gray-900 dark:text-white">{faq.question}</h3>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="rounded-2xl border border-dashed border-cyan-300 bg-cyan-50/30 p-8 text-center dark:border-cyan-900 dark:bg-cyan-950/20">
        <MessageCircle className="mx-auto mb-4 h-10 w-10 text-cyan-600" />
        <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Still need help?</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">Our support team is available 24/7 to assist you with any questions.</p>
        <button className="rounded-xl bg-cyan-600 px-8 py-3 font-bold text-white shadow-md transition hover:bg-cyan-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2">
          Contact Support
        </button>
      </div>
    </div>
  );
}
