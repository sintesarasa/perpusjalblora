'use client';

import * as React from 'react';
import Link from 'next/link';
import { ContributorItem, Role } from '@perpusjal/types';
import {
  Users,
  Award,
  Feather,
  ArrowUpRight,
  Search,
  Sparkles,
  Shield,
  BookOpen,
  Calendar,
  PenTool,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';

// Authentic community fallback if database is empty/fresh during local setup
const FALLBACK_CONTRIBUTORS: ContributorItem[] = [
  {
    id: 'c-fallback-1',
    name: 'Pramono Wibowo',
    username: 'pramono',
    avatarUrl: null,
    bio: 'Menjaga hamparan terpal setiap Minggu pagi di Alun-Alun Blora. Mengagumi sastra realisme sosialis dan sejarah lisan pedesaan.',
    role: Role.KURATOR,
    articlesCount: 14,
    badgesCount: 8,
    joinedAt: '2024-01-15T00:00:00.000Z',
    equippedTitle: 'Penjaga Nyala Literasi',
  },
  {
    id: 'c-fallback-2',
    name: 'Rina Setyowati',
    username: 'rinawarga',
    avatarUrl: null,
    bio: 'Guru honorer dan pegiat dongeng keliling. Suka menulis refleksi pendidikan kaum tertindas dan literasi anak pinggiran.',
    role: Role.USER,
    articlesCount: 9,
    badgesCount: 6,
    joinedAt: '2024-03-20T00:00:00.000Z',
    equippedTitle: 'Pengelana Kata',
  },
  {
    id: 'c-fallback-3',
    name: 'Bagus Wicaksono',
    username: 'bagus_w',
    avatarUrl: null,
    bio: 'Pengarsip arsip keluarga Sedulur Sikep Samin. Mengumpulkan manuskrip tutur dan foto sejarah kawasan hutan jati Blora.',
    role: Role.ADMIN,
    articlesCount: 12,
    badgesCount: 7,
    joinedAt: '2023-11-10T00:00:00.000Z',
    equippedTitle: 'Penjaga Nyala Literasi',
  },
  {
    id: 'c-fallback-4',
    name: 'Siti Nurhaliza',
    username: 'sitinur',
    avatarUrl: null,
    bio: 'Pustakawan swadaya dan penikmat karya-karya Pramoedya Ananta Toer. Rutin merawat kondisi fisik buku pinjaman di terpal.',
    role: Role.KURATOR,
    articlesCount: 7,
    badgesCount: 5,
    joinedAt: '2024-05-02T00:00:00.000Z',
    equippedTitle: 'Pembaca Terpal Amanah',
  },
  {
    id: 'c-fallback-5',
    name: 'Danang Prasetya',
    username: 'danangp',
    avatarUrl: null,
    bio: 'Mahasiswa sejarah dan penulis resensi buku filsafat. Menyumbangkan 20 eksemplar buku saku untuk koleksi bebas baca.',
    role: Role.USER,
    articlesCount: 5,
    badgesCount: 4,
    joinedAt: '2024-07-14T00:00:00.000Z',
    equippedTitle: 'Pengelana Kata',
  },
  {
    id: 'c-fallback-6',
    name: 'Wulan Sekar',
    username: 'wulansekar',
    avatarUrl: null,
    bio: 'Penyair muda Blora. Mengasuh rubrik Puisi Trotoar dan mengorganisir panggung baca puisi terbuka setiap malam purnama.',
    role: Role.USER,
    articlesCount: 11,
    badgesCount: 6,
    joinedAt: '2024-02-18T00:00:00.000Z',
    equippedTitle: 'Pengelana Kata',
  },
];

type RoleFilterType = 'ALL' | 'KURATOR' | 'WRITER' | 'CITIZEN';
type SortOptionType = 'articles' | 'badges' | 'recent';

interface ContributorsDirectoryClientProps {
  initialContributors: ContributorItem[];
}

export function ContributorsDirectoryClient({ initialContributors }: ContributorsDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<RoleFilterType>('ALL');
  const [sortBy, setSortBy] = React.useState<SortOptionType>('articles');

  // Use initial list if available, else fallback list for vibrant community view
  const baseContributors = React.useMemo(() => {
    if (initialContributors && initialContributors.length > 0) {
      return initialContributors;
    }
    return FALLBACK_CONTRIBUTORS;
  }, [initialContributors]);

  // Aggregate Community Metrics
  const totalArticles = React.useMemo(
    () => baseContributors.reduce((acc, curr) => acc + (curr.articlesCount || 0), 0),
    [baseContributors]
  );
  const totalBadges = React.useMemo(
    () => baseContributors.reduce((acc, curr) => acc + (curr.badgesCount || 0), 0),
    [baseContributors]
  );

  // Filtered & Sorted Contributors
  const filteredContributors = React.useMemo(() => {
    let result = [...baseContributors];

    // 1. Search Query Filter (name, username, bio)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q) ||
          (c.bio && c.bio.toLowerCase().includes(q)) ||
          (c.equippedTitle && c.equippedTitle.toLowerCase().includes(q))
      );
    }

    // 2. Role Filter
    if (roleFilter === 'KURATOR') {
      result = result.filter((c) => c.role === Role.KURATOR || c.role === Role.ADMIN);
    } else if (roleFilter === 'WRITER') {
      result = result.filter((c) => c.articlesCount > 0);
    } else if (roleFilter === 'CITIZEN') {
      result = result.filter((c) => c.role === Role.USER);
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === 'articles') return (b.articlesCount || 0) - (a.articlesCount || 0);
      if (sortBy === 'badges') return (b.badgesCount || 0) - (a.badgesCount || 0);
      if (sortBy === 'recent') return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
      return 0;
    });

    return result;
  }, [baseContributors, searchQuery, roleFilter, sortBy]);

  return (
    <div className="space-y-12">
      {/* 1. EDITORIAL MASTHEAD & MANIFESTO */}
      <section className="border-b-2 border-foreground bg-surface py-14 sm:py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-foreground bg-surface-muted font-mono text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-foreground">
              <Users className="w-3.5 h-3.5 text-foreground" />
              <span>[ KOLOPHON KOMUNITAS // DEWAN PEGIAT LAPAK ]</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground uppercase leading-[1.05]">
              Direktori Kontributor <br />
              <span className="italic font-serif font-normal text-foreground/85">
                &amp; Penjaga Nyala Terpal.
              </span>
            </h1>

            <p className="font-serif text-base sm:text-lg text-muted max-w-3xl leading-relaxed">
              Merekalah para warga Blora yang menulis ulasan, menyunting warta, menyumbangkan koleksi
              pribadi, dan menggelar terpal setiap Minggu pagi. Di perpustakaan jalanan, tidak ada hierarki
              birokrasi — setiap kontribusi dicatatkan sebagai kehormatan literasi bersama.
            </p>
          </div>

          {/* Broadsheet Metric Ledger */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t-2 border-b-2 border-foreground py-4 font-mono text-xs">
            <div className="space-y-0.5 border-r border-border-hairline pr-4">
              <span className="text-[10px] uppercase tracking-wider text-muted block">Warga Terdata</span>
              <span className="font-serif font-black text-2xl sm:text-3xl text-foreground">
                {baseContributors.length}
              </span>
            </div>
            <div className="space-y-0.5 border-r border-border-hairline pr-4">
              <span className="text-[10px] uppercase tracking-wider text-muted block">Warta &amp; Ulasan</span>
              <span className="font-serif font-black text-2xl sm:text-3xl text-foreground">
                {totalArticles}
              </span>
            </div>
            <div className="space-y-0.5 border-r border-border-hairline pr-4">
              <span className="text-[10px] uppercase tracking-wider text-muted block">Lencana Kehormatan</span>
              <span className="font-serif font-black text-2xl sm:text-3xl text-foreground">
                {totalBadges}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-wider text-muted block">Biaya Langganan</span>
              <span className="font-serif font-black text-2xl sm:text-3xl text-foreground">
                Rp 0
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-border-hairline pb-6">
          {/* Role Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider">
            {(
              [
                { key: 'ALL', label: `SEMUA (${baseContributors.length})` },
                { key: 'KURATOR', label: 'DEWAN KURATOR' },
                { key: 'WRITER', label: 'PENULIS WARTA' },
                { key: 'CITIZEN', label: 'WARGA PEGIAT' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setRoleFilter(tab.key)}
                className={cn(
                  'px-3 py-1.5 border transition-colors rounded-none font-bold',
                  roleFilter === tab.key
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-surface text-muted border-border-hairline hover:text-foreground hover:border-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input & Sort Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Cari nama, @username, atau bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-border-hairline bg-surface text-foreground font-mono text-xs w-full sm:w-64 focus:border-foreground focus:outline-none placeholder:text-muted rounded-none"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOptionType)}
              className="px-3 py-1.5 border border-border-hairline bg-surface text-foreground font-mono text-xs focus:border-foreground focus:outline-none rounded-none"
            >
              <option value="articles">Urutkan: Tulisan Terbanyak</option>
              <option value="badges">Urutkan: Lencana Terbanyak</option>
              <option value="recent">Urutkan: Warga Terbaru</option>
            </select>
          </div>
        </div>
      </section>

      {/* 3. CONTRIBUTORS GRID */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8">
        {filteredContributors.length === 0 ? (
          <div className="border-2 border-dashed border-border-hairline p-16 text-center bg-surface space-y-3">
            <Users className="w-10 h-10 mx-auto text-muted stroke-1" />
            <h3 className="font-serif text-lg font-bold text-foreground">Tidak Ada Kontributor Ditemukan</h3>
            <p className="font-sans text-xs text-muted max-w-sm mx-auto">
              Tidak ada warga yang cocok dengan kata kunci &ldquo;{searchQuery}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('ALL');
              }}
              className="px-4 py-2 border border-foreground font-mono text-xs uppercase font-bold hover:bg-foreground hover:text-background transition-colors rounded-none"
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContributors.map((c, idx) => {
              const honoraryTitle =
                c.equippedTitle ||
                (c.role === Role.KURATOR
                  ? 'Dewan Kurator Lapak'
                  : c.role === Role.ADMIN
                  ? 'Pengurus Pusat'
                  : c.articlesCount >= 5
                  ? 'Pengelana Kata'
                  : 'Pembaca Terpal Amanah');

              return (
                <RevealOnScroll key={c.id} variant="fade-up" delayMs={idx * 40}>
                  <div className="border border-border-hairline bg-surface p-6 flex flex-col justify-between hover:border-foreground transition-all group h-full rounded-none relative">
                    {/* Top Identity Block */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        {/* Grayscale Avatar with Sharp Double Frame */}
                        <div className="w-13 h-13 border-2 border-foreground bg-surface-muted text-foreground flex items-center justify-center font-serif text-xl font-bold uppercase select-none shrink-0 rounded-none overflow-hidden">
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

                        {/* Role Badge */}
                        <div className="text-right">
                          <span
                            className={cn(
                              'font-mono text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 border rounded-none block',
                              c.role === Role.ADMIN || c.role === Role.KURATOR
                                ? 'bg-foreground text-background border-foreground'
                                : 'bg-surface text-foreground border-border-hairline'
                            )}
                          >
                            {c.role === Role.ADMIN
                              ? '■ PENGURUS PUSAT'
                              : c.role === Role.KURATOR
                              ? '● KURATOR LAPAK'
                              : '○ WARGA PEGIAT'}
                          </span>
                        </div>
                      </div>

                      {/* Name, Username, Honorary Title */}
                      <div className="space-y-1">
                        <h2 className="font-serif text-xl font-black text-foreground group-hover:underline tracking-tight">
                          <Link href={`/u/${c.username}`}>{c.name}</Link>
                        </h2>
                        <p className="font-mono text-xs text-muted">@{c.username}</p>

                        <div className="pt-1">
                          <span className="inline-block px-2 py-0.5 bg-surface-muted border border-border-hairline font-mono text-[9px] uppercase font-bold tracking-wider text-foreground/90 rounded-none">
                            {honoraryTitle}
                          </span>
                        </div>
                      </div>

                      {/* Bio Quotation */}
                      {c.bio ? (
                        <p className="font-serif italic text-xs text-foreground/80 leading-relaxed border-l-2 border-border-hairline pl-3 line-clamp-3">
                          &ldquo;{c.bio}&rdquo;
                        </p>
                      ) : (
                        <p className="font-serif italic text-xs text-muted/60 leading-relaxed border-l-2 border-border-hairline pl-3">
                          &ldquo;Warga yang merawat dan membaca buku di hamparan terpal Blora.&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Bottom Contribution Ledger & Link */}
                    <div className="pt-5 mt-6 border-t border-border-hairline flex items-center justify-between font-mono text-[11px] text-muted">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5" title="Warta & Ulasan Terbit">
                          <Feather className="w-3.5 h-3.5 text-foreground" />
                          <span className="font-bold text-foreground">{c.articlesCount || 0}</span>
                          <span className="text-[10px] text-muted">Karya</span>
                        </span>
                        <span className="flex items-center gap-1.5" title="Lencana Kehormatan">
                          <Award className="w-3.5 h-3.5 text-foreground" />
                          <span className="font-bold text-foreground">{c.badgesCount || 0}</span>
                          <span className="text-[10px] text-muted">Lencana</span>
                        </span>
                      </div>

                      <Link
                        href={`/u/${c.username}`}
                        className="text-foreground font-bold hover:underline inline-flex items-center gap-1 uppercase text-[10px] tracking-wider"
                      >
                        <span>Berkas</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. CALL TO ACTION: BERGABUNG MENJADI PEGIAT */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 pb-12">
        <div className="border-2 border-foreground bg-surface p-8 sm:p-12 text-center space-y-6 rounded-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-foreground bg-foreground text-background font-mono text-[9px] uppercase tracking-widest font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PANGGILAN PARTISIPASI // TINTA &amp; TERPAL</span>
          </div>

          <div className="max-w-2xl mx-auto space-y-2">
            <h3 className="font-serif text-2xl sm:text-4xl font-black uppercase text-foreground leading-tight">
              Ingin Menulis Warta atau Menyumbang Koleksi?
            </h3>
            <p className="font-serif italic text-sm sm:text-base text-muted leading-relaxed">
              Ruang naskah dan hamparan terpal kami terbuka selebar-lebarnya untuk setiap warga Blora.
              Tulis ulasan buku pertamamu di Studio Naskah atau temui kami di Alun-Alun Blora.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2 font-mono text-xs uppercase font-bold tracking-wider">
            <Link
              href="/dashboard/tulisan/tulis"
              className="px-6 py-3.5 bg-foreground text-background hover:bg-foreground/90 transition-colors inline-flex items-center gap-2 border border-foreground rounded-none"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>BUKA STUDIO NASKAH</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/tentang"
              className="px-6 py-3.5 border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors inline-flex items-center gap-2 rounded-none"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>PELAJARI GERAKAN LITERASI</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
