import { redirect } from 'next/navigation';

export default function AdminBookRedirectPage() {
  redirect('/dashboard/buku');
}
