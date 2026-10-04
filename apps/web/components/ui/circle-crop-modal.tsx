'use client';

import * as React from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Check, Loader2, Sparkles, Move } from 'lucide-react';
import { cropAndCompressImage, CompressionResult, formatBytes } from '@/lib/image-compression';

interface CircleCropModalProps {
  isOpen: boolean;
  imageFile: File | null;
  onClose: () => void;
  onCropComplete: (result: CompressionResult) => void;
}

export function CircleCropModal({
  isOpen,
  imageFile,
  onClose,
  onCropComplete,
}: CircleCropModalProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [image, setImage] = React.useState<HTMLImageElement | null>(null);
  const [scale, setScale] = React.useState<number>(1);
  const [pan, setPan] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [processing, setProcessing] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // Viewport display size
  const VIEWPORT_SIZE = 300;

  // Load image when imageFile changes
  React.useEffect(() => {
    if (!imageFile) {
      setImage(null);
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setScale(1);
      setPan({ x: 0, y: 0 });
      setError(null);
    };
    img.onerror = () => {
      setError('Gagal membaca berkas gambar. Pastikan format gambar valid.');
    };
    img.src = objectUrl;

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  // Redraw canvas with circle aperture overlay
  const drawCanvas = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Calculate base fit (cover viewport)
    const baseScale = Math.max(width / image.width, height / image.height);
    const currentScale = baseScale * scale;

    const scaledWidth = image.width * currentScale;
    const scaledHeight = image.height * currentScale;

    // Center image + user pan
    const centerX = (width - scaledWidth) / 2 + pan.x;
    const centerY = (height - scaledHeight) / 2 + pan.y;

    // 1. Draw scaled & panned image
    ctx.drawImage(image, centerX, centerY, scaledWidth, scaledHeight);

    // 2. Draw circular aperture mask overlay
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    // Cut out circle in counter-clockwise direction
    const radius = width / 2 - 10;
    ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2, true);
    ctx.fill();

    // 3. Draw circle guideline ring
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
    ctx.stroke();

    // 4. Subtle inner ring
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius - 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }, [image, scale, pan]);

  React.useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Pointer / Mouse events for dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleReset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  // Perform final crop & compression under 100KB
  const handleApplyCrop = async () => {
    if (!image || !imageFile) return;

    setProcessing(true);
    setError(null);

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas tidak ditemukan.');

      const width = canvas.width;
      const height = canvas.height;
      const radius = width / 2 - 10;

      // Calculate base fit
      const baseScale = Math.max(width / image.width, height / image.height);
      const currentScale = baseScale * scale;

      const scaledWidth = image.width * currentScale;
      const scaledHeight = image.height * currentScale;

      const imageX = (width - scaledWidth) / 2 + pan.x;
      const imageY = (height - scaledHeight) / 2 + pan.y;

      // Circle crop bounding box in canvas coordinates
      const circleLeft = width / 2 - radius;
      const circleTop = height / 2 - radius;
      const circleSize = radius * 2;

      // Map canvas crop coordinates back to original image space
      const cropXInImage = (circleLeft - imageX) / currentScale;
      const cropYInImage = (circleTop - imageY) / currentScale;
      const cropSizeInImage = circleSize / currentScale;

      // Clamp coordinates to image boundaries
      const clampedX = Math.max(0, Math.min(image.width - 10, cropXInImage));
      const clampedY = Math.max(0, Math.min(image.height - 10, cropYInImage));
      const clampedSize = Math.max(
        10,
        Math.min(cropSizeInImage, image.width - clampedX, image.height - clampedY)
      );

      // Crop and compress client-side under 100KB WebP
      const result = await cropAndCompressImage(
        image,
        {
          x: clampedX,
          y: clampedY,
          width: clampedSize,
          height: clampedSize,
        },
        {
          maxDimension: 400,
          maxSizeBytes: 95 * 1024,
          initialQuality: 0.84,
        }
      );

      onCropComplete(result);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal memproses crop foto.');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen || !imageFile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-50 duration-150">
      <div className="bg-surface border-2 border-foreground w-full max-w-md shadow-2xl p-5 sm:p-6 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-foreground pb-3">
          <div className="space-y-0.5">
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted font-bold block">
              PENYESUAIAN FOTO PROFIL LINGKARAN
            </span>
            <h3 className="font-serif text-lg font-bold text-foreground">
              Potong &amp; Atur Posisi Foto
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="p-1 text-muted hover:text-foreground hover:bg-surface-muted transition-colors rounded-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500 text-red-800 dark:text-red-300 font-mono text-xs">
            {error}
          </div>
        )}

        {/* Circular Viewport Interactive Canvas */}
        <div className="flex flex-col items-center space-y-2">
          <div
            className="relative cursor-grab active:cursor-grabbing border-2 border-foreground bg-black select-none overflow-hidden touch-none"
            style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <canvas
              ref={canvasRef}
              width={VIEWPORT_SIZE}
              height={VIEWPORT_SIZE}
              className="block w-full h-full"
            />
            <div className="absolute bottom-2 left-2 pointer-events-none bg-black/70 px-2 py-0.5 text-[9px] font-mono text-white/90 flex items-center gap-1 rounded-sm">
              <Move className="w-2.5 h-2.5" />
              <span>Geser untuk atur posisi</span>
            </div>
          </div>

          <p className="font-sans text-[11px] text-muted text-center max-w-xs">
            Bagian di dalam lingkaran putih adalah area yang akan tampil sebagai foto profil Anda.
          </p>
        </div>

        {/* Zoom & Control Sliders */}
        <div className="space-y-3 pt-1 border-t border-border-hairline">
          <div className="flex items-center justify-between font-mono text-xs text-muted">
            <span className="flex items-center gap-1">
              <ZoomIn className="w-3.5 h-3.5" /> Skala Pembesaran:
            </span>
            <span className="font-bold text-foreground">{scale.toFixed(1)}x</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(1, s - 0.2))}
              className="p-1.5 border border-border-hairline bg-surface hover:bg-surface-muted text-foreground transition-colors shrink-0"
              title="Perkecil"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full accent-foreground cursor-pointer"
            />

            <button
              type="button"
              onClick={() => setScale((s) => Math.min(3, s + 0.2))}
              className="p-1.5 border border-border-hairline bg-surface hover:bg-surface-muted text-foreground transition-colors shrink-0"
              title="Perbesar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 border border-border-hairline bg-surface hover:bg-surface-muted text-foreground transition-colors shrink-0"
              title="Atur Ulang"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Specifications & Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border-hairline">
          <div className="text-[10px] font-mono text-muted text-left w-full sm:w-auto">
            Target: <strong>400x400 px WebP</strong> (&lt; 100 KB)
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={processing}
              onClick={onClose}
              className="px-4 py-2 border border-border-hairline bg-surface hover:bg-surface-muted font-mono text-xs uppercase tracking-wider text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              disabled={processing || !image}
              onClick={handleApplyCrop}
              className="px-5 py-2 border-2 border-foreground bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold hover:bg-foreground/90 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Mengompresi...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Terapkan Foto Lingkaran</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
