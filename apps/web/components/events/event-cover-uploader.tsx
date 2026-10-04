'use client';

import * as React from 'react';
import { adaptiveCompress, formatBytes } from '@/lib/image-compressor';
import {
  UploadCloud,
  Link as LinkIcon,
  Trash2,
  RefreshCw,
  Camera,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';

interface EventCoverUploaderProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

const COVER_PRESETS = [
  {
    name: 'Terpal CFD Alun-Alun',
    url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Diskusi Buku Malam',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Workshop & Kriya Anak',
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Kemah Tepi Hutan Jati',
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1000&q=80',
  },
];

const MAX_TARGET_BYTES = 200 * 1024; // Strict limit: < 200 KB

export function EventCoverUploader({ value, onChange, className = '' }: EventCoverUploaderProps) {
  const [tabMode, setTabMode] = React.useState<'upload' | 'preset' | 'url'>('upload');
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Compression & Upload State
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [stage, setStage] = React.useState<'idle' | 'compressing' | 'uploading' | 'complete' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = React.useState('');
  const [sizeTelemetry, setSizeTelemetry] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Berkas harus berupa gambar (JPG, PNG, WebP).');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    setStage('compressing');
    setStatusMessage('Mengompresi gambar (Target < 200 KB)...');
    setSizeTelemetry(`Ukuran asli: ${formatBytes(file.size)}`);

    try {
      // 1. Client-side adaptive compression (Target: < 200 KB, Aspect: 4:3)
      await new Promise((r) => setTimeout(r, 60)); // Yield to paint UI

      const compressed = await adaptiveCompress(file, {
        targetBytes: MAX_TARGET_BYTES,
        aspectRatio: '4:3',
      });

      // Strict validation: Ensure < 200 KB
      if (compressed.compressedSize > MAX_TARGET_BYTES) {
        throw new Error(
          `Hasil kompresi (${formatBytes(compressed.compressedSize)}) melebihi batas 200 KB. Silakan pilih foto dengan resolusi lebih kecil.`
        );
      }

      const ratioText = compressed.compressionRatio > 0 ? ` (hemat ${compressed.compressionRatio}%)` : '';
      setSizeTelemetry(`${formatBytes(compressed.originalSize)} ➔ ${formatBytes(compressed.compressedSize)}${ratioText}`);

      // 2. Upload to Cloudinary via /api/upload
      setStage('uploading');
      setStatusMessage('Mengirim ke Cloudinary CDN...');

      const formData = new FormData();
      formData.append('file', compressed.file);
      formData.append('folder', 'events');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Gagal mengunggah berkas ke server (HTTP ${res.status})`);
      }

      const uploadResult = await res.json();
      if (!uploadResult.url) {
        throw new Error('Server tidak mengembalikan URL gambar yang valid.');
      }

      // 3. Complete
      setStage('complete');
      setStatusMessage(
        uploadResult.storage === 'cloudinary'
          ? '✓ Tersimpan di Cloudinary CDN (< 200 KB)'
          : '✓ Gambar berhasil dioptimasi & disimpan'
      );
      onChange(uploadResult.url);

      setTimeout(() => {
        setIsProcessing(false);
        setStage('idle');
      }, 3000);
    } catch (err: any) {
      console.error('[EventCoverUpload Error]:', err);
      setStage('error');
      setIsProcessing(false);
      setErrorMessage(err.message || 'Terjadi kesalahan saat memproses gambar.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Tab Switcher: Upload vs Preset vs URL */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-hairline pb-2 text-xs font-mono">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTabMode('upload')}
            className={`px-2.5 py-1 uppercase font-bold transition-colors flex items-center gap-1.5 ${
              tabMode === 'upload'
                ? 'bg-foreground text-background'
                : 'text-muted hover:text-foreground bg-surface-muted/50'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Unggah &amp; Kompres (&lt;200KB)</span>
          </button>

          <button
            type="button"
            onClick={() => setTabMode('preset')}
            className={`px-2.5 py-1 uppercase font-bold transition-colors flex items-center gap-1.5 ${
              tabMode === 'preset'
                ? 'bg-foreground text-background'
                : 'text-muted hover:text-foreground bg-surface-muted/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Preset Terpal</span>
          </button>

          <button
            type="button"
            onClick={() => setTabMode('url')}
            className={`px-2.5 py-1 uppercase font-bold transition-colors flex items-center gap-1.5 ${
              tabMode === 'url'
                ? 'bg-foreground text-background'
                : 'text-muted hover:text-foreground bg-surface-muted/50'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Tautan URL</span>
          </button>
        </div>

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] text-destructive hover:underline font-mono inline-flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Hapus Foto</span>
          </button>
        )}
      </div>

      {/* Mode 1: Drag & Drop Upload with < 200KB Auto-Compression & Cloudinary */}
      {tabMode === 'upload' && (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`border-2 border-dashed p-4 sm:p-5 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-foreground/50 hover:border-foreground bg-surface-muted/30 hover:bg-surface-muted/60'
            } ${isProcessing ? 'pointer-events-none opacity-80' : ''}`}
          >
            <div className="space-y-2 flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-foreground/5 border border-foreground/20 flex items-center justify-center text-foreground">
                <UploadCloud className="w-5 h-5 text-amber-500" />
              </div>
              <div className="space-y-0.5">
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                  Klik untuk Memilih Foto Lapak atau Seret Gambar ke Sini
                </p>
                <p className="font-mono text-[10px] text-muted">
                  JPG, PNG, atau WebP &bull; Otomatis dikompresi <strong className="text-foreground">&lt; 200 KB</strong> lalu dikirim ke Cloudinary CDN
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Quick Presets */}
      {tabMode === 'preset' && (
        <div className="space-y-2 p-3 bg-surface-muted/30 border border-border-hairline">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted block">
            Pilih Foto Arsip Terpal Dokumentasi Perpusjal Blora:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {COVER_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => onChange(preset.url)}
                className={`p-2 border text-left font-mono text-[10px] transition-all space-y-1 ${
                  value === preset.url
                    ? 'border-foreground bg-foreground text-background font-bold shadow-xs'
                    : 'border-border-hairline bg-surface hover:bg-surface-muted text-foreground'
                }`}
              >
                <div className="aspect-video w-full overflow-hidden bg-black border border-foreground/30">
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover grayscale contrast-110"
                  />
                </div>
                <span className="truncate block font-semibold">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode 3: Manual URL input */}
      {tabMode === 'url' && (
        <div className="space-y-1.5 p-3 bg-surface-muted/30 border border-border-hairline">
          <label className="block font-mono text-[11px] uppercase tracking-wider text-muted font-bold">
            Masukkan Tautan URL Foto (https://...):
          </label>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://res.cloudinary.com/... atau https://images.unsplash.com/..."
            className="w-full px-3 py-1.5 bg-surface border border-foreground font-mono text-xs focus:outline-hidden"
          />
        </div>
      )}

      {/* Telemetry Status Strip during Compression & Upload */}
      {(isProcessing || stage === 'complete') && (
        <div className="p-3 bg-surface border border-foreground space-y-1.5 font-mono text-xs animate-in fade-in">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              {stage === 'compressing' && <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />}
              {stage === 'uploading' && <UploadCloud className="w-3.5 h-3.5 animate-pulse text-amber-500" />}
              {stage === 'complete' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              <span>{statusMessage}</span>
            </span>
            <span className="text-muted text-[10px]">{sizeTelemetry}</span>
          </div>

          <div className="w-full h-1.5 bg-surface-muted border border-foreground/30 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                stage === 'compressing'
                  ? 'w-1/2 bg-amber-500'
                  : stage === 'uploading'
                  ? 'w-4/5 bg-amber-500'
                  : 'w-full bg-emerald-500'
              }`}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-2.5 bg-surface-muted border-2 border-destructive flex items-start gap-2 font-mono text-xs text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
