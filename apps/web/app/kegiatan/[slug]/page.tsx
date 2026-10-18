import * as React from 'react';
import type { Metadata } from 'next';
import { apiClient } from '@/lib/api';
import { EventDetail } from '@perpusjal/types';
import { EventDetailClient } from './event-detail-client';
import { CustomLoader } from '@/components/ui/custom-loader';
import { JsonLd } from '@/components/seo/json-ld';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://perpusjalblora.org';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await apiClient<{ data: EventDetail }>(`/events/${slug}`);
    const event = res.data?.data;

    if (!event) {
      return {
        title: 'Agenda Tidak Ditemukan',
        description: 'Agenda kegiatan literasi atau lapak baca yang kamu cari tidak ditemukan di arsip Perpustakaan Jalanan Blora.',
      };
    }

    const title = `${event.title} — Agenda Literasi Perpusjal Blora`;
    const formattedDate = new Date(event.startAt).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const description = `Ikuti agenda "${event.title}" pada ${formattedDate} di ${event.locationName}. Terbuka untuk umum, gratis tanpa dipungut biaya.`.slice(0, 160);

    const images = event.coverImage
      ? [
          {
            url: event.coverImage,
            width: 1200,
            height: 630,
            alt: `Pamflet kegiatan ${event.title}`,
          },
        ]
      : undefined;

    return {
      title,
      description,
      alternates: {
        canonical: `/kegiatan/${slug}`,
      },
      openGraph: {
        title,
        description,
        type: 'website',
        url: `${appUrl}/kegiatan/${slug}`,
        siteName: 'Perpustakaan Jalanan Blora',
        locale: 'id_ID',
        images,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: event.coverImage ? [event.coverImage] : undefined,
      },
    };
  } catch {
    return {
      title: 'Agenda & Kegiatan Komunitas',
      description: 'Daftar lapak baca mingguan, bedah naskah, diskusi terbuka, dan lokakarya Perpustakaan Jalanan Blora.',
    };
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let event: EventDetail | null = null;

  try {
    const res = await apiClient<{ data: EventDetail }>(`/events/${slug}`);
    event = res.data?.data || null;
  } catch {
    // Graceful fallback during build
  }

  const eventStructuredData = event
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Event',
            '@id': `${appUrl}/kegiatan/${slug}#event`,
            name: event.title,
            startDate: event.startAt,
            endDate: event.endAt,
            eventStatus: 'https://schema.org/EventScheduled',
            eventAttendanceMode: event.isOnline
              ? 'https://schema.org/OnlineEventAttendanceMode'
              : 'https://schema.org/OfflineEventAttendanceMode',
            location: event.isOnline
              ? {
                  '@type': 'VirtualLocation',
                  url: event.meetingUrl || `${appUrl}/kegiatan/${slug}`,
                }
              : {
                  '@type': 'Place',
                  name: event.locationName,
                  address: {
                    '@type': 'PostalAddress',
                    streetAddress: event.locationDetail || 'Alun-Alun Blora',
                    addressLocality: 'Blora',
                    addressRegion: 'Jawa Tengah',
                    addressCountry: 'ID',
                  },
                },
            image: event.coverImage || undefined,
            organizer: {
              '@type': 'Organization',
              name: 'Perpustakaan Jalanan Blora',
              url: appUrl,
            },
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'IDR',
              availability: 'https://schema.org/InStock',
              validFrom: event.startAt,
              url: `${appUrl}/kegiatan/${slug}`,
            },
            isAccessibleForFree: true,
          },
          {
            '@type': 'BreadcrumbList',
            '@id': `${appUrl}/kegiatan/${slug}#breadcrumb`,
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Beranda',
                item: appUrl,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Agenda & Kegiatan',
                item: `${appUrl}/kegiatan`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: event.title,
                item: `${appUrl}/kegiatan/${slug}`,
              },
            ],
          },
        ],
      }
    : null;

  return (
    <>
      {eventStructuredData && <JsonLd data={eventStructuredData} />}
      <React.Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <CustomLoader size="md" label="MEMBUKA LEMBAR AGENDA KEGIATAN..." />
          </div>
        }
      >
        <EventDetailClient slug={slug} />
      </React.Suspense>
    </>
  );
}
