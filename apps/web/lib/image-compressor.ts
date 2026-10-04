/**
 * Client-Side Image Compressor using Native HTML5 Canvas Web API.
 * Resizes large camera/gallery photos (e.g. 10MB+) to web-optimized images.
 *
 * Key export: adaptiveCompress() — loops through presets until target file size is reached.
 */

export interface CompressionResult {
  file: File;
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number; // percentage saved, e.g. 95
  previewUrl: string;
  targetMet: boolean; // true if result is below targetBytes
}

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  mimeType?: string; // default: 'image/jpeg'
}

export interface AdaptiveOptions {
  targetBytes?: number;   // default: 200 * 1024 (200KB)
  mimeType?: string;
  aspectRatio?: '16:9' | '4:3' | 'free'; // guides resolution presets
}

// ─── ADAPTIVE COMPRESSION (PRIMARY) ───────────────────────────────────────────
/**
 * Compresses an image file using successive quality/resolution presets until
 * the result is below `targetBytes` (default: 200 KB).
 *
 * Presets for '16:9' articles:  1280×720, 960×540, 800×450, 640×360
 * Presets for '4:3' or 'free': 1200×900, 900×675, 720×540, 540×405
 *
 * Always returns the best (smallest satisfying) result; if none pass target,
 * returns the smallest achieved so far.
 */
export async function adaptiveCompress(
  file: File,
  options: AdaptiveOptions = {}
): Promise<CompressionResult> {
  const {
    targetBytes = 200 * 1024,
    mimeType = 'image/jpeg',
    aspectRatio = '16:9',
  } = options;

  const originalSize = file.size;

  // If already below target — return as-is (wrapped in CompressionResult)
  if (originalSize <= targetBytes) {
    const blob = file as unknown as Blob;
    return {
      file,
      blob,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 0,
      previewUrl: URL.createObjectURL(file),
      targetMet: true,
    };
  }

  const presets =
    aspectRatio === '16:9'
      ? [
          { w: 1280, h: 720,  q: 0.78 },
          { w: 960,  h: 540,  q: 0.72 },
          { w: 800,  h: 450,  q: 0.68 },
          { w: 640,  h: 360,  q: 0.62 },
          { w: 500,  h: 281,  q: 0.55 },
          { w: 400,  h: 225,  q: 0.50 },
        ]
      : [
          { w: 1200, h: 900,  q: 0.78 },
          { w: 960,  h: 720,  q: 0.74 },
          { w: 800,  h: 600,  q: 0.68 },
          { w: 640,  h: 480,  q: 0.62 },
          { w: 540,  h: 405,  q: 0.55 },
          { w: 440,  h: 330,  q: 0.50 },
        ];

  // Load image once
  const imgSrc = await readFileAsDataURL(file);
  const img = await loadImage(imgSrc);

  let best: CompressionResult | null = null;

  for (const preset of presets) {
    const result = await compressWithPreset(img, file.name, originalSize, preset.w, preset.h, preset.q, mimeType);
    best = result;
    if (result.compressedSize <= targetBytes) {
      return { ...result, targetMet: true };
    }
  }

  // Return smallest result even if target not met
  return { ...best!, targetMet: false };
}

// ─── LEGACY BOOK COVER (keeps back-compat) ────────────────────────────────────
export async function compressBookCover(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const { maxWidth = 1200, maxHeight = 1600, quality = 0.82, mimeType = 'image/jpeg' } = options;
  const originalSize = file.size;
  const imgSrc = await readFileAsDataURL(file);
  const img = await loadImage(imgSrc);
  return compressWithPreset(img, file.name, originalSize, maxWidth, maxHeight, quality, mimeType);
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// ─── PRIVATE HELPERS ──────────────────────────────────────────────────────────

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error('Format berkas tidak didukung atau gambar rusak.'));
    img.onload = () => resolve(img);
    img.src = src;
  });
}

function compressWithPreset(
  img: HTMLImageElement,
  originalName: string,
  originalSize: number,
  maxW: number,
  maxH: number,
  quality: number,
  mimeType: string
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    let width = img.width;
    let height = img.height;
    if (width > maxW || height > maxH) {
      const ratio = Math.min(maxW / width, maxH / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) { reject(new Error('Canvas 2D context tidak tersedia.')); return; }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error('Gagal mengompresi gambar.')); return; }
        const compressedSize = blob.size;
        const savedBytes = Math.max(0, originalSize - compressedSize);
        const compressionRatio = Math.round((savedBytes / originalSize) * 100);
        const ext = mimeType === 'image/webp' ? '.webp' : '.jpg';
        const baseName = originalName.replace(/\.[^/.]+$/, '');
        const compressedFile = new File([blob], `${baseName}-opt${ext}`, {
          type: mimeType,
          lastModified: Date.now(),
        });
        resolve({
          file: compressedFile,
          blob,
          originalSize,
          compressedSize,
          compressionRatio,
          previewUrl: URL.createObjectURL(blob),
          targetMet: false,
        });
      },
      mimeType,
      quality
    );
  });
}
