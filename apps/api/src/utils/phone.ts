/**
 * Helper to normalize Indonesian phone numbers to international standard (628xxx)
 */
export function normalizePhoneNumber(raw?: string | null): string | null {
  if (!raw) return null;
  let cleaned = raw.replace(/\D/g, '');
  if (!cleaned) return null;
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62') && cleaned.length >= 8) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}
