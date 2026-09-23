'use client';

import * as React from 'react';
import { compressBookCover, formatBytes } from '@/lib/image-compressor';
import { EditorialProgressBar, ProgressStage } from '@/components/ui/editorial-progress-bar';
import {
  UploadCloud,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  RefreshCw,
  Camera,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface BookCoverUploaderProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

export function BookCoverUploader({ value, onChange, className }: BookCoverUploaderProps) {
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
      // 1. STAGE 1: CLIENT-SIDE IMAGE COMPRESSION
      setStage('compressing');
      setPercent(50);
      setProgressLabel('MENGOMPRESI RESOLUSI GAMBAR...');
      setProgressDetail(`Ukuran asli: ${formatBytes(file.size)}`);

      // Small delay for UI visual feedback
      await new Promise((r) => setTimeout(r, 60));

      const compressed = await compressBookCover(file, {
        maxWidth: 1200,
        maxHeight: 1600,
        quality: 0.82,
      });

      setPercent(100);
      setProgressLabel('MENGOMPRESI RESOLUSI GAMBAR (100%)...');
      setProgressDetail(
        `${formatBytes(compressed.originalSize)} ➔ ${formatBytes(compressed.compressedSize)} (-${compressed.compressionRatio}%)`
      );

      // 2. STAGE 2: NETWORK UPLOAD WITH REAL PROGRESS VIA XHR
      await new Promise((r) => setTimeout(r, 120));
      setStage('uploading');
      setPercent(0);
      setProgressLabel('MENYIMPAN KE CLOUDINARY CDN...');
      setProgressDetail(`Mengirim ${formatBytes(compressed.compressedSize)}...`);

      const uploadedUrl = await uploadWithProgress(compressed.file, (p, loaded, total) => {
        setPercent(p);
        setProgressDetail(`${formatBytes(loaded)} / ${formatBytes(total)}`);
      });

      // 3. STAGE 3: COMPLETE
      setStage('complete');
      setPercent(100);
      setProgressLabel('BERKAS TERSIMPAN SECARA PERSISTEN');
      setProgressDetail(`Hemat kuota: -${compressed.compressionRatio}%`);

      onChange(uploadedUrl);

      // Auto dismiss progress after 2 seconds
      setTimeout(() => {
        setStage('idle');
      }, 2500);
    } catch (err: any) {
      console.error(err);
      setStage('error');
      setErrorMessage(err.message || 'Gagal memproses unggahan gambar.');
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

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const p = Math.round((e.loaded / e.total) * 100);
          onProgress(p, e.loaded, e.total);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.url) {
              resolve(data.url);
            } else {
              reject(new Error(data.error || 'Respon server tidak memuat URL gambar.'));
            }
          } catch {
            reject(new Error('Gagal mengurai respon server.'));
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

      xhr.onerror = () => {
        reject(new Error('Gagal terhubung ke server untuk mengunggah berkas.'));
      };

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleClearImage = () => {
    onChange('');
    setStage('idle');
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 font-mono text-xs ${className || ''}`}>
      {/* 1. Mode Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-border-hairline pb-2">
        <span className="font-bold uppercase tracking-wider text-muted text-[10px]">
          Sampul Pustaka
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 text-[11px] uppercase tracking-wider font-semibold transition-colors ${
              mode === 'upload'
                ? 'bg-foreground text-background font-bold'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Unggah Berkas
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 text-[11px] uppercase tracking-wider font-semibold transition-colors ${
              mode === 'url'
                ? 'bg-foreground text-background font-bold'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Tautan URL
          </button>
        </div>
      </div>

      {/* 2. Error Message Notice */}
      {errorMessage && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="font-bold">&times;</button>
        </div>
      )}

      {/* 3. MODE: FILE UPLOAD & DROPZONE */}
      {mode === 'upload' && (
        <div className="space-y-3">
          {/* Hidden Native File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />

          {/* Interactive Dropzone */}
          {!value && stage === 'idle' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed cursor-pointer transition-all text-center space-y-2 select-none ${
                isDragging
                  ? 'border-foreground bg-surface-muted/60'
                  : 'border-border-hairline hover:border-foreground bg-surface-muted/20 hover:bg-surface-muted/40'
              }`}
            >
              <div className="flex justify-center items-center gap-2 text-foreground">
                <UploadCloud className="w-6 h-6 stroke-1" />
                <Camera className="w-5 h-5 stroke-1" />
              </div>

              <div>
                <p className="font-bold text-foreground text-xs uppercase tracking-wider">
                  Klik untuk Pilih Foto dari Galeri / Kamera
                </p>
                <p className="text-[10px] text-muted font-sans mt-0.5">
                  Atau seret berkas gambar ke sini. Otomatis dikompresi sebelum disimpan.
                </p>
              </div>

              <span className="inline-block mt-1 font-mono text-[9px] uppercase px-2 py-0.5 border border-border-hairline text-muted">
                JPG, PNG, WEBP (Maks. 10MB)
              </span>
            </div>
          )}

          {/* Progress Bar View During Compression & Upload */}
          <EditorialProgressBar
            stage={stage}
            percent={percent}
            label={progressLabel}
            detail={progressDetail}
          />
        </div>
      )}

      {/* 4. MODE: DIRECT URL INPUT */}
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
              className="flex-1 px-3 py-2 border border-border-hairline bg-surface text-foreground font-mono text-xs focus:border-foreground focus:outline-none"
            />
            {value && (
              <button
                type="button"
                onClick={handleClearImage}
                className="p-2 border border-border-hairline hover:border-red-400 text-muted hover:text-red-700"
                title="Kosongkan tautan"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-[10px] text-muted block">
            Tempelkan URL langsung gambar sampul dari internet.
          </span>
        </div>
      )}

      {/* 5. LIVE PREVIEW & CONTROLS (IF IMAGE EXISTS) */}
      {value && (
        <div className="p-3 border border-border-hairline bg-surface-muted/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-16 bg-surface-muted border border-foreground shrink-0 overflow-hidden shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Pratinjau Sampul"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="space-y-1 min-w-0 font-mono text-[10px]">
              <span className="text-foreground font-bold uppercase block truncate">
                Sampul Aktif
              </span>
              <span className="text-muted block truncate max-w-[200px] sm:max-w-xs">
                {value}
              </span>
              <span className="inline-block text-[9px] text-emerald-700 bg-emerald-50 px-1 py-0.2 border border-emerald-200">
                Siap Digunakan
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
            {mode === 'upload' && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 border border-border-hairline hover:border-foreground text-foreground text-[10px] font-bold uppercase transition-colors inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Ganti Foto</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleClearImage}
              className="p-1 border border-border-hairline hover:border-red-400 text-muted hover:text-red-700 transition-colors"
              title="Hapus sampul"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
