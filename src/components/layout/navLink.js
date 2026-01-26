'use client';
import {
  LayoutDashboard,
  ClipboardPlus,
  FlaskConical,
  TrendingUp,
  MessageSquare,
  Bell,
  FileOutput,
  ClipboardList,
  Users,
  FolderOpen,
  Compass,
  Settings,
} from 'lucide-react';

export const patientLinks = [
  { href: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/patient/assessment?new=true', label: 'New assessment', icon: ClipboardPlus },
  { href: '/patient/self-test', label: 'Guided Self Test', icon: FlaskConical },
  { href: '/patient/progress', label: 'Progress', icon: TrendingUp },
  { href: '/patient/messages', label: 'Messages', icon: MessageSquare },
  { href: '/patient/notifications', label: 'Notifications', icon: Bell },
];

export const clinicianLinks = [
  { href: '/clinician/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clinician/patients', label: 'Patient List', icon: Users },
  { href: '/clinician/cases', label: 'Case View', icon: FolderOpen },
  { href: '/clinician/diagnostic', label: 'Guided Diagnostic Mode', icon: Compass },
  { href: '/clinician/treatment', label: 'Treatment Planner', icon: ClipboardList },
  { href: '/clinician/referral', label: 'Referral or Order', icon: FileOutput },
  { href: '/clinician/messages', label: 'Messages', icon: MessageSquare },
  { href: '/clinician/notifications', label: 'Notifications', icon: Bell },
];
