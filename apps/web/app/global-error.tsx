'use client';

import * as React from 'react';
import { RotateCcw, AlertOctagon } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  React.useEffect(() => {
    console.error('[Perpusjal Global Error Caught]:', error);
  }, [error]);

  return (
    <html lang="id">
      <body className="min-h-screen bg-[#FAF8F5] text-[#111111] flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full border-2 border-[#111111] bg-white p-8 space-y-6 text-center">
          <div className="inline-flex items-center gap-2 border border-[#111111] px-3 py-1 bg-[#F5F2ED] font-mono text-[10px] uppercase tracking-widest text-[#555555]">
            <AlertOctagon className="w-3.5 h-3.5 text-[#111111]" />
            <span>[ KERUSAKAN SISTEM UTAMA ]</span>
          </div>

          <h1 className="font-serif text-3xl font-black uppercase tracking-tight text-[#111111]">
            TERJADI KENDALA FATAL.
          </h1>

          <p className="font-serif italic text-sm text-[#444444] leading-relaxed">
            Terjadi kendala pada lapisan tata letak root sistem. Muat ulang halaman untuk memulihkan sesi.
          </p>

          <button
            type="button"
            onClick={() => reset()}
            className="w-full h-11 bg-[#111111] text-white font-mono text-xs uppercase tracking-wider font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>COBA LAGI / RESET</span>
          </button>
        </div>
      </body>
    </html>
  );
}
