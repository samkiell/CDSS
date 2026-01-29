'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { Input } from './Input';
import { cn } from '@/lib/cn';

/**
 * A premium, reusable Status Modal to replace browser alert(), confirm(), and prompts.
 * Designed for both single-action alerts, dual-action confirmations, and text input prompts.
 */
export function StatusModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info', // 'success' | 'error' | 'warning' | 'info' | 'confirm' | 'prompt'
  onConfirm,
  confirmText = 'Continue',
  cancelText = 'Cancel',
  isSubmitting = false,
  inputPlaceholder = 'Enter text...',
}) {
  const [inputValue, setInputValue] = useState('');

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setInputValue(''); // Reset input when closed
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const icons = {
    success: <CheckCircle2 className="h-12 w-12 text-emerald-500" />,
    error: <AlertCircle className="text-destructive h-12 w-12" />,
    warning: <AlertCircle className="text-warning h-12 w-12" />,
    info: <Info className="text-primary h-12 w-12" />,
    confirm: <HelpCircle className="h-12 w-12 text-indigo-500" />,
    prompt: <MessageSquare className="h-12 w-12 text-indigo-500" />,
  };

  const colors = {
    success: 'bg-emerald-500 hover:bg-emerald-600',
    error: 'bg-destructive hover:bg-destructive/90',
    warning: 'bg-warning hover:bg-warning/90 text-white',
    info: 'bg-primary hover:bg-primary/90',
    confirm: 'bg-indigo-600 hover:bg-indigo-700',
    prompt: 'bg-indigo-600 hover:bg-indigo-700',
    default: 'bg-primary hover:bg-primary/90',
  };

  const handleConfirm = () => {
    if (type === 'prompt') {
      if (onConfirm) onConfirm(inputValue);
    } else {
      if (onConfirm) onConfirm();
    }
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md duration-300">
      <Card className="animate-in zoom-in-95 dark:bg-card relative w-full max-w-sm rounded-[2.5rem] border-none bg-white p-8 shadow-2xl duration-300">
        {!isSubmitting && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-6 right-6 h-8 w-8 rounded-full text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        <div className="flex flex-col items-center pt-2 text-center">
          <div className="mb-6 rounded-[2rem] bg-slate-50 p-6 shadow-inner dark:bg-slate-900">
            {icons[type] || icons.info}
          </div>

          <div className="mb-8 w-full space-y-3">
            <h3 className="text-foreground text-2xl font-black tracking-tight uppercase">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed font-medium">
              {message}
            </p>

            {type === 'prompt' && (
              <div className="mt-4 w-full">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={inputPlaceholder}
                  className="rounded-xl border-2 py-6 text-center text-lg font-bold"
                  autoFocus
                />
              </div>
            )}
          </div>

          <div className="flex w-full gap-3">
            {(type === 'confirm' || type === 'prompt') && (
              <Button
                variant="outline"
                className="hover:bg-accent h-14 flex-1 rounded-2xl border-2 text-[10px] font-black tracking-widest uppercase"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {cancelText}
              </Button>
            )}
            <Button
              className={cn(
                'shadow-primary/20 h-14 flex-1 rounded-2xl text-[10px] font-black tracking-widest text-white uppercase shadow-lg transition-all active:scale-95',
                colors[type] || colors.default
              )}
              onClick={handleConfirm}
              disabled={isSubmitting || (type === 'prompt' && !inputValue.trim())}
            >
              {isSubmitting ? 'Processing...' : confirmText}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
