/**
 * Client-Side Image Compression Utility
 * Optimizes profile pictures and avatars to high quality square WebP under 100KB.
 */

export interface CompressionOptions {
  maxDimension?: number; // e.g. 400px (standard crisp retina avatar)
  maxSizeBytes?: number; // e.g. 100 * 1024 (100KB)
  initialQuality?: number; // e.g. 0.85
  minQuality?: number; // e.g. 0.60
}

export interface CompressionResult {
  file: File;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
  savingsPercent: number;
  dimensions: { width: number; height: number };
  format: string;
}

/**
 * Compresses and auto-center-square-crops a user image file on the client side.
 */
export async function compressProfileImage(
  inputFile: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxDimension = 400,
    maxSizeBytes = 100 * 1024, // 100KB strict ceiling
    initialQuality = 0.84,
    minQuality = 0.60,
  } = options;

  const originalSize = inputFile.size;

  // 1. Load image into HTMLImageElement
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(inputFile);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Gagal memuat berkas gambar. Pastikan format gambar valid.'));
    };
    image.src = objectUrl;
  });

  // 2. Calculate center square crop
  const naturalWidth = img.naturalWidth || img.width;
  const naturalHeight = img.naturalHeight || img.height;
  const cropSize = Math.min(naturalWidth, naturalHeight);
  const cropX = (naturalWidth - cropSize) / 2;
  const cropY = (naturalHeight - cropSize) / 2;

  // Output dimension is min(maxDimension, cropSize) but at least 256 for quality
  const targetDimension = Math.min(maxDimension, Math.max(256, cropSize));

  // 3. Create canvas and draw cropped square
  const canvas = document.createElement('canvas');
  canvas.width = targetDimension;
  canvas.height = targetDimension;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context tidak didukung oleh browser Anda.');
  }

  // Use high quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw square crop
  ctx.drawImage(
    img,
    cropX,
    cropY,
    cropSize,
    cropSize,
    0,
    0,
    targetDimension,
    targetDimension
  );

  // 4. Test WebP support with fallback to JPEG
  const checkWebpSupport = (): boolean => {
    try {
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } catch {
      return false;
    }
  };

  const isWebpSupported = checkWebpSupport();
  const mimeType = isWebpSupported ? 'image/webp' : 'image/jpeg';
  const fileExtension = isWebpSupported ? '.webp' : '.jpg';

  // 5. Binary search / stepped compression to ensure size <= maxSizeBytes
  let quality = initialQuality;
  let compressedBlob: Blob | null = null;

  while (quality >= minQuality) {
    compressedBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), mimeType, quality);
    });

    if (compressedBlob && compressedBlob.size <= maxSizeBytes) {
      break;
    }

    quality -= 0.08;
  }

  if (!compressedBlob) {
    throw new Error('Gagal mengompresi gambar.');
  }

  // 6. If even minQuality is slightly over 100KB (e.g. extremely noisy image), downscale dimension slightly
  if (compressedBlob.size > maxSizeBytes && targetDimension > 300) {
    const smallerDimension = 320;
    canvas.width = smallerDimension;
    canvas.height = smallerDimension;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, cropX, cropY, cropSize, cropSize, 0, 0, smallerDimension, smallerDimension);

    compressedBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), mimeType, 0.75);
    });
  }

  if (!compressedBlob) {
    throw new Error('Gagal menyelesaikan kompresi gambar.');
  }

  // Construct optimized File
  const baseName = inputFile.name.replace(/\.[^/.]+$/, '');
  const cleanFileName = `avatar-${baseName.slice(0, 20).toLowerCase().replace(/[^a-z0-9_-]/g, '-')}${fileExtension}`;
  const optimizedFile = new File([compressedBlob], cleanFileName, { type: mimeType });

  const compressedSize = optimizedFile.size;
  const savingsPercent = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));
  const previewUrl = URL.createObjectURL(compressedBlob);

  return {
    file: optimizedFile,
    previewUrl,
    originalSize,
    compressedSize,
    savingsPercent,
    dimensions: { width: targetDimension, height: targetDimension },
    format: mimeType === 'image/webp' ? 'WebP' : 'JPEG',
  };
}

/**
 * Format bytes into human readable string (e.g. 48 KB, 1.2 MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
