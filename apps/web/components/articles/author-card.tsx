import * as React from 'react';
import Link from 'next/link';
import { ArticleAuthor } from '@perpusjal/types';
import { cn } from '@/lib/utils';
import { UserHonorBadge } from '@/components/gamification/user-honor-badge';
import { UserAvatar } from '@/components/ui/user-avatar';
import { ArrowRight } from 'lucide-react';

interface AuthorCardProps {
  author: ArticleAuthor;
  className?: string;
}

export function AuthorCard({ author, className }: AuthorCardProps) {
  return (
    <div
      className={cn(
        'border-y border-border-hairline py-6 my-8 flex flex-col sm:flex-row items-start sm:items-center gap-5',
        className
      )}
    >
      {/* Centralized UserAvatar */}
      <UserAvatar
        src={author.avatarUrl}
        name={author.name}
        username={author.username}
        size="lg"
        linkToProfile
      />

      {/* Author Metadata */}
      <div className="space-y-1.5 flex-1 min-w-0">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted font-bold flex items-center gap-2">
          <span>KOLOFON PENULIS</span>
          <span className="text-muted/40">//</span>
          <span className="text-muted/80">KONTRIBUTOR WARGA</span>
        </div>

        {/* Primary Identity: Name + Username + Honor Badge */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <Link href={`/u/${author.username}`} className="group">
            <h4 className="font-serif text-lg sm:text-xl font-bold text-foreground group-hover:underline tracking-tight">
              {author.name}
            </h4>
          </Link>
          <span className="font-mono text-xs text-muted">
            @{author.username}
          </span>

          {/* Honor Title / Badges */}
          <UserHonorBadge
            equippedTitle={author.equippedTitle}
            equippedBadge={author.equippedBadge}
            earnedBadgesCount={author.earnedBadgesCount}
            badges={author.badges}
            username={author.username}
            size="sm"
          />
        </div>

        {author.bio ? (
          <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed max-w-xl">
            {author.bio}
          </p>
        ) : (
          <p className="font-sans text-xs text-muted leading-relaxed">
            Kontributor warta &amp; pegiat literasi di Perpustakaan Jalanan Blora.
          </p>
        )}

        <div className="pt-1">
          <Link
            href={`/u/${author.username}`}
            className="font-mono text-[11px] uppercase tracking-wider text-foreground font-bold hover:underline inline-flex items-center gap-1.5"
          >
            <span>Buka Folio &amp; Koleksi Prestasi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
