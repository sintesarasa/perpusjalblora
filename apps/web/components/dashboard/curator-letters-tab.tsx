'use client';

import * as React from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { LetterStatus } from '@perpusjal/types';
import { CustomLoader } from '@/components/ui/custom-loader';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Mail,
  Check,
  X,
  Eye,
  RefreshCw,
  AlertCircle,
  Clock,
  User,
  ExternalLink,
  Edit3,
  Send,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AdminLetterItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  originalContent?: string | null;
  displayName?: string | null;
  isAnonymous: boolean;
  createdAt: string;
  status: LetterStatus;
  author: {
    id: string;
    name: string;
    username: string;
    email?: string;
  };
}

export function CuratorLettersTab() {
  const [letters, setLetters] = React.useState<AdminLetterItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Drawer / Preview state
  const [selectedLetter, setSelectedLetter] = React.useState<AdminLetterItem | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // In-drawer edit state (editorial typo correction per FR-SP-02)
  const [isEditingContent, setIsEditingContent] = React.useState(false);
  const [editedContent, setEditedContent] = React.useState('');

  // Modal action state
  const [modalMode, setModalMode] = React.useState<'approve' | 'reject' | null>(null);
  const [targetLetter, setTargetLetter] = React.useState<AdminLetterItem | null>(null);
  const [rejectReason, setRejectReason] = React.useState('');
  const [actionLoading, setActionLoading] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchLetters = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await apiClient<{ data: AdminLetterItem[] }>('/letters/moderation/queue');
    setLoading(false);

    if (res.error) {
      setError(res.error.message || 'Gagal memuat antrean surat pembaca.');
      return;
    }

    if (res.data) {
      setLetters(res.data.data || []);
    }
  }, []);

  React.useEffect(() => {
    fetchLetters();
  }, [fetchLetters]);

  const handleOpenDrawer = (letter: AdminLetterItem) => {
    setSelectedLetter(letter);
    setEditedContent(letter.content);
    setIsEditingContent(false);
    setDrawerOpen(true);
  };

  const handleOpenApproveModal = (letter: AdminLetterItem) => {
    setTargetLetter(letter);
    setEditedContent(letter.content);
    setModalMode('approve');
  };

  const handleOpenRejectModal = (letter: AdminLetterItem) => {
    setTargetLetter(letter);
    setRejectReason('');
    setModalMode('reject');
  };

  const handleExecuteApprove = async () => {
    if (!targetLetter) return;
    setActionLoading(true);

    const isContentModified = editedContent.trim() !== targetLetter.content.trim();
    const payload = isContentModified ? { editedContent: editedContent.trim() } : {};

    const res = await apiClient<{ message: string }>(`/letters/${targetLetter.id}/approve`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setActionLoading(false);

    if (res.error) {
      setFeedback({ type: 'error', message: res.error.message || 'Gagal menyetujui surat pembaca.' });
      return;
    }

    setFeedback({
      type: 'success',
      message: `Surat pembaca "${targetLetter.title}" berhasil disetujui dan diterbitkan ke ruang publik.`,
    });
    setModalMode(null);
    setDrawerOpen(false);
    setSelectedLetter(null);
    fetchLetters();

    setTimeout(() => setFeedback(null), 4000);
  };

  const handleExecuteReject = async () => {
    if (!targetLetter) return;
    if (!rejectReason.trim()) {
      alert('Alasan penolakan surat wajib diisi.');
      return;
    }

    setActionLoading(true);

    const res = await apiClient<{ message: string }>(`/letters/${targetLetter.id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason: rejectReason.trim() }),
    });

    setActionLoading(false);

    if (res.error) {
      setFeedback({ type: 'error', message: res.error.message || 'Gagal menolak surat pembaca.' });
      return;
    }

    setFeedback({
      type: 'success',
      message: `Surat pembaca "${targetLetter.title}" telah ditolak dan alasan terkirim ke penulis.`,
    });
    setModalMode(null);
    setDrawerOpen(false);
    setSelectedLetter(null);
    fetchLetters();

    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Subheader info & refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border-hairline bg-surface-muted/30">
        <div className="space-y-1">
          <span className="font-mono text-xs uppercase tracking-wider font-bold text-foreground flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            Antrean Kurasi Surat Pembaca Warga
          </span>
          <p className="font-sans text-xs text-muted max-w-2xl leading-relaxed">
            Tinjau gagasan, aspirasi, dan kritik konstruktif warga Blora. Kurator berhak menyunting salah tik ringan sebelum diterbitkan, atau menolak jika melanggar etika publik.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs shrink-0">
          <button
            onClick={fetchLetters}
            disabled={loading}
            className="px-3 py-1.5 border border-border hover:border-foreground bg-surface transition-colors inline-flex items-center gap-1.5"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={cn(
            'p-3 border font-mono text-xs flex items-center gap-2',
            feedback.type === 'success'
              ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
              : 'border-destructive bg-destructive/10 text-destructive'
          )}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-destructive" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-16 flex items-center justify-center">
          <CustomLoader size="md" label="MEMUAT SURAT MASUK WARGA..." />
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-6 border border-destructive bg-surface text-center space-y-2 font-mono text-xs">
          <p className="text-destructive font-bold">{error}</p>
          <button
            onClick={fetchLetters}
            className="px-3 py-1 bg-foreground text-background uppercase tracking-wider font-bold"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && letters.length === 0 && (
        <EmptyState
          title="Tidak Ada Surat Pembaca Menunggu Kurasi"
          description="Semua surat yang dikirimkan warga telah ditinjau dan diproses oleh tim redaksi."
        />
      )}

      {/* Queue Table */}
      {!loading && !error && letters.length > 0 && (
        <div className="border border-border bg-surface overflow-x-auto shadow-sm">
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-surface-muted/60 border-b border-border font-mono text-[10px] uppercase tracking-wider text-muted select-none">
              <tr>
                <th className="py-3 px-4">Judul Surat</th>
                <th className="py-3 px-4">Pengirim</th>
                <th className="py-3 px-4">Panjang</th>
                <th className="py-3 px-4">Tanggal Masuk</th>
                <th className="py-3 px-4 text-right">Tindakan Kurasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-hairline">
              {letters.map((letter) => {
                const dateStr = new Date(letter.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                const words = letter.content.trim().split(/\s+/).length;

                return (
                  <tr key={letter.id} className="hover:bg-surface-muted/40 transition-colors">
                    <td className="py-3.5 px-4 font-serif font-medium text-sm text-foreground max-w-sm">
                      <div className="line-clamp-2">{letter.title}</div>
                      <div className="font-mono text-[10px] text-muted truncate mt-0.5">
                        /surat-pembaca/{letter.slug}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs">
                      <div className="text-foreground font-bold">
                        {letter.author.name}
                      </div>
                      <div className="text-[11px] text-muted">@{letter.author.username}</div>
                      {letter.isAnonymous && (
                        <span className="inline-block mt-1 px-1.5 py-0.2 border border-border-hairline bg-surface-muted text-[9px] uppercase tracking-wider text-muted font-bold">
                          Samaran: {letter.displayName || 'Anonim'}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-muted">
                      {words} kata
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-muted whitespace-nowrap">
                      {dateStr}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-xs whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDrawer(letter)}
                          className="h-8 px-2.5 border border-border hover:border-foreground hover:bg-surface-muted transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Baca Surat</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenApproveModal(letter)}
                          className="h-8 px-2.5 bg-foreground text-background font-bold hover:bg-foreground/90 transition-colors inline-flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Setujui</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenRejectModal(letter)}
                          className="h-8 px-2 border border-border text-destructive hover:bg-destructive hover:text-white hover:border-destructive transition-colors inline-flex items-center gap-1"
                          title="Tolak Surat"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Tolak</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* QUICK DRAWER: BACA & SUNTING SURAT PEMBACA */}
      {drawerOpen && selectedLetter && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-background border-l-2 border-foreground h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-border-hairline flex items-center justify-between bg-surface">
              <div className="space-y-0.5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted font-bold">
                  PRATINJAU REDAKSI // SURAT PEMBACA
                </span>
                <h3 className="font-serif text-lg font-bold text-foreground truncate max-w-md">
                  {selectedLetter.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 border border-border hover:border-foreground transition-colors"
                title="Tutup Pratinjau"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Author Metadata Bar */}
            <div className="px-5 py-3 border-b border-border-hairline bg-surface-muted/30 font-mono text-[11px] flex flex-wrap items-center justify-between gap-2 text-muted">
              <div className="flex items-center gap-2">
                <span className="text-foreground font-bold">Pengirim: {selectedLetter.author.name}</span>
                <span>(@{selectedLetter.author.username})</span>
                {selectedLetter.isAnonymous && (
                  <span className="px-1.5 py-0.2 bg-foreground text-background font-bold text-[9px] uppercase">
                    Terbit Anonim: {selectedLetter.displayName}
                  </span>
                )}
              </div>

              <div>
                Terkirim: {new Date(selectedLetter.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-muted border-b border-border-hairline pb-2">
                <span>Isi Surat Pembaca</span>
                <button
                  type="button"
                  onClick={() => setIsEditingContent(!isEditingContent)}
                  className="hover:text-foreground inline-flex items-center gap-1 text-[11px]"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingContent ? 'Kembali ke Tampilan Baca' : 'Koreksi Salah Tik (Redaksi)'}</span>
                </button>
              </div>

              {isEditingContent ? (
                <div className="space-y-2">
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 font-mono text-[11px] text-amber-800 dark:text-amber-300">
                    Kurator diperkenankan mengoreksi salah tik / format ringan tanpa mengubah maksud dan substansi pokok penulis.
                  </div>
                  <textarea
                    rows={12}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full p-4 bg-surface border border-foreground font-serif text-sm leading-relaxed text-foreground focus:outline-none resize-y"
                  />
                </div>
              ) : (
                <div className="font-serif text-base leading-relaxed text-foreground/90 whitespace-pre-wrap space-y-4">
                  {editedContent}
                </div>
              )}
            </div>

            {/* Drawer Sticky Footer */}
            <div className="p-4 border-t border-border-hairline bg-surface flex items-center justify-between gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => handleOpenRejectModal(selectedLetter)}
                className="px-4 py-2 border border-border text-destructive hover:bg-destructive hover:text-white hover:border-destructive transition-colors uppercase tracking-wider font-bold"
              >
                Tolak Surat
              </button>

              <button
                type="button"
                onClick={() => handleOpenApproveModal(selectedLetter)}
                className="px-5 py-2 bg-foreground text-background hover:bg-foreground/90 transition-colors uppercase tracking-wider font-bold inline-flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Setujui &amp; Publikasikan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPROVE CONFIRMATION */}
      {modalMode === 'approve' && targetLetter && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-background border-2 border-foreground p-6 space-y-5 font-sans animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="font-mono text-xs uppercase tracking-widest text-muted font-bold">
                  KONFIRMASI KURATOR // PUBLIKASI SURAT
                </span>
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Setujui Surat Pembaca?
                </h3>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="text-muted hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-surface-muted border border-border-hairline font-sans text-xs text-muted leading-relaxed space-y-2">
              <p>
                Surat berjudul <strong>&quot;{targetLetter.title}&quot;</strong> karya{' '}
                <strong>{targetLetter.author.name}</strong> akan langsung terbit di halaman publik{' '}
                <code className="font-mono text-[11px] bg-surface px-1 py-0.5">/surat-pembaca/{targetLetter.slug}</code>.
              </p>
              {targetLetter.isAnonymous && (
                <p className="text-foreground font-bold">
                  * Surat ini akan tampil dengan nama samaran: &quot;{targetLetter.displayName}&quot;. Identitas asli tetap tersimpan secara rahasia.
                </p>
              )}
            </div>

            {editedContent.trim() !== targetLetter.content.trim() && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/40 text-xs font-mono text-amber-800 dark:text-amber-300">
                Pemberitahuan: Anda telah menyunting koreksi pada teks surat. Teks hasil koreksi akan disimpan sebagai versi publik.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="px-4 py-2 border border-border text-muted hover:text-foreground uppercase tracking-wider"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteApprove}
                disabled={actionLoading}
                className="px-5 py-2 bg-foreground text-background uppercase tracking-widest font-bold hover:bg-foreground/90 disabled:opacity-40"
              >
                {actionLoading ? 'Menerbitkan...' : 'Ya, Terbitkan Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECT SURAT PEMBACA */}
      {modalMode === 'reject' && targetLetter && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-background border-2 border-destructive p-6 space-y-5 font-sans animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="font-mono text-xs uppercase tracking-widest text-destructive font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  KEBIJAKAN EDITORIAL // TOLAK SURAT PEMBACA
                </span>
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Tolak Surat Pembaca
                </h3>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="text-muted hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block font-mono text-xs uppercase tracking-wider text-muted font-bold">
                Alasan Penolakan (Akan Dikirim ke Penulis):
              </label>
              <textarea
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Mengandung promosi komersial tidak relevan / melanggar etika ruang publik / tidak memenuhi batas panjang kata..."
                className="w-full p-3 bg-surface border border-border focus:border-destructive focus:outline-none text-xs leading-relaxed text-foreground font-sans"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="px-4 py-2 border border-border text-muted hover:text-foreground uppercase tracking-wider"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteReject}
                disabled={actionLoading || !rejectReason.trim()}
                className="px-5 py-2 bg-destructive text-white uppercase tracking-widest font-bold hover:bg-destructive/90 disabled:opacity-40"
              >
                {actionLoading ? 'Memproses...' : 'Tolak Surat Ini'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
