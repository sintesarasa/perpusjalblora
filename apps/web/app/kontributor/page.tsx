import * as React from 'react';
import { ContributorItem } from '@perpusjal/types';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';
import { ContributorsDirectoryClient } from './contributors-client';
import { getApiUrl } from '@/lib/api';

export const dynamic = 'force-dynamic';

async function fetchContributors(): Promise<ContributorItem[]> {
  const apiUrl = getApiUrl();
  try {
    const res = await fetch(`${apiUrl}/users/contributors?limit=50`, {
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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1 pb-20">
        <ContributorsDirectoryClient initialContributors={contributors} />
      </main>
      <RevealOnScroll variant="fade" delayMs={60}>
        <Footer />
      </RevealOnScroll>
    </div>
  );
}
