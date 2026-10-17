'use client';

import * as React from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastMessage {
  id: string;
  type: 'error' | 'success' | 'info';
  message: string;
}

type ToastListener = (toasts: ToastMessage[]) => void;

let activeToasts: ToastMessage[] = [];
const listeners = new Set<ToastListener>();

function notify() {
  listeners.forEach((l) => l([...activeToasts]));
}

export const toast = {
  show(message: string, type: 'error' | 'success' | 'info' = 'info') {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newToast: ToastMessage = { id, type, message };
    activeToasts = [...activeToasts, newToast];
    notify();

    setTimeout(() => {
      activeToasts = activeToasts.filter((t) => t.id !== id);
      notify();
    }, 4500);
  },
  error(message: string) {
    this.show(message, 'error');
  },
  success(message: string) {
    this.show(message, 'success');
  },
  info(message: string) {
    this.show(message, 'info');
  },
};

export function ToastContainer() {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  React.useEffect(() => {
    listeners.add(setToasts);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-3"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto p-3.5 sm:p-4 border-2 font-mono text-xs shadow-md transition-all flex items-start gap-3 rounded-none animate-in fade-in slide-in-from-bottom-2',
            t.type === 'error' && 'border-red-600 bg-surface text-red-600 dark:text-red-400',
            t.type === 'success' && 'border-foreground bg-surface text-foreground',
            t.type === 'info' && 'border-foreground bg-surface text-foreground'
          )}
        >
          {t.type === 'error' && <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />}
          {t.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-foreground" />}
          {t.type === 'info' && <Info className="w-4 h-4 shrink-0 mt-0.5 text-foreground" />}

          <div className="flex-1 font-serif text-xs leading-relaxed text-foreground">
            {t.message}
          </div>

          <button
            type="button"
            onClick={() => {
              activeToasts = activeToasts.filter((item) => item.id !== t.id);
              notify();
            }}
            className="text-muted hover:text-foreground shrink-0 p-0.5"
            aria-label="Tutup warta"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
