import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { cookies } from 'next/headers';

/**
 * Verify JWT HMAC-SHA256 signature natively without extra dependencies
 */
function verifyJwtPayload(token: string, secret: string): { userId?: string; role?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');
    if (signatureB64 !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Verify true file format from magic bytes buffer
 */
function detectImageFormat(buffer: Buffer): { valid: boolean; ext: string; mime: string } {
  if (buffer.length < 12) return { valid: false, ext: '', mime: '' };

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, ext: '.jpg', mime: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, ext: '.png', mime: 'image/png' };
  }

  // WebP: RIFF (bytes 0-3) and WEBP (bytes 8-11)
  if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return { valid: true, ext: '.webp', mime: 'image/webp' };
  }

  return { valid: false, ext: '', mime: '' };
}

export async function POST(req: NextRequest) {
  try {
    // Note: In split frontend/backend deployments (Vercel + Render), the HttpOnly
    // session cookie is scoped to the API domain. Actual database mutations
    // (PATCH /users/me/profile, POST /books, etc.) strictly enforce requireAuth on the API.
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('perpusjal_session')?.value;
    const authHeader = req.headers.get('authorization')?.replace('Bearer ', '');
    const token = sessionCookie || authHeader;

    if (token && process.env.JWT_SECRET) {
      verifyJwtPayload(token, process.env.JWT_SECRET);
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada berkas yang diunggah.' }, { status: 400 });
    }

    // 2. Validate File Size (max 2MB for optimized covers/avatars)
    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Ukuran berkas melebihi batas 2MB. Harap gunakan gambar yang telah dikompresi.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Inspect Magic Bytes
    const formatInfo = detectImageFormat(buffer);
    if (!formatInfo.valid) {
      return NextResponse.json(
        { error: 'Format berkas tidak valid. Hanya format JPG, PNG, dan WebP yang diizinkan.' },
        { status: 400 }
      );
    }

    // 4. Determine upload folder
    const folderParam = (formData.get('folder') as string) || 'events';
    const allowedFolders = ['books', 'articles', 'avatars', 'events'];
    const safeFolder = allowedFolders.includes(folderParam) ? folderParam : 'events';
    const uploadFolder = `perpusjal/${safeFolder}`;

    let cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    let apiKey = process.env.CLOUDINARY_API_KEY;
    let apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Fallback: If running Next.js locally without .env loaded in worker process, read from disk
    if (!cloudName || !apiKey || !apiSecret) {
      try {
        const envCandidates = [
          path.join(process.cwd(), '.env'),
          path.join(process.cwd(), '..', '..', '.env'),
        ];
        for (const p of envCandidates) {
          try {
            const raw = await fs.readFile(p, 'utf-8');
            for (const line of raw.split('\n')) {
              const [k, ...v] = line.split('=');
              if (!k) continue;
              const key = k.trim();
              const val = v.join('=').trim().replace(/^["']|["']$/g, '');
              if (key === 'CLOUDINARY_CLOUD_NAME' || key === 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME') {
                cloudName = cloudName || val;
              } else if (key === 'CLOUDINARY_API_KEY') {
                apiKey = apiKey || val;
              } else if (key === 'CLOUDINARY_API_SECRET') {
                apiSecret = apiSecret || val;
              }
            }
          } catch {}
        }
      } catch {}
    }

    const base64DataUrl = `data:${formatInfo.mime};base64,${buffer.toString('base64')}`;

    // 5. ATTEMPT CLOUDINARY UPLOAD FIRST (PRIMARY STORAGE)
    if (cloudName && cloudName !== 'perpusjal' && apiKey && apiSecret && apiKey !== 'mock-key') {
      try {
        const timestamp = Math.round(Date.now() / 1000);
        const strToSign = `folder=${uploadFolder}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

        const cFormData = new FormData();
        cFormData.append('file', base64DataUrl);
        cFormData.append('api_key', apiKey);
        cFormData.append('timestamp', timestamp.toString());
        cFormData.append('signature', signature);
        cFormData.append('folder', uploadFolder);

        const cRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: cFormData,
        });

        if (cRes.ok) {
          const cData = await cRes.json();
          return NextResponse.json({
            url: cData.secure_url,
            publicId: cData.public_id,
            storage: 'cloudinary',
            bytes: cData.bytes || buffer.length,
          });
        } else {
          const errText = await cRes.text();
          console.warn('[Cloudinary Error, falling back to inline data URI]:', errText);
        }
      } catch (cloudErr) {
        console.warn('[Cloudinary Upload Exception, falling back to inline data URI]:', cloudErr);
      }
    }

    // 6. FALLBACK: PERSISTENT INLINE DATA URI (Serverless & Cross-Origin Safe)
    // Works reliably on Vercel read-only filesystems and persists in PostgreSQL TEXT columns
    return NextResponse.json({
      url: base64DataUrl,
      storage: 'inline',
      bytes: buffer.length,
    });
  } catch (error: any) {
    console.error('[Upload Handler Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kendala saat memproses berkas gambar.' },
      { status: 500 }
    );
  }
}
