import { redirect } from 'next/navigation';

interface Props {
  params: { id: string };
}

export default function DashboardTulisIdRedirect({ params }: Props) {
  redirect(`/dashboard/tulisan/tulis/${params.id}`);
}
