import * as React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { BrandStamp } from '@/components/ui/brand-stamp';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-background text-foreground selection:bg-foreground selection:text-background">
      {/* ── Left Editorial Pane (Desktop) ── */}
      <aside className="hidden lg:flex lg:col-span-5 xl:col-span-5 bg-[#0a0a0a] text-[#f9f9f7] flex-col justify-between p-12 xl:p-16 border-r border-white/10 relative overflow-hidden">
        {/* Editorial Top Masthead */}
        <div className="space-y-6 relative z-10">
          <Link href="/" className="inline-block group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white">
            <div className="flex items-center gap-3">
              <Logo height={28} className="brightness-0 invert" />
            </div>
          </Link>
          <div className="border-t border-white/15 pt-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
              Registri Komunitas Literasi Mandiri
            </p>
          </div>
        </div>

        {/* Center: Literary Manifesto Quote & Brand Stamp */}
        <div className="my-auto py-12 space-y-8 relative z-10">
          <div className="space-y-4">
            <div className="w-8 h-[1px] bg-white/40" />
            <blockquote className="font-serif text-2xl xl:text-3xl leading-snug tracking-tight text-white/95 italic font-normal">
              &ldquo;Membaca bukan sekadar melahap aksara di atas kertas, melainkan jalan pulang bagi nurani yang merdeka.&rdquo;
            </blockquote>
            <p className="font-mono text-xs uppercase tracking-widest text-white/60">
              — Manifesto Perpusjal Blora
            </p>
          </div>

          <div className="pt-4 flex items-center gap-6">
            <BrandStamp edition="VOL. III" year="2026" className="border-white/30 bg-white/5 text-white" />
            <div className="space-y-1 font-mono text-[10px] tracking-wider uppercase text-white/40">
              <p>Ruang Publik Terbuka</p>
              <p>Akses Baca Bebas Biaya</p>
              <p>Katalog Koleksi Mandiri</p>
            </div>
          </div>
        </div>

        {/* Bottom Colophon */}
        <div className="border-t border-white/15 pt-6 flex items-center justify-between font-mono text-[10px] tracking-widest uppercase text-white/40 relative z-10">
          <span>Edisi Digital Vol. III</span>
          <span>Blora, Jawa Tengah</span>
        </div>

        {/* Subtle background grain / aesthetic geometric watermark */}
        <div className="absolute -bottom-16 -right-16 w-80 h-80 opacity-[0.03] pointer-events-none select-none">
          <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full text-white">
            <polygon points="20,80 50,20 80,80" />
          </svg>
        </div>
      </aside>

      {/* ── Right Content Pane (Form) ── */}
      <main className="lg:col-span-7 xl:col-span-7 flex flex-col justify-between min-h-screen p-6 sm:p-10 md:p-14 lg:p-16">
        {/* Top Header */}
        <header className="flex items-center justify-between w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden">
            <Link href="/" className="inline-block">
              <Logo height={24} />
            </Link>
          </div>

          {/* Desktop Breadcrumb/Back link */}
          <div className="hidden lg:block">
            <Link
              href="/"
              className="font-mono text-[11px] uppercase tracking-widest text-muted hover:text-foreground transition-colors inline-flex items-center gap-1.5"
            >
              <span>&larr;</span>
              <span>Kembali ke Beranda</span>
            </Link>
          </div>

          {/* Theme switcher */}
          <ThemeToggle />
        </header>

        {/* Center: Auth Form Slot */}
        <div className="w-full max-w-md mx-auto my-auto py-10">
          {children}
        </div>

        {/* Bottom Micro Footer */}
        <footer className="border-t border-border-hairline pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-wider text-muted">
          <span>&copy; {new Date().getFullYear()} Perpusjal Blora. Terbuka & Independen.</span>
          <div className="flex items-center gap-4">
            <Link href="/tentang" className="hover:text-foreground transition-colors">
              Tentang
            </Link>
            <span>&bull;</span>
            <Link href="/ketentuan" className="hover:text-foreground transition-colors">
              Ketentuan
            </Link>
            <span>&bull;</span>
            <Link href="/privasi" className="hover:text-foreground transition-colors">
              Privasi
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
