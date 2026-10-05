'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';

interface SeoAnalysisPanelProps {
  title: string;
  plainText: string;
  tags: string[]; // tag names
  coverImage: string;
  className?: string;
}

interface CheckItem {
  id: string;
  label: string;
  pass: boolean;
  warning?: boolean; // amber instead of red
  detail?: string;
}

function scoreColor(score: number) {
  return 'text-foreground font-bold';
}

function scoreLabel(score: number) {
  if (score >= 80) return 'SIAP TERBIT';
  if (score >= 50) return 'PERLU PERBAIKAN';
  return 'BUTUH PERHATIAN';
}

// Simple sentence count from text
function countSentences(text: string): number {
  return (text.match(/[.!?]+/g) || []).length || 1;
}

// Average words per sentence
function avgWordsPerSentence(text: string, wordCount: number): number {
  const sentences = countSentences(text);
  return Math.round(wordCount / sentences);
}

export function SeoAnalysisPanel({ title, plainText, tags, coverImage, className }: SeoAnalysisPanelProps) {
  const [open, setOpen] = React.useState(false);
  const [focusKeyword, setFocusKeyword] = React.useState('');

  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const titleLen = title.trim().length;
  const avgSentenceLen = avgWordsPerSentence(plainText, wordCount);

  // Build checklist
  const checks: CheckItem[] = [
    {
      id: 'title-length',
      label: 'Panjang judul 50–70 karakter',
      pass: titleLen >= 50 && titleLen <= 70,
      warning: titleLen > 0 && titleLen < 50,
      detail: titleLen > 0 ? `${titleLen} karakter` : 'Judul belum diisi',
    },
    {
      id: 'word-count-min',
      label: 'Minimal 300 kata (konten SEO dasar)',
      pass: wordCount >= 300,
      warning: wordCount >= 100 && wordCount < 300,
      detail: `${wordCount} kata`,
    },
    {
      id: 'word-count-good',
      label: 'Lebih dari 600 kata (konten menengah)',
      pass: wordCount >= 600,
      warning: wordCount >= 300 && wordCount < 600,
      detail: `${wordCount} kata`,
    },
    {
      id: 'has-cover',
      label: 'Gambar sampul artikel tersedia',
      pass: !!coverImage,
      detail: coverImage ? 'Sampul terpasang' : 'Belum ada gambar sampul',
    },
    {
      id: 'has-tags',
      label: 'Minimal 2 tag kata kunci',
      pass: tags.length >= 2,
      warning: tags.length === 1,
      detail: tags.length === 0 ? 'Belum ada tag' : `${tags.length} tag terpilih`,
    },
    {
      id: 'sentence-length',
      label: 'Rata-rata kalimat < 25 kata (mudah dibaca)',
      pass: wordCount > 0 && avgSentenceLen <= 25,
      warning: avgSentenceLen > 25 && avgSentenceLen <= 35,
      detail: wordCount > 0 ? `Rata-rata ${avgSentenceLen} kata/kalimat` : 'Belum ada teks',
    },
    {
      id: 'keyword-in-title',
      label: 'Kata kunci fokus ada di judul',
      pass: !!focusKeyword && title.toLowerCase().includes(focusKeyword.toLowerCase()),
      warning: !focusKeyword,
      detail: !focusKeyword ? 'Masukkan kata kunci fokus di bawah' : focusKeyword,
    },
    {
      id: 'keyword-in-text',
      label: 'Kata kunci fokus muncul di naskah',
      pass: !!focusKeyword && plainText.toLowerCase().includes(focusKeyword.toLowerCase()),
      warning: !focusKeyword,
      detail: !focusKeyword
        ? 'Isi kata kunci fokus dulu'
        : focusKeyword && plainText.toLowerCase().includes(focusKeyword.toLowerCase())
        ? 'Ditemukan dalam naskah'
        : 'Tidak ditemukan dalam naskah',
    },
  ];

  const passed = checks.filter((c) => c.pass).length;
  const score = Math.round((passed / checks.length) * 100);

  // Meta preview (Google Search snippet)
  const metaTitle = title.trim() || '(Judul belum diisi)';
  const metaDesc =
    plainText.trim().slice(0, 155).trim() + (plainText.length > 155 ? '...' : '') ||
    '(Isi naskah belum ada)';

  return (
    <div className={cn('border border-border bg-surface', className)}>
      {/* Header — always visible, click to expand */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <TrendingUp className="w-4 h-4 text-muted shrink-0" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
            Analisis SEO & Keterbacaan
          </span>
          {/* Score pill */}
          <span className={cn('font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border', scoreColor(score))}>
            {score}% · {scoreLabel(score)}
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
      </button>

      {open && (
        <div className="border-t border-border-hairline p-4 space-y-5">
          {/* Keyword Focus Input */}
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted font-bold block">
              Kata Kunci Fokus Artikel
            </label>
            <input
              type="text"
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
              placeholder="Cth: literasi komunitas Blora"
              className="w-full h-10 px-3 border border-border-hairline bg-background font-sans text-sm sm:text-xs focus:border-foreground focus:outline-none"
            />
            <p className="font-sans text-[11px] text-muted">
              Kata kunci yang paling mewakili topik naskahmu.
            </p>
          </div>

          {/* Score Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase text-muted">
              <span>Skor Optimasi</span>
              <span className={cn('font-bold text-xs', scoreColor(score))}>{score}%</span>
            </div>
            <div className="h-2 bg-surface-muted border border-border-hairline rounded-none overflow-hidden">
              <div
                className="h-full bg-foreground transition-all duration-500 rounded-none"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-1.5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted font-bold">
              Checklist ({passed}/{checks.length})
            </p>
            <div className="space-y-1">
              {checks.map((check) => (
                <div key={check.id} className="flex items-start gap-2.5 py-1.5 border-b border-border-hairline last:border-b-0">
                  <div className="mt-0.5 shrink-0">
                    {check.pass ? (
                      <CheckCircle2 className="w-4 h-4 text-foreground" />
                    ) : check.warning ? (
                      <AlertTriangle className="w-4 h-4 text-foreground/70" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('font-sans text-xs', check.pass ? 'text-foreground/70' : 'text-foreground')}>{check.label}</p>
                    {check.detail && (
                      <p className="font-mono text-[10px] text-muted mt-0.5">{check.detail}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats quick view */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Kata', value: wordCount.toLocaleString('id-ID') },
              { label: 'Judul', value: `${titleLen} kar` },
              { label: 'Tag', value: `${tags.length}/5` },
            ].map((s) => (
              <div key={s.label} className="p-2.5 border border-border-hairline bg-surface-muted/20 text-center">
                <p className="font-mono text-[10px] text-muted uppercase">{s.label}</p>
                <p className="font-serif text-base font-semibold text-foreground mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Google Preview */}
          <div className="space-y-1.5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted font-bold">
              Pratinjau Hasil Pencarian (Google)
            </p>
            <div className="p-3 border border-border-hairline bg-surface space-y-1 rounded-none">
              <p className="font-sans text-[11px] text-muted truncate">perpusjalblora.org › artikel</p>
              <p className="font-sans text-sm text-blue-700 dark:text-blue-400 font-medium leading-snug line-clamp-2">
                {metaTitle}
              </p>
              <p className="font-sans text-xs text-muted leading-relaxed line-clamp-2">
                {metaDesc}
              </p>
            </div>
          </div>

          {/* Readability Tips */}
          <div className="p-3 bg-surface-muted/30 border border-border-hairline space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted font-bold">Tips Keterbacaan</p>
            <ul className="font-sans text-[11px] text-muted space-y-0.5 list-disc list-inside">
              <li>Gunakan kalimat pendek (maks. 25 kata per kalimat)</li>
              <li>Setiap paragraf maksimal 3–4 kalimat</li>
              <li>Tambahkan subjudul (H2/H3) setiap 300 kata</li>
              <li>Kata kunci fokus muncul di 100 kata pertama</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
