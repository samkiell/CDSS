'use client';

import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { ShieldCheck, Info, AlertTriangle } from 'lucide-react';

export default function DisclaimerModal({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm duration-300">
      <Card className="w-full max-w-lg border-none shadow-2xl">
        <CardHeader className="pb-2 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <ShieldCheck className="text-primary" size={32} />
          </div>
          <CardTitle className="text-2xl font-bold">Medical Disclaimer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 py-4 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            This assessment uses AI for preliminary analysis only. It is{' '}
            <strong className="text-slate-900 dark:text-white">
              NOT a final diagnosis
            </strong>
            .
          </p>
          <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 text-left">
            <AlertTriangle className="mt-0.5 shrink-0 text-amber-500" size={20} />
            <p className="text-sm leading-relaxed text-amber-800">
              A licensed clinician will review your case. If you are experiencing a
              life-threatening emergency, please call your local emergency services
              immediately.
            </p>
          </div>
          <p className="text-xs font-medium text-slate-500">
            By proceeding, you acknowledge that you understand the limitations of this
            AI-assisted clinical report.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 px-6 pt-4 pb-8 sm:flex-row">
          <Button
            variant="secondary"
            className="order-2 flex-1 sm:order-1"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button className="order-1 flex-1 sm:order-2" onClick={onConfirm} size="lg">
            I Understand, Submit
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
