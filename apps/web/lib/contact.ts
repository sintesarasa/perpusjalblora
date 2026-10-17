/**
 * Official Contact Configuration for Perpusjal Blora
 * Mengelola nomor kontak resmi dan generator tautan WhatsApp terpusat.
 */

export const OFFICIAL_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_CONTACT || '6281234567890';

export function getWhatsAppUrl(text?: string): string {
  const cleanNumber = OFFICIAL_WHATSAPP_NUMBER.replace(/[^0-9]/g, '');
  if (!text) {
    return `https://wa.me/${cleanNumber}`;
  }
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}
