'use client';

import React from 'react';
import {
  Settings,
  Shield,
  Cpu,
  Database,
  Globe,
  Bell,
  Lock,
  Cloud,
  ChevronRight,
  Save,
  RefreshCw,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Switch,
} from '@/components/ui';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-10 pb-12">
      <header className="flex flex-col gap-2 px-2">
        <h2 className="text-foreground text-3xl font-black tracking-tighter uppercase italic">
          System Configuration
        </h2>
        <p className="text-muted-foreground font-medium">
          Control global platform parameters, AI matching thresholds, and security
          protocols.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Sidebar Navigation (Visual) */}
        <div className="space-y-2">
          <SettingsItem icon={<Cpu />} label="AI Heuristic Engine" active />
          <SettingsItem icon={<Database />} label="Core Storage & DB" />
          <SettingsItem icon={<Shield />} label="Clinical Verification" />
          <SettingsItem icon={<Globe />} label="API Integrations" />
          <SettingsItem icon={<Bell />} label="Notification Engine" />
          <SettingsItem icon={<Lock />} label="Security & Access" />
        </div>

        {/* Content Area */}
        <div className="space-y-8 lg:col-span-2">
          <Card className="bg-card rounded-[2.5rem] border-none shadow-sm">
            <CardHeader className="p-8 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl font-black tracking-tight uppercase italic">
                  <Cpu className="text-primary h-6 w-6" />
                  AI Heuristic Thresholds
                </CardTitle>
                <RefreshCw className="text-muted-foreground animate-spin-slow h-4 w-4 cursor-pointer" />
              </div>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <SettingRow
                title="Weighted Match Threshold"
                desc="Minimum confidence score required to auto-validate a diagnosis (Default: 80%)"
                value="80%"
              />
              <SettingRow
                title="Red Flag Sensitivity"
                desc="Trigger urgent escalation if specific keyword weights exceed this value."
                value="High"
              />
              <div className="bg-muted/20 border-border/50 flex items-center justify-between rounded-2xl border p-6">
                <div>
                  <p className="text-foreground text-sm font-bold">
                    Advanced Pattern Recognition
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Enable deep learning analysis for complex multi-joint pathologies.
                  </p>
                </div>
                <Switch checked={true} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card rounded-[2.5rem] border-none shadow-sm">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="flex items-center gap-3 text-xl font-black tracking-tight uppercase italic">
                <Cloud className="h-6 w-6 text-indigo-500" />
                Infrastructure Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-[10px] font-bold text-indigo-500">
                    CLO
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-bold uppercase italic">
                      Cloudinary Storage
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Medical Report Artifacts & Avatars
                    </p>
                  </div>
                </div>
                <Badge className="border-none bg-emerald-500 px-3 text-[10px] font-black text-white uppercase">
                  Stable
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-[10px] font-bold text-orange-500">
                    MON
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-bold uppercase italic">
                      MongoDB Atlas
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Encryption at Rest & Transit
                    </p>
                  </div>
                </div>
                <Badge className="border-none bg-emerald-500 px-3 text-[10px] font-black text-white uppercase">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              className="h-14 rounded-2xl px-10 text-xs font-black tracking-widest uppercase"
            >
              Reset to Baseline
            </Button>
            <Button className="bg-primary shadow-primary/20 h-14 gap-2 rounded-2xl px-10 text-xs font-black tracking-widest text-white uppercase shadow-lg">
              <Save className="h-4 w-4" />
              Apply All Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsItem({ icon, label, active = false }) {
  return (
    <button
      className={cn(
        'flex w-full items-center justify-between rounded-2xl p-5 transition-all',
        active
          ? 'bg-primary shadow-primary/20 scale-[1.02] text-white shadow-xl'
          : 'hover:bg-muted/50 text-foreground'
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn('h-6 w-6', active ? 'text-white' : 'text-muted-foreground')}>
          {icon}
        </div>
        <span className="text-sm font-black tracking-tighter uppercase italic">
          {label}
        </span>
      </div>
      <ChevronRight
        className={cn('h-4 w-4 opacity-50', !active && 'hidden group-hover:block')}
      />
    </button>
  );
}

function SettingRow({ title, desc, value }) {
  return (
    <div className="border-border/50 flex items-center justify-between border-b pb-6 last:border-0 last:pb-0">
      <div className="max-w-md">
        <p className="text-foreground mb-1 text-sm font-bold uppercase italic">{title}</p>
        <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
      </div>
      <div className="bg-muted text-primary border-border/50 min-w-[60px] rounded-xl border px-4 py-2 text-center text-xs font-black">
        {value}
      </div>
    </div>
  );
}
