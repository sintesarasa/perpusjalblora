'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { RotateCcw, AlertTriangle, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  React.useEffect(() => {
    // Log unexpected client/render exceptions to console for diagnostics
    console.error('[Perpusjal Error Boundary Captured]:', error);
  }, [error]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground editorial-grain">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center flex flex-col items-center justify-center">
        {/* Gazette Ledger Tag */}
        <div className="inline-flex items-center gap-2 border border-foreground/30 px-3 py-1 bg-surface mb-6 font-mono text-[11px] uppercase tracking-widest text-muted">
          <AlertTriangle className="w-3.5 h-3.5 text-foreground shrink-0" />
          <span>[ WARTA KENDALA // KESALAHAN SISTEM ]</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl font-black uppercase tracking-tight text-foreground mb-4">
          TERJADI KENDALA TEKNIS.
        </h1>

        <p className="font-serif italic text-base sm:text-lg text-foreground/80 max-w-xl mb-8 leading-relaxed">
          Naskah halaman yang Anda tuju mengalami kendala pemrosesan tak terduga. Tenang, data dan riwayat Anda tetap aman tersimpan di arsip Perpusjal.
        </p>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
          <Button
            size="lg"
            variant="solid"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider"
          >
            <RotateCcw className="w-4 h-4" />
            <span>MUAT ULANG HALAMAN</span>
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full inline-flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider"
            >
              <Home className="w-4 h-4" />
              <span>KEMBALI KE BERANDA</span>
            </Button>
          </Link>
        </div>

        {/* Diagnostic info for development & audits */}
        {process.env.NODE_ENV === 'development' && error?.message && (
          <div className="mt-12 w-full text-left p-4 border border-foreground/20 bg-surface-muted/60 font-mono text-xs overflow-x-auto">
            <div className="text-[10px] uppercase font-bold text-muted mb-1">
              DIAGNOSTIK PENGEMBANG (DEV ONLY):
            </div>
            <div className="text-foreground font-semibold break-all">{error.message}</div>
            {error.digest && (
              <div className="text-muted text-[10px] mt-1">Digest ID: {error.digest}</div>
            )}
            {error.stack && (
              <pre className="mt-2 text-[10px] text-muted overflow-x-auto whitespace-pre-wrap max-h-40">
                {error.stack}
              </pre>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
