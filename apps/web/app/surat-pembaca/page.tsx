'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CustomLoader } from '@/components/ui/custom-loader';
import { Pagination } from '@/components/ui/pagination';
import { apiClient } from '@/lib/api';
import { LetterItem } from '@perpusjal/types';
import {
  PenLine,
  MessageSquare,
  Send,
  X,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Quote,
} from 'lucide-react';

interface LettersApiResponse {
  data: LetterItem[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

function ReaderLettersContent() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [letters, setLetters] = React.useState<LetterItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [meta, setMeta] = React.useState({ page: 1, perPage: 10, total: 0, totalPages: 1 });

  // Modal State
  const [modalOpen, setModalOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [isAnonymous, setIsAnonymous] = React.useState(false);
  const [displayName, setDisplayName] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [modalError, setModalError] = React.useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = React.useState<string | null>(null);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const isWordCountValid = wordCount >= 50 && wordCount <= 2500;

  const fetchLetters = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    const res = await apiClient<LettersApiResponse>(`/letters?page=${page}&perPage=10`);

    setLoading(false);

    if (res.error) {
      setError(res.error.message);
      return;
    }

    if (res.data) {
      setLetters(res.data.data || []);
      setMeta(res.data.meta || { page: 1, perPage: 10, total: 0, totalPages: 1 });
    }
  }, [page]);

  React.useEffect(() => {
    fetchLetters();
  }, [fetchLetters]);

  const handleSubmitLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !isWordCountValid) return;

    setSubmitting(true);
    setModalError(null);

    const res = await apiClient<{ message: string }>('/letters', {
      method: 'POST',
      body: JSON.stringify({
        title: title.trim(),
        content: content.trim(),
        isAnonymous,
        displayName: displayName.trim() || undefined,
      }),
    });

    setSubmitting(false);

    if (res.error) {
      setModalError(res.error.message);
      return;
    }

    setModalSuccess(
      res.data?.message || 'Surat pembaca berhasil dikirim dan menunggu telaah kurator redaksi.'
    );
    setTitle('');
    setContent('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 space-y-10">
        {/* Gazette Masthead */}
        <div className="border-b-2 border-foreground pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs text-muted uppercase tracking-widest">
              <span>FORUM WARGA & KORAN CETAK</span>
              <span>// DIALEKTIKA KOMUNITAS</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              Surat Pembaca
            </h1>
            <p className="font-sans text-sm text-muted max-w-2xl leading-relaxed">
              Kanal terbuka bagi warga dan pegiat literasi Blora untuk menyampaikan pandangan, kritik,
              pengalaman membaca, ataupun gagasan sosial kemasyarakatan.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => {
                setModalOpen(true);
                setModalSuccess(null);
                setModalError(null);
              }}
              className="px-6 py-3 bg-foreground text-background font-mono text-xs uppercase tracking-widest font-bold hover:bg-foreground/90 transition-colors inline-flex items-center gap-2"
            >
              <PenLine className="w-4 h-4" />
              <span>Tulis Surat Pembaca</span>
            </button>
          </div>
        </div>

        {/* Letters List */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <CustomLoader size="lg" label="MEMBUKA LEMBARAN SURAT WARGA..." />
          </div>
        ) : error ? (
          <div className="p-8 border border-foreground bg-surface-muted text-center space-y-3 font-mono text-xs">
            <p className="text-foreground">{error}</p>
            <button
              onClick={fetchLetters}
              className="px-4 py-1.5 bg-foreground text-background font-bold uppercase tracking-wider"
            >
              Coba Lagi
            </button>
          </div>
        ) : letters.length === 0 ? (
          <div className="py-16 text-center border-2 border-foreground bg-surface p-8 space-y-3">
            <span className="font-mono text-xs text-muted uppercase tracking-widest">
              [ KOLOM KOSONG ]
            </span>
            <h2 className="font-serif text-2xl font-normal text-foreground">
              Belum Ada Surat Pembaca yang Diterbitkan
            </h2>
            <p className="font-sans text-xs text-muted max-w-md mx-auto">
              Jadilah pembaca pertama yang menuangkan aspirasi atau cerita literasi di ruang koran warga ini.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {letters.map((letter) => (
                <article
                  key={letter.id}
                  className="border border-border-hairline bg-surface hover:border-foreground transition-all duration-150 p-6 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between font-mono text-xs text-muted border-b border-border-hairline pb-2">
                      <span className="font-bold text-foreground inline-flex items-center gap-1.5">
                        <User className="w-3 h-3 text-muted" />
                        {letter.displayName}
                      </span>
                      <span>
                        {letter.publishedAt
                          ? new Date(letter.publishedAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '-'}
                      </span>
                    </div>

                    <Link href={`/surat-pembaca/${letter.slug}`} className="block">
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground leading-snug group-hover:underline underline-offset-2">
                        {letter.title}
                      </h2>
                    </Link>

                    {/* Pull Quote Opening 2 Lines */}
                    <blockquote className="font-serif italic text-sm text-foreground/80 border-l-2 border-foreground pl-3 py-0.5 line-clamp-2">
                      &ldquo;{letter.excerpt}&rdquo;
                    </blockquote>
                  </div>

                  <div className="pt-3 border-t border-border-hairline flex items-center justify-between font-mono text-xs text-muted">
                    <span className="inline-flex items-center gap-1 text-[11px]">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {letter.commentCount} Tanggapan Warga
                    </span>

                    <Link
                      href={`/surat-pembaca/${letter.slug}`}
                      className="font-bold text-foreground group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 uppercase tracking-wider text-[11px]"
                    >
                      <span>Baca Surat</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="pt-8 border-t border-border-hairline flex justify-center">
                <Pagination
                  currentPage={meta.page}
                  totalPages={meta.totalPages}
                  createPageUrl={(p) => `/surat-pembaca?page=${p}`}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Submission Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-surface border-2 border-foreground p-6 space-y-5 shadow-2xl font-sans">
            <div className="flex items-center justify-between border-b border-border-hairline pb-3">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-bold text-foreground">
                <PenLine className="w-4 h-4" />
                <span>FORMULIR SURAT PEMBACA</span>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-muted hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalSuccess ? (
              <div className="space-y-4 text-center py-6">
                <div className="w-12 h-12 border-2 border-foreground mx-auto flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  Surat Berhasil Dikirim!
                </h3>
                <p className="font-sans text-xs text-muted max-w-sm mx-auto leading-relaxed">
                  {modalSuccess} Redaksi akan meninjau surat Anda dalam 7 hari kerja sebelum terbit di kolom koran warga.
                </p>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-widest font-bold"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitLetter} className="space-y-4">
                <div className="space-y-1">
                  <label className="block font-mono text-xs uppercase text-foreground">
                    Judul Surat:
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Tuliskan pokok pandangan Anda..."
                    maxLength={120}
                    className="w-full p-2.5 bg-surface-muted border border-border-hairline rounded-none text-sm text-foreground focus:outline-none focus:border-foreground font-serif"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block font-mono text-xs uppercase text-foreground">
                      Isi Surat Pembaca (Plain Text):
                    </label>
                    <span
                      className={`font-mono text-[11px] ${
                        wordCount > 0 && !isWordCountValid ? 'text-destructive font-bold' : 'text-muted'
                      }`}
                    >
                      {wordCount} kata (Syarat: 50 – 2.500 kata)
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Sampaikan gagasan, apresiasi, cerita komunitas, atau kritik Anda secara santun dan bertanggung jawab..."
                    className="w-full p-3 bg-surface-muted border border-border-hairline rounded-none text-sm text-foreground focus:outline-none focus:border-foreground leading-relaxed resize-y font-sans"
                  />
                </div>

                <div className="p-3 bg-surface-muted border border-border-hairline space-y-3 font-mono text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded-none border-foreground"
                    />
                    <span className="text-foreground font-bold">
                      Tampilkan Sebagai Anonim (&ldquo;Warga Blora&rdquo;)
                    </span>
                  </label>

                  {!isAnonymous && (
                    <div className="space-y-1">
                      <label className="block text-[11px] text-muted uppercase">Nama Tampilan:</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Nama lengkap atau nama pena..."
                        className="w-full p-2 bg-surface border border-border-hairline rounded-none text-xs"
                      />
                    </div>
                  )}

                  <p className="text-[10px] text-muted italic">
                    Identitas asli pengirim tetap dicatat di server demi akuntabilitas hukum.
                  </p>
                </div>

                {modalError && (
                  <div className="p-3 border border-destructive bg-surface-muted text-xs font-mono text-destructive">
                    {modalError}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-3 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-border-hairline text-muted hover:text-foreground uppercase tracking-wider"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !title.trim() || !isWordCountValid}
                    className="px-5 py-2 bg-foreground text-background font-bold uppercase tracking-widest hover:bg-foreground/90 disabled:opacity-40 transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submitting ? 'Mengirim...' : 'Kirim Surat'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function ReaderLettersPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <CustomLoader size="md" label="MEMBUKA LEMBARAN SURAT WARGA..." />
        </div>
      }
    >
      <ReaderLettersContent />
    </React.Suspense>
  );
}

