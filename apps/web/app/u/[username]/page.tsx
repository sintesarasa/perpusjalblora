import { redirect } from 'next/navigation';

export default async function LegacyUserProfileRedirectPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  redirect(`/warga/${encodeURIComponent(username)}`);
}
