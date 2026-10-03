import { redirect } from 'next/navigation';

/**
 * Legacy redirect: /notifikasi -> /dashboard/notifikasi
 * Memastikan link lama, bookmark, atau history pengguna diarahkan secara otomatis
 * ke ruang kendali dasbor anggota yang terintegrasi.
 */
export default function LegacyNotificationsPage() {
  redirect('/dashboard/notifikasi');
}
