import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada berkas yang diunggah.' }, { status: 400 });
    }

    // Validate size (max 10MB, though compressed files are usually < 300KB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ukuran berkas melebihi batas 10MB.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    let apiKey = process.env.CLOUDINARY_API_KEY;
    let apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Fallback: If running Next.js without .env loaded in worker process, read from disk
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

    // 1. ATTEMPT CLOUDINARY UPLOAD FIRST (PRIMARY SCALABLE STORAGE)
    if (cloudName && cloudName !== 'perpusjal' && apiKey && apiSecret && apiKey !== 'mock-key') {
      try {
        const timestamp = Math.round(Date.now() / 1000);
        const folder = 'perpusjal/books';
        const strToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

        const mime = file.type || 'image/jpeg';
        const base64Data = `data:${mime};base64,${buffer.toString('base64')}`;

        const cFormData = new FormData();
        cFormData.append('file', base64Data);
        cFormData.append('api_key', apiKey);
        cFormData.append('timestamp', timestamp.toString());
        cFormData.append('signature', signature);
        cFormData.append('folder', folder);

        const cRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: cFormData,
        });

        if (cRes.ok) {
          const cData = await cRes.json();
          console.log(`[Cloudinary Upload Success]: ${cData.secure_url}`);
          return NextResponse.json({
            url: cData.secure_url,
            publicId: cData.public_id,
            storage: 'cloudinary',
            bytes: cData.bytes || buffer.length,
          });
        } else {
          const errText = await cRes.text();
          console.warn('[Cloudinary Error, falling back to local storage]:', errText);
        }
      } catch (cloudErr) {
        console.warn('[Cloudinary Upload Exception, falling back to local]:', cloudErr);
      }
    }

    // 2. FALLBACK: LOCAL STORAGE IN public/uploads/books/
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'books');
    await fs.mkdir(uploadDir, { recursive: true });

    const safeBaseName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30);
    const ext = file.type === 'image/webp' ? '.webp' : '.jpg';
    const filename = `book-${Date.now()}-${safeBaseName}${ext}`;
    const filePath = path.join(uploadDir, filename);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/books/${filename}`;

    return NextResponse.json({
      url: publicUrl,
      storage: 'local',
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
