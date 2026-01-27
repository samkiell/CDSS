import { Shield, Lock, Eye, FileCheck, Scale, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';

const policies = [
  {
    title: 'Data Confidentiality',
    description: 'All patient health information (PHI) accessed through this platform is strictly confidential. Clinicians must ensure that such data is not shared with unauthorized individuals.',
    icon: <Lock className="h-6 w-6 text-cyan-600" />,
  },
  {
    title: 'Access Control',
    description: 'Your login credentials are for your exclusive use. Sharing accounts is a violation of the privacy policy and may result in revocation of access.',
    icon: <Shield className="h-6 w-6 text-blue-600" />,
  },
  {
    title: 'Patient Consent',
    description: 'Diagnostic assessments are conducted based on the consent provided by the patient during the intake process. Clinicians should verify consent status before proceeding with treatment plans.',
    icon: <Eye className="h-6 w-6 text-purple-600" />,
  },
  {
    title: 'Data Retention',
    description: 'We adhere to clinical data retention policies. Patient records are maintained for the legally required period and then securely archived or disposed of.',
    icon: <FileCheck className="h-6 w-6 text-green-600" />,
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-100 dark:bg-cyan-900/30">
          <Shield className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy & Ethics</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Our commitment to patient data protection and clinical integrity.</p>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {policies.map((policy) => (
          <Card key={policy.title} className="border-gray-100 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
                  {policy.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{policy.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {policy.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ethics Statement */}
      <div className="mt-10 rounded-2xl bg-gray-50 p-8 dark:bg-gray-800/50">
        <div className="mb-4 flex items-center gap-2 text-cyan-700 dark:text-cyan-400">
          <Scale className="h-5 w-5" />
          <h2 className="text-xl font-bold">Clinical Ethics Statement</h2>
        </div>
        <div className="space-y-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          <p>
            The Clinician Decision Support System (CDSS) is designed to assist medical practitioners in the diagnosis and management of musculoskeletal conditions. Users of this platform agree to uphold the highest standards of professional conduct and ethical practice.
          </p>
          <p>
            Decision support tools provide recommendations based on available data; however, the final clinical decision remains the sole responsibility of the licensed practitioner. Clinicians must exercise independent judgment and consider the totality of the patient's clinical presentation.
          </p>
        </div>
      </div>

      {/* Contact for Privacy Issues */}
      <div className="mt-10 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 p-6 dark:border-blue-900/30 dark:bg-blue-900/10">
        <div className="flex items-center gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Have questions about our privacy practices?
          </span>
        </div>
        <button className="text-sm font-bold text-blue-600 transition hover:text-blue-700 dark:text-blue-400">
          View Full Policy
        </button>
      </div>
    </div>
  );
}
