'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  LandingSettings,
  DEFAULT_LANDING_SETTINGS,
  LandingTickerItem,
  EventItem,
} from '@perpusjal/types';
import { apiClient } from '@/lib/api';
import {
  Flame,
  Newspaper,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sparkles,
  Megaphone,
  Info,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CustomLoader } from '@/components/ui/custom-loader';
import { cn } from '@/lib/utils';
import { DigitalStampEffect } from '@/components/circulation/digital-stamp-effect';
import { PetaNavigasi } from '@/components/layout/peta-navigasi';

type TabType = 'sorotan' | 'ticker' | 'cfd';

export default function AdminBerandaPage() {
  const [activeTab, setActiveTab] = React.useState<TabType>('sorotan');
  const [settings, setSettings] = React.useState<LandingSettings>(DEFAULT_LANDING_SETTINGS);
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  // Fetch initial landing settings and available events
  React.useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        setIsLoading(true);
        const [settingsRes, eventsRes] = await Promise.all([
          apiClient<LandingSettings>('/admin/landing-config'),
          apiClient<{ data: EventItem[] }>('/events?perPage=50&status=mendatang'),
        ]);

        if (!isMounted) return;

        if (settingsRes.data) {
          setSettings({
            ...DEFAULT_LANDING_SETTINGS,
            ...settingsRes.data,
            featuredEvent: {
              ...DEFAULT_LANDING_SETTINGS.featuredEvent,
              ...(settingsRes.data.featuredEvent || {}),
            },
            ticker: {
              ...DEFAULT_LANDING_SETTINGS.ticker,
              ...(settingsRes.data.ticker || {}),
              items: settingsRes.data.ticker?.items?.length
                ? settingsRes.data.ticker.items
                : DEFAULT_LANDING_SETTINGS.ticker.items,
            },
            cfdSchedule: {
              ...DEFAULT_LANDING_SETTINGS.cfdSchedule,
              ...(settingsRes.data.cfdSchedule || {}),
            },
          });
        }

        if (eventsRes.data?.data) {
          setEvents(eventsRes.data.data);
        } else {
          // If no upcoming, try to fetch all events
          const allEventsRes = await apiClient<{ data: EventItem[] }>('/events?perPage=50&status=all');
          if (allEventsRes.data?.data) {
            setEvents(allEventsRes.data.data);
          }
        }
      } catch (err: any) {
        console.error('Failed to load landing settings or events:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Save changes handler
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const res = await apiClient<LandingSettings>('/admin/landing-config', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });

      if (res.error) {
        setSaveError(res.error.message || 'Gagal menyimpan pengaturan etalase beranda.');
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err: any) {
      setSaveError(err.message || 'Terjadi kesalahan sistem saat menyimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper find selected event
  const selectedEvent = React.useMemo(() => {
    if (!settings.featuredEvent.eventId) return null;
    return events.find((e) => e.id === settings.featuredEvent.eventId) || null;
  }, [settings.featuredEvent.eventId, events]);

  // Ticker items handlers
  const handleAddTickerItem = () => {
    const newItem: LandingTickerItem = {
      id: `t-${Date.now()}`,
      tag: 'WARTA BARU',
      text: 'Tulis maklumat baru di sini...',
      link: '/kegiatan',
    };
    setSettings((prev) => ({
      ...prev,
      ticker: {
        ...prev.ticker,
        items: [...prev.ticker.items, newItem],
      },
    }));
  };

  const handleUpdateTickerItem = (index: number, field: keyof LandingTickerItem, value: string) => {
    setSettings((prev) => {
      const newItems = [...prev.ticker.items];
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };
      return {
        ...prev,
        ticker: {
          ...prev.ticker,
          items: newItems,
        },
      };
    });
  };

  const handleRemoveTickerItem = (index: number) => {
    setSettings((prev) => {
      const newItems = prev.ticker.items.filter((_, i) => i !== index);
      return {
        ...prev,
        ticker: {
          ...prev.ticker,
          items: newItems,
        },
      };
    });
  };

  const handleMoveTickerItem = (index: number, direction: 'up' | 'down') => {
    setSettings((prev) => {
      const items = [...prev.ticker.items];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return prev;
      const temp = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = temp;
      return {
        ...prev,
        ticker: {
          ...prev.ticker,
          items,
        },
      };
    });
  };

  const handleResetTickerToDefault = () => {
    if (confirm('Kembalikan butir warta berjalan ke konfigurasi redaksi default?')) {
      setSettings((prev) => ({
        ...prev,
        ticker: {
          ...prev.ticker,
          items: DEFAULT_LANDING_SETTINGS.ticker.items,
        },
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <CustomLoader size="md" label="MEMBUKA BERKAS ETALASE BERANDA..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* 1. EDITORIAL HEADER BANNER */}
      <section className="border-b border-border-hairline bg-surface-muted/30 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <PetaNavigasi
              items={[
                { label: 'PERPUSJAL', href: '/' },
                { label: 'PENGURUS PUSAT', href: '/admin' },
                { label: 'ETALASE BERANDA' },
              ]}
              className="mb-2"
            />
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Warta &amp; Etalase Beranda
            </h1>
            <p className="font-serif text-sm sm:text-base text-muted max-w-2xl mt-1.5">
              Kelola tampilan muka utama publik: Sorotan Event Akbar (Tipe B Broadsheet Dossier), Ticker Warta Lapak, dan Status Jadwal CFD Mingguan.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs shrink-0">
            <Link
              href="/"
              target="_blank"
              className="px-4 py-2.5 border border-border-hairline bg-surface hover:border-foreground text-foreground font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2 rounded-none"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Lihat Beranda Publik</span>
            </Link>

            <Button
              variant="solid"
              size="md"
              onClick={handleSave}
              isLoading={isSaving}
              className="inline-flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </Button>
          </div>
        </div>
      </section>

      {/* FEEDBACK BANNERS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        {saveSuccess && (
          <div className="p-4 bg-surface border-2 border-foreground flex items-center justify-between text-xs font-mono mb-6">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-foreground" />
              <span className="font-bold uppercase tracking-wider">
                Maklumat Tersimpan: Pengaturan etalase beranda publik berhasil diperbarui dan aktif!
              </span>
            </div>
            <span className="text-[10px] text-muted uppercase">STATUS // TERSINKRON</span>
          </div>
        )}

        {saveError && (
          <div className="p-4 bg-surface border-2 border-foreground flex items-center justify-between text-xs font-mono mb-6 text-foreground">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-foreground" />
              <span className="font-bold">{saveError}</span>
            </div>
            <span className="text-[10px] text-muted uppercase">STATUS // GAGAL</span>
          </div>
        )}
      </div>

      {/* 2. TAB NAVIGATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-2">
        <div className="flex border-b-2 border-foreground font-mono text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('sorotan')}
            className={cn(
              'px-5 py-3 border-r border-border-hairline transition-colors flex items-center gap-2 shrink-0 uppercase tracking-wider font-bold',
              activeTab === 'sorotan'
                ? 'bg-foreground text-background'
                : 'bg-surface text-muted hover:text-foreground hover:bg-surface-muted'
            )}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>1. Sorotan Event Akbar (Dossier B)</span>
            {settings.featuredEvent.isActive && (
              <span className={cn(
                'ml-1 text-[9px] px-1 py-0.2 uppercase font-bold',
                activeTab === 'sorotan' ? 'bg-background text-foreground' : 'bg-foreground text-background'
              )}>
                AKTIF
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ticker')}
            className={cn(
              'px-5 py-3 border-r border-border-hairline transition-colors flex items-center gap-2 shrink-0 uppercase tracking-wider font-bold',
              activeTab === 'ticker'
                ? 'bg-foreground text-background'
                : 'bg-surface text-muted hover:text-foreground hover:bg-surface-muted'
            )}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>2. Ticker Warta Lapak</span>
            {settings.ticker.isActive && (
              <span className={cn(
                'ml-1 text-[9px] px-1 py-0.2 uppercase font-bold',
                activeTab === 'ticker' ? 'bg-background text-foreground' : 'bg-foreground text-background'
              )}>
                AKTIF ({settings.ticker.items.length})
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cfd')}
            className={cn(
              'px-5 py-3 border-r border-border-hairline transition-colors flex items-center gap-2 shrink-0 uppercase tracking-wider font-bold',
              activeTab === 'cfd'
                ? 'bg-foreground text-background'
                : 'bg-surface text-muted hover:text-foreground hover:bg-surface-muted'
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>3. Status &amp; Jadwal CFD</span>
            <span className={cn(
              'ml-1 text-[9px] px-1 py-0.2 uppercase font-bold',
              activeTab === 'cfd' ? 'bg-background text-foreground' : 'bg-foreground text-background'
            )}>
              {settings.cfdSchedule.status}
            </span>
          </button>
        </div>
      </section>

      {/* 3. TAB CONTENTS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        {/* ========================================================================= */}
        {/* TAB 1: SOROTAN EVENT AKBAR                                                */}
        {/* ========================================================================= */}
        {activeTab === 'sorotan' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Controls (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Activation Switch */}
                <div className="p-5 border-2 border-foreground bg-surface space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold">Aktifkan Sorotan Event Akbar</h3>
                      <p className="font-mono text-xs text-muted mt-0.5">
                        Tampilkan blok Broadsheet Dossier (Tipe B) di bawah Hero beranda saat ada agenda akbar.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.featuredEvent.isActive}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            featuredEvent: {
                              ...prev.featuredEvent,
                              isActive: e.target.checked,
                            },
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-muted peer-focus:outline-none border border-foreground peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-foreground peer-checked:after:bg-background after:border after:w-5 after:h-5 after:transition-all peer-checked:bg-foreground"></div>
                    </label>
                  </div>
                </div>

                {/* Event Selector */}
                <div className="p-5 border border-border-hairline bg-surface space-y-4">
                  <div className="flex items-center justify-between border-b border-border-hairline pb-2">
                    <span className="font-mono text-xs uppercase font-bold text-foreground">
                      PILIH AGENDA KEGIATAN
                    </span>
                    <Link
                      href="/dashboard/kegiatan"
                      className="font-mono text-[10px] uppercase text-muted hover:text-foreground hover:underline inline-flex items-center gap-1"
                    >
                      <span>Kelola Agenda</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="space-y-2">
                    <label className="font-mono text-[10px] uppercase text-muted block">
                      Daftar Kegiatan Tersedia di Basis Data:
                    </label>
                    <select
                      value={settings.featuredEvent.eventId || ''}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          featuredEvent: {
                            ...prev.featuredEvent,
                            eventId: e.target.value || null,
                          },
                        }))
                      }
                      className="w-full h-11 px-3.5 bg-background border border-foreground text-sm font-sans rounded-none focus:outline-none"
                    >
                      <option value="">-- Pilih Kegiatan untuk Disorot --</option>
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title} ({new Date(ev.startAt).toLocaleDateString('id-ID')} &bull; {ev.locationName})
                        </option>
                      ))}
                    </select>

                    {events.length === 0 && (
                      <p className="font-mono text-[11px] text-muted mt-1">
                        Belum ada data kegiatan aktif. Buat kegiatan baru melalui meja{' '}
                        <Link href="/dashboard/kegiatan" className="underline font-bold text-foreground">
                          Agenda &amp; Presensi Lapak
                        </Link>
                        .
                      </p>
                    )}
                  </div>

                  {selectedEvent && (
                    <div className="p-3 bg-surface-muted border border-border-hairline font-mono text-xs space-y-1.5 mt-3">
                      <div className="flex items-center justify-between text-[10px] text-muted uppercase">
                        <span>DETAIL AGENDA TERPILIH</span>
                        <span className="font-bold text-foreground">[{selectedEvent.type}]</span>
                      </div>
                      <div className="font-serif font-bold text-sm text-foreground">
                        {selectedEvent.title}
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-muted pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-foreground" />
                          {new Date(selectedEvent.startAt).toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-foreground" />
                          {selectedEvent.locationName}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom Badge & Custom Lead Copy */}
                <div className="p-5 border border-border-hairline bg-surface space-y-4">
                  <div className="border-b border-border-hairline pb-2 font-mono text-xs uppercase font-bold text-foreground">
                    PENYESUAIAN TEKS EDITORIAL
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] uppercase text-muted block">
                      Teks Pita Maklumat (Badge Top Ledger):
                    </label>
                    <Input
                      value={settings.featuredEvent.customBadge || ''}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          featuredEvent: {
                            ...prev.featuredEvent,
                            customBadge: e.target.value,
                          },
                        }))
                      }
                      placeholder="MAKLUMAT RESMI REDAKSI // EDISI KHUSUS"
                      className="font-mono text-xs uppercase tracking-wider"
                    />
                    <span className="font-mono text-[10px] text-muted">
                      Ditampilkan pada pita hitam di pojok kiri atas dossier.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] uppercase text-muted block">
                      Kutipan Redaksi / Lead Kalimat Sorotan:
                    </label>
                    <textarea
                      rows={3}
                      value={settings.featuredEvent.customLead || ''}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          featuredEvent: {
                            ...prev.featuredEvent,
                            customLead: e.target.value,
                          },
                        }))
                      }
                      placeholder="Agenda akbar literasi komunitas swadaya Blora terbuka untuk seluruh warga."
                      className="w-full p-3 bg-background border border-border hover:border-foreground text-sm font-serif italic text-foreground rounded-none focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                    <span className="font-mono text-[10px] text-muted">
                      Kutipan tebal bergaya editorial sastra di bawah judul kegiatan.
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-border-hairline">
                    <div>
                      <span className="font-mono text-xs font-bold text-foreground uppercase">
                        Hitung Mundur (Countdown Hari H-X)
                      </span>
                      <p className="font-mono text-[10px] text-muted">
                        Tampilkan badge estimasi sisa hari menuju hari pelaksanaan kegiatan.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.featuredEvent.showCountdown}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            featuredEvent: {
                              ...prev.featuredEvent,
                              showCountdown: e.target.checked,
                            },
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-muted peer-focus:outline-none border border-foreground peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-foreground peer-checked:after:bg-background after:border after:w-5 after:h-5 after:transition-all peer-checked:bg-foreground"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Live Preview Box (5 cols) */}
              <div className="lg:col-span-5 space-y-4 sticky top-20">
                <div className="flex items-center justify-between border-b-2 border-foreground pb-2 font-mono text-xs">
                  <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-foreground" />
                    <span>Pratinjau Dossier (Tipe B)</span>
                  </span>
                  <span className="text-[10px] uppercase text-muted">
                    {settings.featuredEvent.isActive ? 'AKAN TAMPIL' : 'TIDAK AKTIF'}
                  </span>
                </div>

                {selectedEvent ? (
                  <div className="border-2 border-foreground bg-surface p-6 font-mono text-xs space-y-4">
                    {/* Simulated Badge */}
                    <div className="flex items-center justify-between border-b border-foreground pb-3">
                      <span className="px-2 py-0.5 bg-foreground text-background font-mono text-[9px] font-bold uppercase tracking-wider">
                        {settings.featuredEvent.customBadge || 'MAKLUMAT RESMI REDAKSI'}
                      </span>
                      {settings.featuredEvent.showCountdown && (
                        <span className="px-1.5 py-0.5 border border-foreground text-[9px] uppercase font-bold">
                          ⏳ H-3 MENUJU AGENDA
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-serif text-xl font-black uppercase text-foreground leading-tight">
                        {selectedEvent.title}
                      </h4>
                      {settings.featuredEvent.customLead && (
                        <p className="font-serif italic text-xs text-foreground/80 border-l-2 border-foreground pl-2 py-0.5">
                          &ldquo;{settings.featuredEvent.customLead}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5 text-[11px] text-muted pt-2 border-t border-border-hairline">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-foreground shrink-0" />
                        <span>
                          {new Date(selectedEvent.startAt).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-foreground shrink-0" />
                        <span>{selectedEvent.locationName}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border-hairline flex items-center justify-between">
                      <DigitalStampEffect variant="TERSEDIA" size="sm" />
                      <div className="px-3 py-1.5 bg-foreground text-background font-bold text-[10px] uppercase">
                        Presensi Warga
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-border-hairline text-center font-mono text-xs text-muted space-y-2">
                    <Info className="w-6 h-6 mx-auto text-muted/60" />
                    <p>Pilih satu kegiatan di panel kiri untuk melihat pratinjau kartu dossier.</p>
                  </div>
                )}

                <div className="p-3 bg-surface-muted border border-border-hairline font-mono text-[11px] text-muted leading-relaxed">
                  <strong>Catatan Redaksi:</strong> Saat aktif, dossier ini akan langsung disematkan tepat di bawah tajuk utama masthead beranda dan di atas kurasi katalog.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TICKER WARTA LAPAK                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'ticker' && (
          <div className="space-y-8">
            {/* Activation Switch */}
            <div className="p-5 border-2 border-foreground bg-surface flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold">Aktifkan Ticker Warta Berjalan</h3>
                <p className="font-mono text-xs text-muted mt-0.5">
                  Menampilkan pita teks berjalan (running text) di bawah bilah navigasi utama beranda.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.ticker.isActive}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      ticker: {
                        ...prev.ticker,
                        isActive: e.target.checked,
                      },
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-muted peer-focus:outline-none border border-foreground peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-foreground peer-checked:after:bg-background after:border after:w-5 after:h-5 after:transition-all peer-checked:bg-foreground"></div>
              </label>
            </div>

            {/* Ticker Items Editor */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-foreground pb-2">
                <div>
                  <h4 className="font-serif text-base font-bold uppercase tracking-wider">
                    Daftar Maklumat Warta ({settings.ticker.items.length} Butir)
                  </h4>
                  <p className="font-mono text-xs text-muted">
                    Setiap butir akan bergulir secara kontinu dalam format koran cetak di halaman depan.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetTickerToDefault}
                    className="px-3 py-1.5 border border-border-hairline hover:border-foreground font-mono text-[10px] uppercase font-semibold text-muted hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Default</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddTickerItem}
                    className="px-4 py-1.5 bg-foreground text-background font-mono text-[11px] uppercase font-bold tracking-wider hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Maklumat</span>
                  </button>
                </div>
              </div>

              {/* List of items */}
              <div className="space-y-3">
                {settings.ticker.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 border border-border-hairline bg-surface hover:border-foreground transition-colors space-y-3 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-border-hairline pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-[10px] uppercase text-muted font-bold">
                          MAKLUMAT #{idx + 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveTickerItem(idx, 'up')}
                          className="p-1.5 border border-border-hairline hover:border-foreground disabled:opacity-30 disabled:pointer-events-none"
                          title="Geser ke atas"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === settings.ticker.items.length - 1}
                          onClick={() => handleMoveTickerItem(idx, 'down')}
                          className="p-1.5 border border-border-hairline hover:border-foreground disabled:opacity-30 disabled:pointer-events-none"
                          title="Geser ke bawah"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveTickerItem(idx)}
                          className="p-1.5 border border-red-300 text-red-600 hover:bg-red-50 ml-1"
                          title="Hapus maklumat ini"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-3">
                        <label className="text-[9.5px] uppercase text-muted block mb-1">
                          Tag / Kategori:
                        </label>
                        <input
                          type="text"
                          value={item.tag}
                          onChange={(e) => handleUpdateTickerItem(idx, 'tag', e.target.value)}
                          placeholder="WARTA LAPAK"
                          className="w-full h-9 px-2.5 bg-background border border-border text-xs uppercase font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-foreground"
                        />
                      </div>

                      <div className="sm:col-span-6">
                        <label className="text-[9.5px] uppercase text-muted block mb-1">
                          Isi Kalimat Maklumat:
                        </label>
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) => handleUpdateTickerItem(idx, 'text', e.target.value)}
                          placeholder="Lesehan terpal setiap minggu pagi di Alun-Alun Blora..."
                          className="w-full h-9 px-2.5 bg-background border border-border text-xs font-serif focus:outline-none focus:ring-1 focus:ring-foreground"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[9.5px] uppercase text-muted block mb-1">
                          Tautan URL (Opsional):
                        </label>
                        <input
                          type="text"
                          value={item.link || ''}
                          onChange={(e) => handleUpdateTickerItem(idx, 'link', e.target.value)}
                          placeholder="/kegiatan atau /buku"
                          className="w-full h-9 px-2.5 bg-background border border-border text-xs font-mono focus:outline-none focus:ring-1 focus:ring-foreground"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: STATUS & JADWAL LAPAK CFD                                          */}
        {/* ========================================================================= */}
        {activeTab === 'cfd' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Controls (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Activation Switch */}
                <div className="p-5 border-2 border-foreground bg-surface space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold">Status Operasional Lapak CFD</h3>
                      <p className="font-mono text-xs text-muted mt-0.5">
                        Tampilkan badge status jadwal lapak car-free day di tajuk utama beranda.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.cfdSchedule.isActive}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            cfdSchedule: {
                              ...prev.cfdSchedule,
                              isActive: e.target.checked,
                            },
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-muted peer-focus:outline-none border border-foreground peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-foreground peer-checked:after:bg-background after:border after:w-5 after:h-5 after:transition-all peer-checked:bg-foreground"></div>
                    </label>
                  </div>
                </div>

                {/* Status Options */}
                <div className="p-5 border border-border-hairline bg-surface space-y-4">
                  <div className="border-b border-border-hairline pb-2 font-mono text-xs uppercase font-bold text-foreground">
                    STATUS LAPAK MINGGU INI
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                    {[
                      {
                        value: 'BUKA_NORMAL',
                        label: 'Buka Normal',
                        desc: 'Lesehan terpal buka seperti biasa di Alun-Alun Blora 06.00-10.00 WIB.',
                      },
                      {
                        value: 'PINDAH_LOKASI',
                        label: 'Pindah Lokasi',
                        desc: 'Lapak dialihkan ke titik alternatif (misal: saat ada upacara/panggung).',
                      },
                      {
                        value: 'LIBUR_CFD',
                        label: 'Lapak Libur',
                        desc: 'Ditiadakan sementara (misal: cuaca ekstrem atau libur hari raya).',
                      },
                      {
                        value: 'EDISI_KHUSUS',
                        label: 'Edisi Khusus',
                        desc: 'Lapak edisi festival, bedah karya akbar, atau kolaborasi terbuka.',
                      },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setSettings((prev) => ({
                            ...prev,
                            cfdSchedule: {
                              ...prev.cfdSchedule,
                              status: opt.value as any,
                            },
                          }))
                        }
                        className={cn(
                          'p-3.5 border text-left transition-all space-y-1',
                          settings.cfdSchedule.status === opt.value
                            ? 'border-2 border-foreground bg-foreground text-background font-bold'
                            : 'border-border-hairline bg-background text-foreground hover:border-foreground'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="uppercase text-[11px] tracking-wider">{opt.label}</span>
                          <span className="text-[9px] opacity-75">[{opt.value}]</span>
                        </div>
                        <p className={cn(
                          'text-[10px] leading-relaxed',
                          settings.cfdSchedule.status === opt.value ? 'text-background/80' : 'text-muted'
                        )}>
                          {opt.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Badge Text & Notes */}
                <div className="p-5 border border-border-hairline bg-surface space-y-4">
                  <div className="border-b border-border-hairline pb-2 font-mono text-xs uppercase font-bold text-foreground">
                    INFORMASI &amp; PERINGATAN WARGA
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] uppercase text-muted block">
                      Teks Ledger Status (Badge Tajuk Hero):
                    </label>
                    <Input
                      value={settings.cfdSchedule.badgeText}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          cfdSchedule: {
                            ...prev.cfdSchedule,
                            badgeText: e.target.value,
                          },
                        }))
                      }
                      placeholder="LAPAK CFD: SETIAP MINGGU PAGI"
                      className="font-mono text-xs uppercase tracking-wider"
                    />
                    <span className="font-mono text-[10px] text-muted">
                      Ditampilkan di garis atas masthead Hero beranda depan.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] uppercase text-muted block">
                      Catatan Rutin Operasional Lapak:
                    </label>
                    <textarea
                      rows={2}
                      value={settings.cfdSchedule.note || ''}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          cfdSchedule: {
                            ...prev.cfdSchedule,
                            note: e.target.value,
                          },
                        }))
                      }
                      placeholder="Lapak Terbuka: Setiap Minggu 06.00–10.00 WIB di hamparan terpal trotoar Alun-Alun Blora."
                      className="w-full p-3 bg-background border border-border hover:border-foreground text-xs font-mono text-foreground rounded-none focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] uppercase text-muted block flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-foreground" />
                      <span>Pengumuman Khusus / Maklumat Insidental (Opsional):</span>
                    </label>
                    <textarea
                      rows={2}
                      value={settings.cfdSchedule.alertNotice || ''}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          cfdSchedule: {
                            ...prev.cfdSchedule,
                            alertNotice: e.target.value || null,
                          },
                        }))
                      }
                      placeholder="Contoh: Maklumat Darurat — Dikarenakan hujan lebat dan angin di Alun-Alun, lapak baca minggu ini dialihkan ke pendopo."
                      className="w-full p-3 bg-background border border-border hover:border-foreground text-xs font-mono text-foreground rounded-none focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                    <span className="font-mono text-[10px] text-muted">
                      Jika diisi, pesan ini akan muncul sebagai banner maklumat tegas bergaris ganda di halaman depan. Kosongkan jika tidak ada pemberitahuan mendesak.
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Preview Box (5 cols) */}
              <div className="lg:col-span-5 space-y-4 sticky top-20">
                <div className="border-b-2 border-foreground pb-2 font-mono text-xs flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-foreground" />
                    <span>Pratinjau Status di Hero</span>
                  </span>
                  <span className="text-[10px] uppercase text-muted">LEMBAR DEPAN</span>
                </div>

                <div className="p-6 border-2 border-foreground bg-surface font-mono text-xs space-y-4">
                  {/* Ledger strip simulation */}
                  <div className="pb-3 border-b border-border-hairline flex items-center justify-between text-[10px] text-muted">
                    <span>[ EDISI RESMI ]</span>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-foreground animate-pulse" />
                      <span className="text-foreground font-bold">
                        {settings.cfdSchedule.badgeText || 'LAPAK CFD: SETIAP MINGGU PAGI'}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator Pill */}
                  <div className="p-3 bg-background border border-border-hairline flex items-center justify-between">
                    <span className="text-muted text-[10px] uppercase">STATUS SISTEM:</span>
                    <span className="px-2 py-0.5 bg-foreground text-background font-bold text-[10px] uppercase tracking-wider">
                      {settings.cfdSchedule.status}
                    </span>
                  </div>

                  {/* Operational Note */}
                  {settings.cfdSchedule.note && (
                    <div className="p-3 bg-surface-muted border border-border-hairline text-[11px] leading-relaxed text-muted">
                      {settings.cfdSchedule.note}
                    </div>
                  )}

                  {/* Alert Notice Banner Simulation */}
                  {settings.cfdSchedule.alertNotice && (
                    <div className="p-3 bg-background border-2 border-foreground space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground">
                        <AlertTriangle className="w-3.5 h-3.5 text-foreground" />
                        <span>PERINGATAN REDAKSI LAPAK:</span>
                      </div>
                      <p className="font-serif text-xs text-foreground leading-relaxed">
                        {settings.cfdSchedule.alertNotice}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
