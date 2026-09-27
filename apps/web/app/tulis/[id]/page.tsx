// Redirect old /tulis/[id] route to /dashboard/tulis/[id]
import { redirect } from 'next/navigation';

interface Props {
  params: { id: string };
}

export default function TulisIdRedirectPage({ params }: Props) {
  redirect(`/dashboard/tulis/${params.id}`);
}
