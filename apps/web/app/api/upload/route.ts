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

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    // 1. ATTEMPT CLOUDINARY UPLOAD FIRST (PRIMARY SCALABLE STORAGE)
    if (cloudName && cloudName !== 'perpusjal' && apiKey && apiSecret && apiKey !== 'mock-key') {
      try {
        const timestamp = Math.round(Date.now() / 1000);
        const folder = 'perpusjal/books';
        const strToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

        const cFormData = new FormData();
        const blob = new Blob([buffer], { type: file.type || 'image/jpeg' });
        cFormData.append('file', blob, file.name);
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
