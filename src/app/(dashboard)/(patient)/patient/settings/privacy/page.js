'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
} from '@/components/ui';
import {
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  Download,
  Trash2,
  Bell,
  UserCheck,
  FileText,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function PrivacySettingsPage() {
  const [settings, setSettings] = useState({
    shareWithClinician: true,
    anonymousAnalytics: true,
    marketingEmails: false,
    showProfilePublic: false,
  });

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const privacyOptions = [
    {
      id: 'shareWithClinician',
      title: 'Share Data with Clinician',
      description:
        'Allow your assigned clinician to view your health data and assessments',
      icon: UserCheck,
      color: 'blue',
    },
    {
      id: 'anonymousAnalytics',
      title: 'Anonymous Analytics',
      description: 'Help improve our service by sharing anonymous usage data',
      icon: Eye,
      color: 'green',
    },
    {
      id: 'marketingEmails',
      title: 'Marketing Communications',
      description: 'Receive updates about new features and health tips',
      icon: Bell,
      color: 'purple',
    },
    {
      id: 'showProfilePublic',
      title: 'Public Profile',
      description: 'Allow other users to see your basic profile information',
      icon: Shield,
      color: 'yellow',
    },
  ];

  const handleDownloadData = () => {
    toast.info('Data download feature coming soon');
  };

  const handleDeleteAccount = () => {
    toast.error('Please contact support to delete your account', {
      description: 'Email: cdssoau@gmail.com',
      duration: 5000,
    });
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500/10 text-blue-500',
      green: 'bg-green-500/10 text-green-500',
      purple: 'bg-purple-500/10 text-purple-500',
      yellow: 'bg-yellow-500/10 text-yellow-600',
      red: 'bg-red-500/10 text-red-500',
    };
    return colors[color] || 'bg-gray-500/10 text-gray-500';
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
          <h1 className="text-2xl font-bold tracking-tight">Privacy & Security</h1>
          <p className="text-muted-foreground text-sm">
            Manage your privacy settings and data
          </p>
        </div>
      </div>

      {/* Security Status */}
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-xl bg-green-500/10 p-3">
            <Lock className="h-6 w-6 text-green-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-foreground font-semibold">Your Account is Secure</h3>
            <p className="text-muted-foreground text-sm">
              Your data is encrypted and protected with industry-standard security
              measures
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Controls */}
      <div>
        <h2 className="text-foreground mb-4 text-lg font-semibold">Privacy Controls</h2>
        <div className="space-y-3">
          {privacyOptions.map((option) => {
            const Icon = option.icon;
            const isEnabled = settings[option.id];

            return (
              <Card key={option.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`rounded-xl p-3 ${getColorClasses(option.color)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground font-semibold">{option.title}</h3>
                    <p className="text-muted-foreground text-sm">{option.description}</p>
                  </div>
                  <button
                    onClick={() => toggleSetting(option.id)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      isEnabled ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Data Management */}
      <div className="pt-2">
        <h2 className="text-foreground mb-4 text-lg font-semibold">Data Management</h2>
        <div className="space-y-3">
          <Card
            className="hover:border-primary/50 cursor-pointer transition-all hover:shadow-md"
            onClick={handleDownloadData}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`rounded-xl p-3 ${getColorClasses('blue')}`}>
                <Download className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground font-semibold">Download My Data</h3>
                <p className="text-muted-foreground text-sm">
                  Get a copy of all your personal data
                </p>
              </div>
              <ChevronRight className="text-muted-foreground h-5 w-5" />
            </CardContent>
          </Card>

          <Link href="/docs/patient/privacy-policy">
            <Card className="hover:border-primary/50 cursor-pointer transition-all hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`rounded-xl p-3 ${getColorClasses('green')}`}>
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-foreground font-semibold">Privacy Policy</h3>
                  <p className="text-muted-foreground text-sm">
                    Read our full privacy policy
                  </p>
                </div>
                <ChevronRight className="text-muted-foreground h-5 w-5" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="pt-4">
        <h2 className="mb-4 text-lg font-semibold text-red-500">Danger Zone</h2>
        <Card
          className="cursor-pointer border-red-500/30 transition-all hover:border-red-500/50 hover:shadow-md"
          onClick={handleDeleteAccount}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`rounded-xl p-3 ${getColorClasses('red')}`}>
              <Trash2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-500">Delete Account</h3>
              <p className="text-muted-foreground text-sm">
                Permanently delete your account and all data
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-red-500/50" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
