import * as React from 'react';
import { ContributorItem } from '@perpusjal/types';
import { ContributorsDirectoryClient } from './contributors-client';

export const dynamic = 'force-dynamic';

async function fetchContributors(): Promise<ContributorItem[]> {
  const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${apiUrl}/api/v1/users/contributors?limit=50`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.items || [];
  } catch (err) {
    console.error('Error fetching contributors:', err);
    return [];
  }
}

export const metadata = {
  title: 'Direktori Kontributor & Pegiat Terpal | Perpustakaan Jalanan Blora',
  description: 'Daftar warga, penulis, dan kurator yang berkontribusi dalam gerakan literasi komunitas di Blora.',
};

export default async function ContributorsPage() {
  const contributors = await fetchContributors();

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <ContributorsDirectoryClient initialContributors={contributors} />
    </main>
  );
}
