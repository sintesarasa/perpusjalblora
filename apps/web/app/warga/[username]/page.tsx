import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicUserProfile, BadgeCategory } from '@perpusjal/types';
import {
  BookOpen,
  Calendar,
  Globe,
  Instagram,
  Lock,
  Award,
  Feather,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Gift,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BadgeInsignia } from '@/components/gamification/badge-insignia';
import { MemberCardModal } from '@/components/gamification/member-card-modal';
import { getTierInfo, inferTierFromTitle } from '@/lib/badge-tier-styles';
import { UserAvatar } from '@/components/ui/user-avatar';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await fetchUserProfile(username);
  if (!user) {
    return { title: 'Warga Tidak Ditemukan | Perpustakaan Jalanan Blora' };
  }
  return {
    title: `${user.name} (@${user.username}) | Warga Perpustakaan Jalanan Blora`,
    description:
      user.bio ||
      `Profil identitas dan rekam jejak literasi ${user.name} di Perpustakaan Jalanan Blora.`,
    alternates: {
      canonical: `/warga/${user.username}`,
    },
  };
}

async function fetchUserProfile(username: string): Promise<PublicUserProfile | null> {
  const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${apiUrl}/api/v1/users/profile/${username}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return null;
    }
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
}

function getPillarIcon(category?: string) {
  switch (category) {
    case BadgeCategory.WACANA:
      return <BookOpen className="w-4 h-4" />;
    case BadgeCategory.TINTA:
      return <Feather className="w-4 h-4" />;
    case BadgeCategory.DIALEKTIKA:
      return <MessageSquare className="w-4 h-4" />;
    case BadgeCategory.AMANAH:
      return <ShieldCheck className="w-4 h-4" />;
    case BadgeCategory.PRESENSI:
      return <Calendar className="w-4 h-4" />;
    case BadgeCategory.DONATUR:
      return <Gift className="w-4 h-4" />;
    default:
      return <Award className="w-4 h-4" />;
  }
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await fetchUserProfile(username);

  if (!user) {
    notFound();
  }

  const joinedYear = new Date(user.createdAt).getFullYear();

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* ── 1. Top Editorial Breadcrumb ── */}
      <div className="border-b border-border-hairline py-3 px-4 sm:px-8 bg-surface-muted/30">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-foreground">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/kontributor" className="hover:text-foreground">
              Warga & Kontributor
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">@{user.username}</span>
          </div>
          <span>IDENTITAS & PRESTASI LITERASI WARGA</span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12 space-y-10">
        {/* ── 2. Profile Dossier Banner ── */}
        <section className="border-2 border-foreground bg-surface p-6 sm:p-10 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 pb-8 border-b border-border-hairline">
            {/* Avatar / Monogram */}
            <UserAvatar
              src={user.avatarUrl}
              name={user.name}
              username={user.username}
              size="2xl"
              shape="square"
              className="border-2 border-foreground shrink-0"
            />

            {/* Core Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-mono text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 border border-foreground bg-foreground text-background">
                  {user.role}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted border border-border-hairline px-2 py-0.5">
                  LEVEL {user.trustLevel}
                </span>
                <span className="font-mono text-[10px] text-muted flex items-center gap-1 ml-auto">
                  <Calendar className="w-3 h-3" /> Warga Sejak {joinedYear}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                {user.name}
              </h1>

              {/* Equipped Primary Title & Digital Member Card */}
              {(() => {
                const activeBadge =
                  user.equippedBadge ||
                  (user.equippedTitle
                    ? user.badges?.map((ub: any) => ub.badge || ub).find(
                        (b: any) => b.titleReward === user.equippedTitle || b.name === user.equippedTitle
                      )
                    : undefined);
                const activeTier = activeBadge?.tier || inferTierFromTitle(user.equippedTitle);
                const tierInfo = getTierInfo(activeTier);

                return (
                  <div className="mt-2.5 flex flex-wrap items-center gap-3">
                    {user.equippedTitle ? (
                      <div
                        className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1 border-2 font-mono text-xs font-bold uppercase tracking-wider',
                          tierInfo.honorBadgeClass
                        )}
                        title={`Gelar Kehormatan: "${user.equippedTitle}" (Tier ${activeTier} • ${tierInfo.name})`}
                      >
                        <BadgeInsignia
                          code={activeBadge?.code || 'HONOR_BADGE'}
                          tier={activeTier}
                          category={activeBadge?.category}
                          earned={true}
                          size="xs"
                          variant="solid-inverted"
                          className="-my-1 -ml-1 shrink-0"
                        />
                        <span>{user.equippedTitle}</span>
                      </div>
                    ) : (
                      <span className="font-mono text-xs text-muted">@{user.username}</span>
                    )}

                    {/* Member Card Modal Trigger */}
                    <MemberCardModal user={user} />
                  </div>
                );
              })()}

              {/* Bio */}
              {user.isProfilePublic && user.bio && (
                <p className="font-serif text-sm sm:text-base text-foreground/90 mt-3 leading-relaxed max-w-2xl">
                  {user.bio}
                </p>
              )}

              {/* Social and Web Links */}
              {user.isProfilePublic && (user.instagramUrl || user.websiteUrl) && (
                <div className="flex items-center gap-4 mt-4 font-mono text-xs text-muted">
                  {user.instagramUrl && (
                    <a
                      href={user.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground inline-flex items-center gap-1.5 underline decoration-dotted"
                    >
                      <Instagram className="w-3.5 h-3.5" /> Instagram
                    </a>
                  )}
                  {user.websiteUrl && (
                    <a
                      href={user.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground inline-flex items-center gap-1.5 underline decoration-dotted"
                    >
                      <Globe className="w-3.5 h-3.5" /> Situs Web
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Privacy Notice or Metric Bar */}
          {!user.isProfilePublic ? (
            <div className="pt-6 flex items-center gap-3 text-muted font-mono text-xs">
              <Lock className="w-4 h-4 shrink-0" />
              <span>
                Pengguna ini menyetel profil ke mode privat. Hanya daftar karya tulis publik yang ditampilkan untuk kepentingan atribusi kearsipan.
              </span>
            </div>
          ) : (
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x divide-border-hairline font-mono">
              <div className="pr-4">
                <span className="text-[10px] text-muted uppercase tracking-wider block">
                  Tulisan Terbit
                </span>
                <span className="font-serif text-2xl font-bold text-foreground">
                  {user.stats.totalArticles}
                </span>
              </div>
              <div className="pl-4 pr-4">
                <span className="text-[10px] text-muted uppercase tracking-wider block">
                  Lencana Apresiasi
                </span>
                <span className="font-serif text-2xl font-bold text-foreground">
                  {user.stats.badgesCount}
                </span>
              </div>
              <div className="pl-4 pr-4">
                <span className="text-[10px] text-muted uppercase tracking-wider block">
                  Buku Dipinjam
                </span>
                <span className="font-serif text-2xl font-bold text-foreground">
                  {user.stats.loansCount ?? 0}
                </span>
              </div>
              <div className="pl-4">
                <span className="text-[10px] text-muted uppercase tracking-wider block">
                  Buku Didonasikan
                </span>
                <span className="font-serif text-2xl font-bold text-foreground">
                  {user.stats.booksDonated ?? 0}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* ── 3. Koleksi Lencana & Prestasi ── */}
        {user.isProfilePublic && user.showBadges && (
          <section className="space-y-6">
            {/* ── 3.1 Etalase 3 Lencana Kebanggaan ── */}
            {user.showcaseBadges && user.showcaseBadges.length > 0 && (
              <div className="border-2 border-foreground bg-surface p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b-2 border-foreground pb-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-foreground" />
                    <h3 className="font-serif text-lg font-bold text-foreground">
                      Etalase Lencana Kebanggaan
                    </h3>
                  </div>
                  <span className="font-mono text-[9.5px] uppercase font-bold text-muted tracking-wider">
                    PODIUM KEHORMATAN ANGGOTA
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {user.showcaseBadges.map((sb, idx) => {
                    const sbTierInfo = getTierInfo(sb.tier);
                    return (
                      <div
                        key={sb.code || idx}
                        className={cn(
                          'border-2 p-4 flex flex-col items-center justify-center text-center space-y-2 transition-all bg-surface',
                          sbTierInfo.cardEarnedBg
                        )}
                      >
                        <span className={cn('px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider border whitespace-nowrap', sbTierInfo.headerTagClass)}>
                          T{sb.tier} &bull; {sbTierInfo.name}
                        </span>
                        <div className="py-1">
                          <BadgeInsignia
                            code={sb.code}
                            tier={sb.tier}
                            category={sb.category}
                            earned={true}
                            size="md"
                          />
                        </div>
                        <div className="space-y-1 max-w-full">
                          <h4 className="font-serif font-bold text-sm text-foreground truncate px-1">
                            {sb.name}
                          </h4>
                          {sb.titleReward && (
                            <span className={cn('font-mono text-[9px] px-2.5 py-0.5 border font-semibold inline-block truncate max-w-full', sbTierInfo.honorBadgeClass)}>
                              "{sb.titleReward}"
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── 3.2 Katalog Seluruh Capaian Terbuka ── */}
            <div className="space-y-4">
              <div className="flex items-baseline justify-between border-b-2 border-foreground pb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-foreground" />
                  <h2 className="font-serif text-xl font-bold uppercase tracking-wider">
                    Koleksi Lencana & Julukan ({user.badges.length})
                  </h2>
                </div>
                <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
                  Stempel Penghargaan Komunitas
                </span>
              </div>

              {user.badges.length === 0 ? (
                <div className="border border-dashed border-border-hairline p-8 text-center bg-surface">
                  <p className="font-mono text-xs text-muted">
                    Warga ini belum menyematkan lencana publik.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {user.badges.map((b) => {
                    const bTierInfo = getTierInfo(b.badge.tier);
                    return (
                      <div
                        key={b.badge.id}
                        className={cn(
                          'p-4 flex items-start gap-3.5 transition-all bg-surface border-2',
                          bTierInfo.cardEarnedBg
                        )}
                      >
                        <BadgeInsignia
                          code={b.badge.code}
                          tier={b.badge.tier}
                          category={b.badge.category}
                          earned={true}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between pb-1.5 border-b border-border-hairline mb-2 gap-1">
                            <span className={cn('px-2 py-0.5 text-[8.5px] font-mono font-bold uppercase tracking-wider border whitespace-nowrap', bTierInfo.headerTagClass)}>
                              T{b.badge.tier || 1} &bull; {bTierInfo.name}
                            </span>
                            <span className="font-mono text-[9px] uppercase text-muted tracking-wider font-semibold whitespace-nowrap">
                              {b.badge.category}
                            </span>
                          </div>
                          <h3 className="font-serif text-base font-bold text-foreground truncate">
                            {b.badge.name}
                          </h3>
                          {b.badge.titleReward && (
                            <span className={cn('font-mono text-[9px] px-2.5 py-0.5 border font-semibold inline-block mt-1', bTierInfo.honorBadgeClass)}>
                              Gelar: "{b.badge.titleReward}"
                            </span>
                          )}
                          <p className="text-[11px] text-muted font-sans line-clamp-2 mt-1.5 leading-snug">
                            {b.badge.description}
                          </p>
                          {b.earnedAt && (
                            <span className="font-mono text-[9px] text-muted block mt-2">
                              Diraih: {new Date(b.earnedAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── 4. Karya Tulisan Publik ── */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between border-b-2 border-foreground pb-2">
            <div className="flex items-center gap-2">
              <Feather className="w-4 h-4 text-foreground" />
              <h2 className="font-serif text-xl font-bold uppercase tracking-wider">
                Karya Tulisan Terbit ({user.articles.length})
              </h2>
            </div>
            <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
              Arsip Naskah Warga
            </span>
          </div>

          {user.articles.length === 0 ? (
            <div className="border border-dashed border-border-hairline p-8 text-center bg-surface">
              <p className="font-mono text-xs text-muted">
                Belum ada karya tulis yang diterbitkan oleh warga ini.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border-hairline border border-border-hairline bg-surface">
              {user.articles.map((article) => (
                <article
                  key={article.id}
                  className="p-5 hover:bg-surface-muted/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono text-[10px] text-muted uppercase">
                      {article.category && <span>{article.category.name}</span>}
                      <span>•</span>
                      <time dateTime={article.publishedAt}>
                        {new Date(article.publishedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </time>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-foreground hover:underline">
                      <Link href={`/artikel/${article.slug}`}>{article.title}</Link>
                    </h3>
                    {article.excerpt && (
                      <p className="font-serif text-xs text-muted line-clamp-2 max-w-2xl">
                        {article.excerpt}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/artikel/${article.slug}`}
                    className="font-mono text-xs uppercase tracking-wider font-semibold inline-flex items-center gap-1 text-foreground hover:underline shrink-0"
                  >
                    <span>Baca Naskah</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
