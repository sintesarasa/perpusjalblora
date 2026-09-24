'use client';

import * as React from 'react';
import QRCode from 'qrcode';

interface BookSpineStickerItemProps {
  bookTitle: string;
  author: string;
  categoryName?: string;
  categorySlug?: string;
  inventoryCode: string;
  bookSlug: string;
  shelfLocation?: string | null;
  copyNumber?: number;
}

/**
 * Standard Library Call Number Generator
 * - DDC / Category Code (e.g. 813 for Indonesian Fiction/Literature)
 * - 3 Uppercase letters of Author's surname/first name (e.g. TOE for Pramoedya Ananta Toer)
 * - 1 Lowercase letter of first significant word in Book Title (e.g. b for Bumi Manusia)
 */
function getCallNumberParts(author: string, title: string, categorySlug?: string) {
  // 1. DDC rough mapping or category prefix
  let ddc = '813';
  if (categorySlug) {
    if (categorySlug.includes('sastra') || categorySlug.includes('fiksi')) ddc = '813';
    else if (categorySlug.includes('pendidikan')) ddc = '370';
    else if (categorySlug.includes('sosial')) ddc = '300';
    else if (categorySlug.includes('sejarah')) ddc = '959';
    else if (categorySlug.includes('anak')) ddc = '813.08';
    else if (categorySlug.includes('budaya')) ddc = '306';
    else if (categorySlug.includes('lingkungan')) ddc = '333.7';
    else ddc = '000';
  }

  // 2. Author 3 letters (capitalized)
  const cleanAuthor = author.replace(/[^a-zA-Z\s]/g, '').trim();
  const authorParts = cleanAuthor.split(/\s+/).filter(Boolean);
  const authorWord = authorParts.length > 0 ? authorParts[authorParts.length - 1] : 'NNN';
  const authorCode = (authorWord.length >= 3 ? authorWord.slice(0, 3) : authorWord.padEnd(3, 'X')).toUpperCase();

  // 3. Title 1 letter (lowercase), ignoring common Indonesian stop-words
  const cleanTitle = title.replace(/^(sebuah|seorang|suatu|the|a|an)\s+/i, '').trim();
  const titleLetter = cleanTitle.charAt(0).toLowerCase() || 'b';

  return { ddc, authorCode, titleLetter };
}

export function BookSpineStickerItem({
  bookTitle,
  author,
  categoryName,
  categorySlug,
  inventoryCode,
  bookSlug,
  shelfLocation,
}: BookSpineStickerItemProps) {
  const [qrSvg, setQrSvg] = React.useState<string>('');

  const { ddc, authorCode, titleLetter } = React.useMemo(
    () => getCallNumberParts(author, bookTitle, categorySlug),
    [author, bookTitle, categorySlug]
  );

  React.useEffect(() => {
    // Generate QR Code containing public URL or book check-in url
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://perpusjalblora.id';
    const targetUrl = `${origin}/buku/${bookSlug}`;

    QRCode.toString(targetUrl, {
      type: 'svg',
      margin: 0,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((svg) => setQrSvg(svg))
      .catch(() => {});
  }, [bookSlug]);

  return (
    <div className="w-[38mm] h-[48mm] bg-white text-black border-2 border-black p-1.5 flex flex-col justify-between font-mono box-border relative overflow-hidden select-none">
      {/* 1. HEADER LEMBAGA */}
      <div className="border-b border-black pb-0.5 text-center">
        <div className="font-extrabold text-[8px] tracking-widest uppercase leading-tight font-sans">
          PERPUSJAL BLORA
        </div>
        <div className="text-[6.5px] uppercase tracking-wider text-neutral-600 font-mono leading-none">
          PERPUSTAKAAN JALANAN
        </div>
      </div>

      {/* 2. BODY CALL NUMBER & QR CODE */}
      <div className="flex-1 flex items-center justify-between py-1 gap-1">
        {/* Left: Call Number (Nomor Panggil Standar) */}
        <div className="flex-1 flex flex-col justify-center items-center text-center leading-none space-y-1">
          <div className="text-[11px] font-bold tracking-wider font-mono">
            {ddc}
          </div>
          <div className="text-[12px] font-extrabold tracking-widest font-mono">
            {authorCode}
          </div>
          <div className="text-[11px] font-serif font-bold italic">
            {titleLetter}
          </div>
        </div>

        {/* Right: QR Code Vektor */}
        <div className="w-[18mm] h-[18mm] shrink-0 border border-black p-0.5 flex items-center justify-center bg-white">
          {qrSvg ? (
            <div
              className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          ) : (
            <div className="text-[7px] text-center font-mono">QR</div>
          )}
        </div>
      </div>

      {/* 3. FOOTER KODE INVENTARIS & LOKASI */}
      <div className="border-t border-black pt-0.5 text-center">
        <div className="font-mono font-bold text-[9px] tracking-wider leading-none text-black">
          {inventoryCode}
        </div>
        <div className="text-[6.5px] text-neutral-600 truncate max-w-full leading-tight mt-0.5 font-sans">
          {shelfLocation ? `Rak: ${shelfLocation}` : (categoryName || 'Koleksi')}
        </div>
      </div>
    </div>
  );
}
