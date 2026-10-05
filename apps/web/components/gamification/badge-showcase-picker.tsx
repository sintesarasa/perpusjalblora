'use client';

import * as React from 'react';
import { Award, Plus, X, Check, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BadgeInsignia } from './badge-insignia';
import { getTierInfo } from '@/lib/badge-tier-styles';
import { apiClient } from '@/lib/api';
import { UserBadgeProgress } from '@perpusjal/types';

interface BadgeShowcasePickerProps {
  initialBadgeCodes?: string[];
  earnedBadges: UserBadgeProgress[];
  onSaved?: (newCodes: string[]) => void;
}

export function BadgeShowcasePicker({
  initialBadgeCodes = [],
  earnedBadges = [],
  onSaved,
}: BadgeShowcasePickerProps) {
  const [selectedCodes, setSelectedCodes] = React.useState<string[]>(initialBadgeCodes);
  const [activeSlotIndex, setActiveSlotIndex] = React.useState<number | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSelectedCodes(initialBadgeCodes);
  }, [initialBadgeCodes]);

  const earnedMap = React.useMemo(() => {
    const map = new Map<string, UserBadgeProgress>();
    for (const b of earnedBadges) {
      if (b.earned) {
        map.set(b.badge.code, b);
      }
    }
    return map;
  }, [earnedBadges]);

  const handleSelectBadge = (code: string) => {
    if (activeSlotIndex === null) return;
    const next = [...selectedCodes];
    // If this code is already in another slot, remove it first
    const existingIndex = next.indexOf(code);
    if (existingIndex !== -1 && existingIndex !== activeSlotIndex) {
      next.splice(existingIndex, 1);
    }

    next[activeSlotIndex] = code;
    // Filter down to unique non-empty up to 3
    const cleaned = next.filter(Boolean).slice(0, 3);
    setSelectedCodes(cleaned);
    setActiveSlotIndex(null);
  };

  const handleRemoveSlot = (index: number) => {
    const next = [...selectedCodes];
    next.splice(index, 1);
    setSelectedCodes(next);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await apiClient<{ showcaseBadgeCodes: string[] }>('/badges/showcase', {
        method: 'PATCH',
        body: JSON.stringify({ badgeCodes: selectedCodes }),
      });

      if (res.data) {
        setMessage('Etalase 3 Lencana Kebanggaan berhasil diperbarui!');
        onSaved?.(res.data.showcaseBadgeCodes);
        setTimeout(() => setMessage(null), 3500);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan etalase lencana.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border-2 border-foreground bg-surface p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-foreground pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold tracking-widest text-muted">
            <Star className="w-3.5 h-3.5 text-foreground fill-foreground" />
            <span>ETALASE PROFIL PUBLIK</span>
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground">
            Etalase 3 Lencana Kebanggaan
          </h3>
          <p className="font-sans text-xs text-muted max-w-xl leading-relaxed">
            Pilih hingga 3 lencana terbaik yang paling kamu banggakan untuk dipajang di podium terdepan profil publik dan kartu anggotamu.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 border-2 border-foreground bg-foreground text-background hover:bg-foreground/90 font-mono text-xs uppercase font-bold tracking-wider transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
        >
          {saving ? 'Menyimpan...' : 'Simpan Etalase'}
        </button>
      </div>

      {message && (
        <div className="p-3 bg-foreground text-background font-mono text-xs font-bold flex items-center gap-2 animate-in fade-in-50">
          <Check className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* 3 Showcase Pedestals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((slotIdx) => {
          const code = selectedCodes[slotIdx];
          const badgeProgress = code ? earnedMap.get(code) : undefined;
          const tierInfo = badgeProgress ? getTierInfo(badgeProgress.badge.tier) : null;

          return (
            <div
              key={slotIdx}
              className={cn(
                'border-2 relative p-4 flex flex-col items-center justify-center text-center transition-all min-h-[170px]',
                badgeProgress && tierInfo
                  ? cn('bg-surface', tierInfo.borderClass)
                  : 'border-dashed border-border-hairline bg-surface-muted/20 hover:border-foreground'
              )}
            >
              {/* Slot Indicator */}
              <span className="absolute top-2 left-2.5 font-mono text-[9px] uppercase font-bold text-muted">
                SLOT #{slotIdx + 1}
              </span>

              {badgeProgress && (
                <button
                  type="button"
                  onClick={() => handleRemoveSlot(slotIdx)}
                  className="absolute top-2 right-2 p-1 text-muted hover:text-foreground transition-colors"
                  title="Kosongkan Slot"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {badgeProgress ? (
                <div className="flex flex-col items-center space-y-2 mt-2">
                  <BadgeInsignia
                    code={badgeProgress.badge.code}
                    tier={badgeProgress.badge.tier}
                    category={badgeProgress.badge.category}
                    earned={true}
                    size="md"
                  />
                  <div className="space-y-0.5 max-w-full">
                    <span className="font-mono text-[9px] uppercase font-bold text-muted block">
                      Tier {badgeProgress.badge.tier} • {tierInfo?.name}
                    </span>
                    <h4 className="font-serif font-bold text-sm text-foreground truncate px-1">
                      {badgeProgress.badge.name}
                    </h4>
                    {badgeProgress.badge.titleReward && (
                      <span className="font-mono text-[9.5px] text-foreground font-semibold block truncate">
                        "{badgeProgress.badge.titleReward}"
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSlotIndex(slotIdx)}
                    className="font-mono text-[9px] uppercase text-muted hover:text-foreground underline pt-1"
                  >
                    Ganti Lencana
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveSlotIndex(slotIdx)}
                  className="flex flex-col items-center justify-center space-y-2 text-muted hover:text-foreground transition-colors p-2"
                >
                  <div className="w-10 h-10 border-2 border-dashed border-border-hairline flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider">
                    + Pasang Lencana
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Selection Modal / Drawer ── */}
      {activeSlotIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in-50"
          onClick={() => setActiveSlotIndex(null)}
        >
          <div
            className="w-full max-w-2xl bg-surface border-2 border-foreground p-5 sm:p-6 space-y-4 max-h-[92dvh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-2 border-foreground pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-muted block">
                  PILIH UNTUK SLOT #{activeSlotIndex + 1}
                </span>
                <h4 className="font-serif font-bold text-lg text-foreground">
                  Daftar Lencana Terbuka Milikmu ({earnedMap.size} Lencana)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveSlotIndex(null)}
                className="p-1 hover:bg-surface-muted text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {earnedMap.size === 0 ? (
              <div className="py-12 text-center font-mono text-xs text-muted">
                Kamu belum membuka lencana apapun. Selesaikan aktivitas di pilar-pilar literasi untuk membuka lencana pertamamu!
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 divide-y divide-border-hairline pr-1 space-y-1">
                {Array.from(earnedMap.values()).map((b) => {
                  const isSelected = selectedCodes.includes(b.badge.code);
                  const tInfo = getTierInfo(b.badge.tier);

                  return (
                    <div
                      key={b.badge.code}
                      onClick={() => handleSelectBadge(b.badge.code)}
                      className={cn(
                        'p-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-surface-muted/40 transition-colors',
                        isSelected && 'bg-surface-muted/60'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <BadgeInsignia
                          code={b.badge.code}
                          tier={b.badge.tier}
                          category={b.badge.category}
                          earned={true}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-sm text-foreground truncate">
                              {b.badge.name}
                            </span>
                            <span
                              className={cn(
                                'font-mono text-[9px] uppercase px-1.5 py-0.2 border font-bold',
                                tInfo.badgeTagClass
                              )}
                            >
                              Tier {b.badge.tier} • {tInfo.name}
                            </span>
                          </div>
                          {b.badge.titleReward && (
                            <span className="font-mono text-[10px] text-muted block">
                              Gelar: "{b.badge.titleReward}"
                            </span>
                          )}
                          <p className="font-sans text-xs text-muted line-clamp-1 mt-0.5">
                            {b.badge.description}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <span className="font-mono text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 px-2 py-1">
                            Terpasang
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] uppercase font-bold text-foreground border border-foreground px-2 py-1 hover:bg-foreground hover:text-background transition-colors">
                            Pilih
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
