'use client';

import * as React from 'react';
import { compressBookCover, formatBytes } from '@/lib/image-compressor';
import { EditorialProgressBar, ProgressStage } from '@/components/ui/editorial-progress-bar';
import {
  UploadCloud,
  Link as LinkIcon,
  Trash2,
  RefreshCw,
  Camera,
  AlertCircle,
  ImageIcon,
} from 'lucide-react';

interface ArticleCoverUploaderProps {
  value: string;
  onChange: (url: string) => void;
  onCreditChange?: (credit: string) => void;
  credit?: string;
  className?: string;
}

export function ArticleCoverUploader({
  value,
  onChange,
  onCreditChange,
  credit = '',
  className,
}: ArticleCoverUploaderProps) {
  const [mode, setMode] = React.useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Progress & Telemetry States
  const [stage, setStage] = React.useState<ProgressStage>('idle');
  const [percent, setPercent] = React.useState(0);
  const [progressLabel, setProgressLabel] = React.useState('');
  const [progressDetail, setProgressDetail] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Berkas harus berupa gambar (JPG, PNG, WebP).');
      return;
    }
    setErrorMessage(null);

    try {
      // Stage 1: Compress (landscape 16:9 article header)
      setStage('compressing');
      setPercent(50);
      setProgressLabel('MENGOMPRESI GAMBAR SAMPUL...');
      setProgressDetail(`Ukuran asli: ${formatBytes(file.size)}`);
      await new Promise((r) => setTimeout(r, 60));

      const compressed = await compressBookCover(file, {
        maxWidth: 1600,
        maxHeight: 900,
        quality: 0.83,
      });

      setPercent(100);
      setProgressLabel('KOMPRESI SELESAI (100%)');
      setProgressDetail(
        `${formatBytes(compressed.originalSize)} ➔ ${formatBytes(compressed.compressedSize)} (-${compressed.compressionRatio}%)`
      );

      // Stage 2: Upload
      await new Promise((r) => setTimeout(r, 120));
      setStage('uploading');
      setPercent(0);
      setProgressLabel('MENGIRIM KE CLOUDINARY CDN...');
      setProgressDetail(`Mengirim ${formatBytes(compressed.compressedSize)}...`);

      const uploadedUrl = await uploadWithProgress(compressed.file, (p, loaded, total) => {
        setPercent(p);
        setProgressDetail(`${formatBytes(loaded)} / ${formatBytes(total)}`);
      });

      // Stage 3: Done
      setStage('complete');
      setPercent(100);
      setProgressLabel('GAMBAR SAMPUL TERSIMPAN');
      setProgressDetail(`Hemat kuota: -${compressed.compressionRatio}%`);
      onChange(uploadedUrl);

      setTimeout(() => setStage('idle'), 2500);
    } catch (err: any) {
      setStage('error');
      setErrorMessage(err.message || 'Gagal memproses gambar sampul.');
    }
  };

  const uploadWithProgress = (
    fileToUpload: File,
    onProgress: (percent: number, loaded: number, total: number) => void
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('folder', 'articles');

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100), e.loaded, e.total);
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.url) resolve(data.url);
            else reject(new Error(data.error || 'Respon server tidak memuat URL.'));
          } catch {
            reject(new Error('Gagal membaca respon server.'));
          }
        } else {
          try {
            const data = JSON.parse(xhr.responseText);
            reject(new Error(data.error || `Unggah gagal (HTTP ${xhr.status})`));
          } catch {
            reject(new Error(`Unggah gagal (HTTP ${xhr.status})`));
          }
        }
      };
      xhr.onerror = () => reject(new Error('Gagal terhubung ke server.'));
      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) handleFileSelect(e.target.files[0]);
  };

  const handleClear = () => {
    onChange('');
    setStage('idle');
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={`space-y-3 font-mono text-xs ${className || ''}`}>
      {/* Header & Mode Tabs */}
      <div className="flex items-center justify-between border-b border-border-hairline pb-2">
        <span className="font-bold uppercase tracking-wider text-muted text-[10px]">
          Gambar Sampul Artikel
        </span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 text-[11px] uppercase tracking-wider font-semibold transition-colors rounded-sm ${
              mode === 'upload'
                ? 'bg-foreground text-background'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Unggah
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 text-[11px] uppercase tracking-wider font-semibold transition-colors rounded-sm ${
              mode === 'url'
                ? 'bg-foreground text-background'
                : 'text-muted hover:text-foreground'
            }`}
          >
            URL
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-[11px] flex items-center justify-between gap-2 rounded-sm">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="font-bold text-base leading-none shrink-0">&times;</button>
        </div>
      )}

      {/* Upload Dropzone Mode */}
      {mode === 'upload' && (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />

          {/* Landscape Preview / Dropzone */}
          {!value && stage === 'idle' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative w-full aspect-[16/9] border-2 border-dashed cursor-pointer transition-all
                flex flex-col items-center justify-center gap-3 select-none
                ${isDragging
                  ? 'border-foreground bg-surface-muted/60'
                  : 'border-border-hairline hover:border-foreground bg-surface-muted/20 hover:bg-surface-muted/40'
                }
              `}
            >
              <div className="flex items-center gap-3 text-muted">
                <UploadCloud className="w-8 h-8 stroke-1" />
                <Camera className="w-6 h-6 stroke-1" />
              </div>
              <div className="text-center px-4">
                <p className="font-bold text-foreground text-xs uppercase tracking-wider">
                  Ketuk untuk Pilih Foto
                </p>
                <p className="text-[10px] text-muted font-sans mt-1 leading-snug">
                  Dari galeri, kamera HP, atau drag file di sini.<br />
                  Otomatis dioptimalkan ke format web 16:9.
                </p>
              </div>
              <span className="font-mono text-[9px] uppercase px-2 py-0.5 border border-border-hairline text-muted">
                JPG · PNG · WEBP (Maks. 10MB)
              </span>
            </div>
          )}

          {/* Progress Bar */}
          <EditorialProgressBar
            stage={stage}
            percent={percent}
            label={progressLabel}
            detail={progressDetail}
          />
        </div>
      )}

      {/* URL Mode */}
      {mode === 'url' && (
        <div className="space-y-2">
          <label className="block text-[10px] uppercase text-muted font-bold">
            URL Gambar Sampul (HTTPS)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="flex-1 h-11 sm:h-10 px-3 border border-border-hairline bg-surface text-foreground font-mono text-sm sm:text-xs focus:border-foreground focus:outline-none"
            />
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="h-11 sm:h-10 w-11 sm:w-10 flex items-center justify-center border border-border-hairline hover:border-red-400 text-muted hover:text-red-700 transition-colors shrink-0"
                title="Hapus URL"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-muted">
            Salin URL gambar dari Unsplash, Pexels, atau sumber terpercaya lainnya.
          </p>
        </div>
      )}

      {/* Live 16:9 Preview (if image exists) */}
      {value && (
        <div className="space-y-2">
          <div className="relative w-full aspect-[16/9] bg-surface-muted border border-border-hairline overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Pratinjau Sampul Artikel"
              className="w-full h-full object-cover grayscale contrast-125"
              onError={(e) => {
                (e.target as HTMLImageElement).style.opacity = '0.3';
              }}
            />
            {/* Overlay Controls */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5">
              {mode === 'upload' && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-9 px-2.5 bg-background/90 backdrop-blur-sm border border-border-hairline text-foreground text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 hover:bg-background transition-colors"
                  title="Ganti foto"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span className="hidden sm:inline">Ganti</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleClear}
                className="h-9 w-9 flex items-center justify-center bg-background/90 backdrop-blur-sm border border-border-hairline text-muted hover:text-red-700 hover:border-red-400 transition-colors"
                title="Hapus sampul"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Status Badge */}
            <div className="absolute bottom-2 left-2">
              <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase px-2 py-0.5 bg-background/90 backdrop-blur-sm border border-emerald-200 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Sampul Aktif
              </span>
            </div>
          </div>

          {/* Credit Caption Input */}
          {onCreditChange !== undefined && (
            <div className="space-y-1">
              <label className="block text-[10px] uppercase text-muted font-bold tracking-wider">
                Kredit Foto (Opsional)
              </label>
              <input
                type="text"
                value={credit}
                onChange={(e) => onCreditChange(e.target.value)}
                placeholder="Cth: Foto oleh Andi Saputra / Unsplash"
                maxLength={120}
                className="w-full h-10 px-3 border border-border-hairline bg-surface text-foreground font-sans text-sm sm:text-xs focus:border-foreground focus:outline-none"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
