import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DashboardTulisIdRedirect({ params }: Props) {
  const { id } = await params;
  redirect(`/dashboard/tulisan/tulis/${id}`);
}
