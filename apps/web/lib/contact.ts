/**
 * Official Contact Configuration for Perpusjal Blora
 * Mengelola nomor kontak resmi dan generator tautan WhatsApp terpusat.
 */

export const OFFICIAL_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_CONTACT || '6281234567890';

export type WhatsAppPayload =
  | string
  | {
      type?: 'book_inquiry' | 'donation' | 'general';
      bookTitle?: string;
      message?: string;
    };

export function getWhatsAppUrl(payload?: WhatsAppPayload): string {
  const cleanNumber = OFFICIAL_WHATSAPP_NUMBER.replace(/[^0-9]/g, '');
  if (!payload) {
    return `https://wa.me/${cleanNumber}`;
  }

  if (typeof payload === 'string') {
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(payload)}`;
  }

  let text = payload.message || 'Halo Kolektif Perpusjal Blora, salam literasi!';
  if (payload.type === 'book_inquiry' && payload.bookTitle) {
    text = `Halo Relawan Perpusjal Blora, saya ingin bertanya tentang buku "${payload.bookTitle}". Apakah bisa dibaca/dipinjam di lapak terpal?`;
  } else if (payload.type === 'donation') {
    text = `Halo Kolektif Perpusjal Blora, saya ingin mendonasikan buku untuk lapak terpal.`;
  }

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}
