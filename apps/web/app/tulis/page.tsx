// Redirect old /tulis route to /dashboard/tulis (editor now lives in dashboard)
import { redirect } from 'next/navigation';

export default function TulisRedirectPage() {
  redirect('/dashboard/tulis');
}
