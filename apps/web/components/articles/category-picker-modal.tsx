'use client';

import * as React from 'react';
import { ArticleCategory } from '@perpusjal/types';
import { cn } from '@/lib/utils';
import {
  X,
  CheckCircle2,
  BookOpen,
  MapPin,
  MessageSquareQuote,
  TreePine,
  Scroll,
  Feather,
  Sparkles,
  Info,
  Check,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

export interface CategoryGuide {
  slug: string;
  number: string;
  name: string;
  tagline: string;
  description: string;
  suitableFor: string[];
  avoidFor?: string;
  group: 'lapak' | 'isu' | 'sastra';
  icon: React.ComponentType<{ className?: string }>;
}

export const OFFICIAL_CATEGORY_GUIDES: Record<string, CategoryGuide> = {
  'suara-lapak': {
    slug: 'suara-lapak',
    number: '01',
    name: 'Suara Lapak',
    tagline: 'Catatan dari jalanan & perjumpaan buku di ruang terbuka.',
    description:
      'Wadah untuk merekam dinamika ruang baca terbuka, suka-duka para relawan, cerita pengunjung lapak buku Alun-Alun, dan perjumpaan kultural warga.',
    suitableFor: [
      'Kisah nyata relawan dan aktivitas gelar buku di trotoar / taman',
      'Dialog atau obrolan berkesan dengan pembaca di lapak buku',
      'Refleksi gerakan literasi jalanan dan akses bacaan terbuka',
    ],
    avoidFor: 'Kajian kebijakan teoritis formal atau ulasan teknis buku tertentu.',
    group: 'lapak',
    icon: BookOpen,
  },
  'pojok-blora': {
    slug: 'pojok-blora',
    number: '02',
    name: 'Pojok Blora',
    tagline: 'Sketsa sosial, tradisi, & denyut kehidupan lokal Blora.',
    description:
      'Merekam realitas lokalitas Blora dari sudut pandang warga biasa: potret pasar rakyat, tradisi sedekah bumi, kesenian Barongan, hingga kabar dari desa-desa pelosok.',
    suitableFor: [
      'Warta budaya lokal, folklor desa, dan tradisi warga Blora',
      'Profil pedagang pasar, pengrajin rakyat, atau pejuang keseharian',
      'Sketsa kehidupan dan cerita keseharian dari sudut-sudut wilayah Blora',
    ],
    avoidFor: 'Opini murni tanpa kaitan konteks lokalitas daerah.',
    group: 'lapak',
    icon: MapPin,
  },
  'opini-warga': {
    slug: 'opini-warga',
    number: '03',
    name: 'Opini Warga',
    tagline: 'Pikiran kritis, suara aspirasi, & gagasan perbaikan daerah.',
    description:
      'Ruang demokrasi dan nalar warga untuk menyampaikan pandangan kritis, telaah sosial, serta saran konstruktif atas isu publik, tata ruang, dan kebijakan di sekitar.',
    suitableFor: [
      'Argumen kritis atas fasilitas umum, pendidikan, atau tata kota',
      'Ulasan perspektif warga atas fenomena sosial kemasyarakatan',
      'Gagasan solusi dan usulan konkret untuk kemajuan lingkungan sekitar',
    ],
    avoidFor: 'Ujaran kebencian, fitnah personal, atau bait sajak puitik.',
    group: 'isu',
    icon: MessageSquareQuote,
  },
  lingkungan: {
    slug: 'lingkungan',
    number: '04',
    name: 'Lingkungan',
    tagline: 'Hutan jati, ekologi bumi, krisis air, & kelestarian alam.',
    description:
      'Fokus pada hubungan manusia dengan alam tanah Blora: nasib hutan jati, krisis air musiman, pengelolaan sampah, kelestarian mata air, dan krisis iklim lokal.',
    suitableFor: [
      'Advokasi dan catatan krisis kekeringan atau air bersih',
      'Kondisi hutan jati, kawasan perhutani, dan ekosistem lokal',
      'Inisiatif warga dalam merawat bumi, bank sampah, dan penghijauan',
    ],
    avoidFor: 'Curahan hati personal yang tidak menyentuh tema alam/ekologi.',
    group: 'isu',
    icon: TreePine,
  },
  sejarah: {
    slug: 'sejarah',
    number: '05',
    name: 'Sejarah',
    tagline: 'Memori masa lalu, arsip lisan, falsafah Samin, & jejak Pramoedya.',
    description:
      'Menggali kembali memori kolektif, tokoh bersejarah, narasi lisan leluhur, serta warisan literatur besar yang lahir dari tanah Blora.',
    suitableFor: [
      'Jejak langkah dan pemikiran Pramoedya Ananta Toer',
      'Ajaran kejujuran Sedulur Sikep / gerakan Samin Surosentiko',
      'Asal-usul nama desa, peristiwa masa lalu, dan tradisi lisan tetua',
    ],
    avoidFor: 'Kabar peristiwa hari ini tanpa refleksi historis masa lalu.',
    group: 'isu',
    icon: Scroll,
  },
  puisi: {
    slug: 'puisi',
    number: '06',
    name: 'Puisi',
    tagline: 'Bait sastra, sajak liris, karya puisi, & ekspresi rasa.',
    description:
      'Ruang estetik untuk karya sajak murni warga: untaian baris berima atau sajak bebas yang merekam getar rasa, rindu, duka, perlawanan, dan keindahan bahasa.',
    suitableFor: [
      'Karya puisi baris demi baris (sajak bebas maupun terikat)',
      'Eksplorasi estetika kata, metafora, dan ritme bahasa',
      'Ekspresi puitik atas kegelisahan batin atau realitas sosial',
    ],
    avoidFor: 'Naskah berbentuk esai narasi panjang atau artikel opini umum.',
    group: 'sastra',
    icon: Feather,
  },
  'refleksi-diri': {
    slug: 'refleksi-diri',
    number: '07',
    name: 'Refleksi Diri',
    tagline: 'Kontemplasi batin, renungan personal, & pencarian makna hidup.',
    description:
      'Catatan perenungan batin yang intim dan jujur: memoar kecil, pergulatan menghadapi kegagalan, makna kebersahajaan, dan hikmah berharga dari keseharian hidup.',
    suitableFor: [
      'Memoar personal atau perenungan pengalaman hidup mendalam',
      'Catatan kontemplatif tentang kesehatan mental dan pencarian arah',
      'Pelajaran moral dan hikmah yang dipetik dari peristiwa sehari-hari',
    ],
    avoidFor: 'Laporan berita formal atau kritik kebijakan publik murni.',
    group: 'sastra',
    icon: Sparkles,
  },
};

interface CategoryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ArticleCategory[];
  selectedId: string;
  onSelect: (category: ArticleCategory) => void;
  currentTitle?: string;
  currentWordCount?: number;
}

export function CategoryPickerModal({
  isOpen,
  onClose,
  categories,
  selectedId,
  onSelect,
  currentTitle = '',
  currentWordCount = 0,
}: CategoryPickerModalProps) {
  const [activeTab, setActiveTab] = React.useState<'all' | 'lapak' | 'isu' | 'sastra'>('all');
  const [tempSelectedId, setTempSelectedId] = React.useState(selectedId);

  React.useEffect(() => {
    setTempSelectedId(selectedId);
  }, [selectedId, isOpen]);

  if (!isOpen) return null;

  // Map category to guide
  const enrichedCategories = categories.map((cat) => {
    const guide = OFFICIAL_CATEGORY_GUIDES[cat.slug] || {
      slug: cat.slug,
      number: '•',
      name: cat.name,
      tagline: cat.description || 'Rubrik naskah warga.',
      description: cat.description || '',
      suitableFor: ['Karya tulis yang sesuai dengan topik rubrik ini.'],
      group: 'isu' as const,
      icon: BookOpen,
    };
    return { ...cat, guide };
  });

  const filtered = enrichedCategories.filter((c) => {
    if (activeTab === 'all') return true;
    return c.guide.group === activeTab;
  });

  const currentSelectedCategory = enrichedCategories.find((c) => c.id === tempSelectedId);

  const handleApply = () => {
    const chosen = categories.find((c) => c.id === tempSelectedId);
    if (chosen) {
      onSelect(chosen);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl bg-background border-t-2 sm:border-2 border-foreground rounded-t-2xl sm:rounded-none max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>

        {/* ── Modal Header ── */}
        <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-4 bg-surface-muted/20">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted font-bold">
              // PANDUAN TAKSONOMI REDAKSI
            </p>
            <h2 className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-foreground mt-0.5">
              Pilih Rubrik Tulisan Anda
            </h2>
            <p className="font-sans text-xs text-muted mt-1 leading-snug">
              Pahami corak dan panduan tiap rubrik di bawah agar naskah Anda terkurasi tepat sasaran.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted hover:text-foreground transition-colors shrink-0"
            title="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="flex border-b border-border-hairline px-5 bg-surface overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'Semua Rubrik (7)' },
            { id: 'lapak', label: 'Lapak & Blora' },
            { id: 'isu', label: 'Isu, Opini & Sejarah' },
            { id: 'sastra', label: 'Puisi & Refleksi' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'py-2.5 px-3 font-mono text-[11px] uppercase tracking-wider transition-colors border-b-2 -mb-px shrink-0 whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-foreground text-foreground font-bold'
                  : 'border-transparent text-muted hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Cards Scroll Area ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-background">
          {filtered.map((item) => {
            const isSelected = item.id === tempSelectedId;
            const Icon = item.guide.icon;

            return (
              <div
                key={item.id}
                onClick={() => setTempSelectedId(item.id)}
                className={cn(
                  'border-2 p-4 cursor-pointer transition-all duration-150 relative text-left select-none',
                  isSelected
                    ? 'border-foreground bg-surface-muted/40 shadow-xs ring-1 ring-foreground'
                    : 'border-border hover:border-foreground/60 bg-surface hover:bg-surface-muted/20'
                )}
              >
                {/* Header row of card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        'font-mono text-[10px] font-bold px-2 py-0.5 border',
                        isSelected
                          ? 'bg-foreground text-background border-foreground'
                          : 'bg-background text-muted border-border'
                      )}
                    >
                      {item.guide.number}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-foreground leading-none">
                      {item.name}
                    </h3>
                  </div>

                  {/* Radio / Selection Indicator */}
                  <div className="shrink-0 mt-0.5">
                    {isSelected ? (
                      <div className="w-5 h-5 bg-foreground text-background flex items-center justify-center rounded-none">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 border border-border bg-background" />
                    )}
                  </div>
                </div>

                {/* Tagline */}
                <p className="font-serif italic text-sm text-foreground/90 mt-2 leading-snug">
                  &ldquo;{item.guide.tagline}&rdquo;
                </p>

                {/* Detailed Description */}
                <p className="font-sans text-xs text-muted mt-1.5 leading-relaxed">
                  {item.guide.description}
                </p>

                {/* Guidelines Box */}
                <div className="mt-3 pt-3 border-t border-border-hairline space-y-2">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted font-bold block mb-1">
                      ✓ Sangat Cocok Untuk:
                    </span>
                    <ul className="grid grid-cols-1 gap-1">
                      {item.guide.suitableFor.map((tip, idx) => (
                        <li key={idx} className="font-sans text-[11px] text-foreground/80 flex items-start gap-1.5 leading-tight">
                          <span className="text-emerald-600 font-bold shrink-0">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {item.guide.avoidFor && (
                    <div className="pt-1 flex items-start gap-1.5 font-sans text-[11px] text-amber-700 dark:text-amber-300">
                      <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                      <span><strong>Hindari:</strong> {item.guide.avoidFor}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Modal Footer ── */}
        <div className="px-5 py-3.5 border-t border-border bg-surface flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="min-w-0">
            {currentSelectedCategory ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase text-muted">Rubrik Terpilih:</span>
                <span className="font-mono text-xs font-bold uppercase text-foreground">
                  [{currentSelectedCategory.guide.number} // {currentSelectedCategory.name}]
                </span>
              </div>
            ) : (
              <span className="font-mono text-xs text-muted">Pilih salah satu rubrik</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none h-10 px-4 border border-border text-foreground hover:bg-surface-muted font-mono text-xs uppercase tracking-wider transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 sm:flex-none h-10 px-6 bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold hover:opacity-90 transition-opacity"
            >
              Pilih Rubrik Ini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
