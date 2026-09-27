import { redirect } from 'next/navigation';

interface Props {
  params: { id: string };
}

export default function TulisIdRedirectPage({ params }: Props) {
  redirect(`/dashboard/tulisan/tulis/${params.id}`);
}
