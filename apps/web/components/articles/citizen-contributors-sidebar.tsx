'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArticleSummary } from '@perpusjal/types';
import { UserAvatar } from '@/components/ui/user-avatar';
import { UserHonorBadge } from '@/components/gamification/user-honor-badge';
import { cn } from '@/lib/utils';
import {
  PenTool,
  Quote,
  Users,
  ArrowRight,
  BookOpen,
  Mail,
} from 'lucide-react';

interface CitizenContributorsSidebarProps {
  articles: ArticleSummary[];
  onSelectAuthor?: (authorName: string) => void;
  className?: string;
}

interface ContributorInfo {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  bio?: string | null;
  equippedTitle?: string | null;
  equippedBadge?: { code: string; name: string; titleReward: string; tier: number; category: string } | null;
  earnedBadgesCount?: number;
  badges?: any[];
  articleCount: number;
}

export function CitizenContributorsSidebar({
  articles,
  onSelectAuthor,
  className,
}: CitizenContributorsSidebarProps) {
  // Aggregate unique contributors from the current articles collection
  const contributors = React.useMemo(() => {
    const map = new Map<string, ContributorInfo>();

    articles.forEach((art) => {
      if (!art.author || !art.author.username) return;
      const key = art.author.username;
      if (!map.has(key)) {
        map.set(key, {
          id: art.author.id,
          name: art.author.name,
          username: art.author.username,
          avatarUrl: art.author.avatarUrl,
          bio: art.author.bio,
          equippedTitle: art.author.equippedTitle,
          equippedBadge: art.author.equippedBadge,
          earnedBadgesCount: art.author.earnedBadgesCount,
          badges: art.author.badges,
          articleCount: 1,
        });
      } else {
        const item = map.get(key)!;
        item.articleCount += 1;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.articleCount - a.articleCount);
  }, [articles]);

  return (
    <aside className={cn('space-y-6 sm:space-y-8 select-none', className)}>
      {/* ========================================================= */}
      {/* 1. KOTAK POS REDAKSI WARGA (SUBMISSION CALLOUT)           */}
      {/* ========================================================= */}
      <div className="border-2 border-foreground bg-foreground text-background p-5 sm:p-6 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)]">
        {/* Subtle Watermark */}
        <div className="absolute -right-4 -bottom-6 opacity-10 pointer-events-none font-serif text-8xl font-black">
          ✎
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between border-b border-background/20 pb-2 text-[10px] font-mono uppercase tracking-widest text-background/80">
            <span className="flex items-center gap-1.5 font-bold">
              <Mail className="w-3.5 h-3.5 text-background" />
              <span>[ KOTAK POS REDAKSI ]</span>
            </span>
            <span>MIMBAR TERBUKA</span>
          </div>

          <div className="space-y-2">
            <h3 className="font-serif text-xl sm:text-2xl font-black leading-tight text-background">
              Punya Pemikiran, Resensi, atau Catatan Lapak?
            </h3>
            <p className="font-serif text-xs sm:text-sm text-background/85 leading-relaxed">
              Ruang warta ini milik seluruh warga. Tanpa kurasi elitis. Naskah yang disetujui kurator akan terbit di lembaran warta kolektif.
            </p>
          </div>

          <div className="pt-1">
            <Link
              href="/dashboard/tulisan"
              className="w-full px-4 py-2.5 bg-background text-foreground hover:bg-background/90 font-mono text-xs font-bold uppercase tracking-wider text-center transition-all inline-flex items-center justify-center gap-2 border border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-0.5 active:translate-y-0.5"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Kirim Naskah Warga</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. ETALASE PENULIS WARGA TERPAL (CITIZEN COLUMNISTS)       */}
      {/* ========================================================= */}
      <div className="border-2 border-foreground bg-surface p-5 sm:p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-foreground pb-2.5">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-foreground" />
            <h4 className="font-mono text-xs uppercase tracking-widest font-black text-foreground">
              KOLOFON PENULIS WARGA
            </h4>
          </div>
          <span className="font-mono text-[10px] text-muted font-bold">
            {contributors.length} Kontributor
          </span>
        </div>

        <p className="font-serif text-xs text-muted leading-relaxed">
          Kawan-kawan yang membagikan buah pikiran, notula diskusi, dan catatan pembaca di atas terpal.
        </p>

        {/* Contributors List */}
        <div className="divide-y divide-border-hairline">
          {contributors.length > 0 ? (
            contributors.slice(0, 6).map((author) => (
              <div
                key={author.id}
                className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3 group hover:bg-surface-muted/40 px-1.5 transition-colors -mx-1.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar
                    src={author.avatarUrl}
                    name={author.name}
                    username={author.username}
                    size="sm"
                    shape="square"
                    className="border border-foreground shrink-0 shadow-2xs"
                  />

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link
                        href={`/warga/${author.username}`}
                        className="font-serif text-sm font-bold text-foreground hover:underline truncate group-hover:text-foreground"
                      >
                        {author.name}
                      </Link>
                      {author.equippedTitle && (
                        <span className="font-mono text-[8.5px] uppercase px-1 py-0.2 border border-foreground/40 bg-surface-muted text-foreground font-semibold">
                          {author.equippedTitle}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted">
                      <span>@{author.username}</span>
                      <span>&bull;</span>
                      <span className="font-bold text-foreground">
                        {author.articleCount} Naskah
                      </span>
                    </div>
                  </div>
                </div>

                {onSelectAuthor ? (
                  <button
                    type="button"
                    onClick={() => onSelectAuthor(author.name)}
                    className="shrink-0 p-1.5 border border-border-hairline hover:border-foreground hover:bg-foreground hover:text-background text-muted transition-colors cursor-pointer"
                    title={`Filter naskah karya ${author.name}`}
                  >
                    <BookOpen className="w-3 h-3" />
                  </button>
                ) : (
                  <Link
                    href={`/warga/${author.username}`}
                    className="shrink-0 p-1.5 border border-border-hairline hover:border-foreground hover:bg-foreground hover:text-background text-muted transition-colors"
                    title="Buka Profil"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            ))
          ) : (
            <div className="py-4 text-center font-mono text-xs text-muted">
              Belum ada kontributor terdaftar.
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. KUTIPAN TERPAL PEKAN INI (WEEKLY PULLQUOTE)             */}
      {/* ========================================================= */}
      <div className="border-2 border-foreground bg-surface-muted/50 p-5 relative overflow-hidden shadow-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-hairline font-mono text-[9px] uppercase tracking-widest text-muted">
          <span className="flex items-center gap-1 font-bold text-foreground">
            <Quote className="w-3 h-3 text-foreground" />
            <span>KUTIPAN TROTOAR TERPILIH</span>
          </span>
          <span>BLORA</span>
        </div>

        <blockquote className="font-serif italic text-sm sm:text-base text-foreground leading-relaxed pt-1">
          &ldquo;Buku tidak pernah netral saat dibuka di atas terpal trotoar; ia memihak mereka yang ingin merdeka berpikir dan berani mempertanyakan keadaan.&rdquo;
        </blockquote>

        <div className="pt-3 mt-2 border-t border-border-hairline flex items-center justify-between font-mono text-[10px] text-muted">
          <span>Notula Sesi Lapak CFD</span>
          <span className="font-bold text-foreground">Perpusjal Blora</span>
        </div>
      </div>
    </aside>
  );
}
