'use client';

import * as React from 'react';
import { RefreshCw, Sparkles, X } from 'lucide-react';

interface ColdStartBannerProps {
  isVisible: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ColdStartBanner({ isVisible, onRetry, onDismiss }: ColdStartBannerProps) {
  const [closed, setClosed] = React.useState(false);

  if (!isVisible || closed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="bg-amber-950/90 text-amber-200 border border-amber-800/80 rounded-lg p-3.5 shadow-xl backdrop-blur-md flex items-start gap-3">
        <span className="relative flex h-3 w-3 mt-1 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
        </span>

        <div className="flex-1 text-xs leading-relaxed">
          <p className="font-semibold text-amber-100 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Menghubungkan ke Server Lapak
          </p>
          <p className="mt-0.5 text-amber-300/90">
            Server sedang bangun dari mode hemat daya (cold start). Katalog sedang disiapkan secara otomatis.
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-amber-200 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              Coba hubungkan ulang
            </button>
          )}
        </div>

        <button
          onClick={() => {
            setClosed(true);
            onDismiss?.();
          }}
          aria-label="Tutup pemberitahuan"
          className="text-amber-400 hover:text-amber-100 p-0.5 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
