import * as React from 'react';
import Link from 'next/link';
import { ContributorItem } from '@perpusjal/types';
import { Users, Award, Feather, ArrowUpRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function fetchContributors(): Promise<ContributorItem[]> {
  const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${apiUrl}/api/v1/users/contributors?limit=50`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.items || [];
  } catch (err) {
    console.error('Error fetching contributors:', err);
    return [];
  }
}

export const metadata = {
  title: 'Direktori Kontributor & Pegiat | Perpustakaan Jalanan Blora',
  description: 'Daftar warga, penulis, dan kurator yang berkontribusi dalam gerakan literasi komunitas di Blora.',
};

export default async function ContributorsPage() {
  const contributors = await fetchContributors();

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* 1. EDITORIAL HEADER BANNER */}
      <section className="border-b border-border-hairline bg-surface-muted/40 py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>KOLOPHON KOMUNITAS</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
            Direktori Kontributor
          </h1>
          <p className="font-serif text-base sm:text-lg text-muted max-w-2xl mt-3 leading-relaxed">
            Warga yang menulis, mengkurasi, dan merawat ruang literasi independen di Blora. Gagasan hidup karena dibagikan, bukan ditimbun.
          </p>
        </div>
      </section>

      {/* 2. CONTRIBUTORS GRID */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-10">
        {contributors.length === 0 ? (
          <div className="border border-dashed border-border-hairline p-12 text-center bg-surface">
            <p className="font-mono text-sm text-muted">Belum ada kontributor terdata.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contributors.map((c) => (
              <div
                key={c.id}
                className="border border-border-hairline bg-surface p-6 flex flex-col justify-between hover:border-foreground transition-colors group"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-12 h-12 border border-foreground bg-foreground text-background flex items-center justify-center font-serif text-lg font-bold uppercase select-none shrink-0">
                      {c.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.avatarUrl}
                          alt={c.name}
                          className="w-full h-full object-cover grayscale"
                        />
                      ) : (
                        c.name.slice(0, 2)
                      )}
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 border border-foreground">
                      {c.role}
                    </span>
                  </div>

                  <h2 className="font-serif text-lg font-bold text-foreground group-hover:underline">
                    <Link href={`/u/${c.username}`}>{c.name}</Link>
                  </h2>
                  <p className="font-mono text-xs text-muted">@{c.username}</p>

                  {c.bio ? (
                    <p className="font-serif text-xs text-foreground/80 mt-2.5 line-clamp-2 leading-relaxed">
                      {c.bio}
                    </p>
                  ) : (
                    <p className="font-serif text-xs text-muted/60 italic mt-2.5">
                      Warga pegiat literasi jalanan.
                    </p>
                  )}
                </div>

                <div className="pt-5 mt-5 border-t border-border-hairline flex items-center justify-between font-mono text-[11px] text-muted">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1" title="Tulisan Terbit">
                      <Feather className="w-3 h-3 text-muted" /> {c.articlesCount}
                    </span>
                    <span className="flex items-center gap-1" title="Lencana">
                      <Award className="w-3 h-3 text-muted" /> {c.badgesCount}
                    </span>
                  </div>

                  <Link
                    href={`/u/${c.username}`}
                    className="text-foreground font-semibold hover:underline inline-flex items-center gap-0.5"
                  >
                    Profil <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
