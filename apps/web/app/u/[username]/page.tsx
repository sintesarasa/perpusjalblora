import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicUserProfile } from '@perpusjal/types';
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
} from 'lucide-react';

export const dynamic = 'force-dynamic';

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
      {/* 1. TOP EDITORIAL FOLIO / BREADCRUMB */}
      <div className="border-b border-border-hairline py-3 px-4 sm:px-8 bg-surface-muted/30">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-foreground">Beranda</Link>
            <span>/</span>
            <Link href="/kontributor" className="hover:text-foreground">Kontributor</Link>
            <span>/</span>
            <span className="text-foreground font-semibold">@{user.username}</span>
          </div>
          <span>ARSIP IDENTITAS WARGA</span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12">
        {/* 2. PROFILE HERO BANNER */}
        <section className="border border-border-hairline bg-surface p-6 sm:p-10 mb-10 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 pb-8 border-b border-border-hairline">
            {/* Avatar / Monogram */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-foreground bg-foreground text-background flex items-center justify-center font-serif text-3xl font-bold uppercase select-none">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover grayscale"
                />
              ) : (
                user.name.slice(0, 2)
              )}
            </div>

            {/* Core Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 border border-foreground bg-foreground text-background">
                  {user.role}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted border border-border-hairline px-2 py-0.5">
                  LEVEL {user.trustLevel}
                </span>
                <span className="font-mono text-[10px] text-muted flex items-center gap-1 ml-auto">
                  <Calendar className="w-3 h-3" /> Sejak {joinedYear}
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {user.name}
              </h1>
              <p className="font-mono text-xs text-muted mt-0.5">
                @{user.username}
              </p>

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
                      className="hover:text-foreground inline-flex items-center gap-1.5"
                    >
                      <Instagram className="w-3.5 h-3.5" /> Instagram
                    </a>
                  )}
                  {user.websiteUrl && (
                    <a
                      href={user.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground inline-flex items-center gap-1.5"
                    >
                      <Globe className="w-3.5 h-3.5" /> Situs Web
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* PRIVACY NOTICE IF PRIVATE */}
          {!user.isProfilePublic ? (
            <div className="pt-6 flex items-center gap-3 text-muted font-mono text-xs">
              <Lock className="w-4 h-4 shrink-0" />
              <span>
                Pengguna ini menyetel profil ke mode privat. Hanya daftar karya tulis publik yang ditampilkan sesuai ketentuan keterbukaan atribusi kearsipan (BR-PROF-01).
              </span>
            </div>
          ) : (
            /* STATS METRIC BAR */
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x divide-border-hairline font-mono">
              <div className="pr-4">
                <span className="text-[10px] text-muted uppercase tracking-wider block">Tulisan Terbit</span>
                <span className="font-serif text-2xl font-bold text-foreground">{user.stats.totalArticles}</span>
              </div>
              <div className="pl-4 pr-4">
                <span className="text-[10px] text-muted uppercase tracking-wider block">Lencana Diraih</span>
                <span className="font-serif text-2xl font-bold text-foreground">{user.stats.badgesCount}</span>
              </div>
              <div className="pl-4 pr-4 hidden sm:block">
                <span className="text-[10px] text-muted uppercase tracking-wider block">Afiliasi</span>
                <span className="text-xs font-bold text-foreground">Warga Komunitas</span>
              </div>
              <div className="pl-4 hidden sm:block">
                <span className="text-[10px] text-muted uppercase tracking-wider block">Status Berkas</span>
                <span className="text-xs font-bold text-foreground flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-foreground" /> Terverifikasi
                </span>
              </div>
            </div>
          )}
        </section>

        {/* 3. LENCANA PRESTASI / BADGES SHOWCASE (if public & showBadges) */}
        {user.isProfilePublic && user.showBadges && user.badges.length > 0 && (
          <section className="mb-12">
            <div className="flex items-baseline justify-between border-b border-foreground pb-2 mb-6">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-foreground" />
                <h2 className="font-serif text-lg font-bold uppercase tracking-wider">
                  Lencana Apresiasi ({user.badges.length})
                </h2>
              </div>
              <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
                Penghargaan Kontribusi Literasi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {user.badges.map((b) => (
                <div
                  key={b.badge.id}
                  className="border border-border-hairline bg-surface p-4 flex items-start gap-3 hover:border-foreground transition-colors"
                >
                  <div className="w-9 h-9 border border-foreground bg-surface-muted flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-sm font-bold text-foreground truncate">
                      {b.badge.name}
                    </h3>
                    <p className="text-[11px] text-muted font-sans line-clamp-2 mt-0.5 leading-snug">
                      {b.badge.description}
                    </p>
                    {b.earnedAt && (
                      <span className="font-mono text-[9px] text-muted block mt-1.5 uppercase">
                        Diraih: {new Date(b.earnedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. DAFTAR ARTIKEL TERBIT */}
        <section>
          <div className="flex items-baseline justify-between border-b border-foreground pb-2 mb-6">
            <div className="flex items-center gap-2">
              <Feather className="w-4 h-4 text-foreground" />
              <h2 className="font-serif text-lg font-bold uppercase tracking-wider">
                Karya Tulisan Terbit ({user.articles.length})
              </h2>
            </div>
            <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
              Arsip Kronologis
            </span>
          </div>

          {user.articles.length === 0 ? (
            <div className="border border-dashed border-border-hairline p-8 text-center bg-surface-muted/20">
              <BookOpen className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
              <p className="font-mono text-xs text-muted">
                Belum ada tulisan yang diterbitkan oleh penulis ini.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border-hairline border-t border-b border-border-hairline">
              {user.articles.map((art) => (
                <article key={art.id} className="py-5 sm:py-6 group flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      {art.category && (
                        <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-muted">
                          {art.category.name}
                        </span>
                      )}
                      <span className="text-[10px] text-muted font-mono">•</span>
                      <time className="font-mono text-[10px] text-muted">
                        {new Date(art.publishedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </time>
                    </div>

                    <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground group-hover:underline">
                      <Link href={`/artikel/${art.slug}`}>{art.title}</Link>
                    </h3>

                    {art.excerpt && (
                      <p className="font-serif text-xs sm:text-sm text-muted mt-1 line-clamp-2 leading-relaxed">
                        {art.excerpt}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/artikel/${art.slug}`}
                    className="font-mono text-xs text-foreground group-hover:underline inline-flex items-center gap-1 shrink-0 self-end sm:self-center"
                  >
                    Baca Tulisan <ArrowRight className="w-3 h-3" />
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
