'use client';

import * as React from 'react';
import { X, Hash, ChevronDown, Plus, Loader2 } from 'lucide-react';
import { ArticleTag } from '@perpusjal/types';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';

interface TagPickerProps {
  tags: ArticleTag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onTagCreated?: (newTag: ArticleTag) => void;
  maxTags?: number;
}

export function TagPicker({
  tags: initialTags,
  selectedIds,
  onChange,
  onTagCreated,
  maxTags = 5,
}: TagPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [allTags, setAllTags] = React.useState<ArticleTag[]>(initialTags);
  const [isCreating, setIsCreating] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setAllTags(initialTags);
  }, [initialTags]);

  const canAddMore = selectedIds.length < maxTags;

  // Auto-close if max tags reached
  React.useEffect(() => {
    if (!canAddMore && isOpen) {
      setIsOpen(false);
      setSearch('');
    }
  }, [canAddMore, isOpen]);

  const selectedTags = allTags.filter((t) => selectedIds.includes(t.id));
  const filteredTags = allTags.filter(
    (t) =>
      !selectedIds.includes(t.id) &&
      t.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const exactMatchExists = allTags.some(
    (t) => t.name.toLowerCase() === search.trim().toLowerCase()
  );

  // Close on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
        setErrorMsg(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleTag = (tag: ArticleTag) => {
    if (selectedIds.includes(tag.id)) {
      onChange(selectedIds.filter((id) => id !== tag.id));
    } else if (canAddMore) {
      onChange([...selectedIds, tag.id]);
      setSearch('');
      setErrorMsg(null);
      setIsOpen(false); // Close dropdown after selection
    }
  };

  const removeTag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((sid) => sid !== id));
  };

  const handleCreateNewTag = async (tagName: string) => {
    const clean = tagName.trim().replace(/^#+/, '');
    if (!clean || !canAddMore || isCreating) return;

    // Check if already in allTags
    const existing = allTags.find(
      (t) => t.name.toLowerCase() === clean.toLowerCase() || t.slug === clean.toLowerCase()
    );

    if (existing) {
      if (!selectedIds.includes(existing.id)) {
        onChange([...selectedIds, existing.id]);
      }
      setSearch('');
      setIsOpen(false);
      return;
    }

    setIsCreating(true);
    setErrorMsg(null);

    try {
      const res = await apiClient<{ data?: ArticleTag; id?: string; name?: string; slug?: string }>(
        '/articles/tags',
        {
          method: 'POST',
          body: JSON.stringify({ name: clean }),
        }
      );

      const created: ArticleTag | null =
        (res.data as any)?.data || (res.data as any)?.id ? (res.data as any) : null;

      if (created && created.id) {
        setAllTags((prev) => [...prev, created]);
        if (onTagCreated) onTagCreated(created);
        onChange([...selectedIds, created.id]);
        setSearch('');
        setIsOpen(false);
      } else if (res.error) {
        setErrorMsg(res.error.message || 'Gagal membuat tag baru.');
      }
    } catch {
      setErrorMsg('Gagal membuat tag.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(false);
      setSearch('');
      return;
    }

    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (!search.trim()) return;

      if (filteredTags.length > 0 && exactMatchExists) {
        const matched = filteredTags.find(
          (t) => t.name.toLowerCase() === search.trim().toLowerCase()
        );
        if (matched) toggleTag(matched);
      } else {
        handleCreateNewTag(search.trim());
      }
    }
  };

  return (
    <div ref={dropdownRef} className="relative space-y-1.5">
      {/* ── Main Tag Input / Badges Display Container ── */}
      <div
        onClick={() => {
          if (canAddMore) {
            inputRef.current?.focus();
          }
        }}
        className={cn(
          'min-h-[46px] px-3 py-2 border flex flex-wrap items-center gap-2 cursor-text transition-colors bg-background rounded-none',
          isOpen ? 'border-foreground ring-1 ring-foreground' : 'border-border hover:border-foreground'
        )}
      >
        {/* Selected Tag Badges */}
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-foreground text-background font-mono text-[10px] uppercase tracking-wider select-none rounded-none"
          >
            <Hash className="w-2.5 h-2.5 text-muted-foreground" />
            <span>{tag.name}</span>
            <button
              type="button"
              onClick={(e) => removeTag(tag.id, e)}
              className="ml-0.5 text-background/70 hover:text-background transition-colors cursor-pointer p-0.5"
              aria-label={`Hapus tag ${tag.name}`}
            >
              <X className="w-3 h-3 stroke-[2.5]" />
            </button>
          </span>
        ))}

        {/* Input field embedded inside badge row */}
        {canAddMore && (
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              const val = e.target.value;
              setSearch(val);
              // Open suggestions when typing, or keep closed when empty
              if (val.trim().length > 0) {
                setIsOpen(true);
              }
            }}
            onFocus={() => {
              // Open suggestions only if already typing
              if (search.trim().length > 0) {
                setIsOpen(true);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedTags.length === 0
                ? 'Ketik kata kunci lalu tekan Enter (maks. 5)...'
                : 'Tambah kata kunci...'
            }
            className="flex-1 min-w-[130px] bg-transparent font-sans text-xs text-foreground placeholder:text-muted/40 focus:outline-none py-1"
          />
        )}

        {/* Dedicated Toggle Button for Browsing All Tags */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (canAddMore) {
              setIsOpen((prev) => !prev);
              if (!isOpen) {
                setTimeout(() => inputRef.current?.focus(), 50);
              }
            }
          }}
          disabled={!canAddMore}
          className={cn(
            'ml-auto flex items-center gap-1.5 px-2 py-1 border border-border-hairline hover:border-foreground bg-surface text-muted hover:text-foreground transition-colors cursor-pointer select-none rounded-none shrink-0',
            !canAddMore && 'opacity-60 cursor-not-allowed'
          )}
          title={isOpen ? 'Tutup rekomendasi (Esc)' : 'Buka pilihan tag'}
        >
          <span
            className={cn(
              'font-mono text-[10px] uppercase tracking-wider',
              selectedIds.length >= maxTags ? 'text-foreground font-bold' : 'text-muted'
            )}
          >
            {selectedIds.length}/{maxTags} Tag
          </span>
          <ChevronDown
            className={cn('w-3.5 h-3.5 text-muted transition-transform', isOpen && 'rotate-180 text-foreground')}
          />
        </button>
      </div>

      {/* ── Dropdown Suggestions (Floating seamlessly) ── */}
      {isOpen && canAddMore && (
        <div className="absolute left-0 right-0 top-full mt-1 border-2 border-foreground bg-surface rounded-none max-h-56 overflow-hidden flex flex-col z-50 shadow-none">
          {/* Header with Explicit Close Button */}
          <div className="px-3 py-1.5 border-b border-border-hairline bg-surface-muted/60 flex items-center justify-between text-[10px] font-mono text-muted uppercase shrink-0 select-none">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Hash className="w-3 h-3 text-foreground" />
              <span>Rekomendasi Kata Kunci</span>
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                setSearch('');
              }}
              className="text-muted hover:text-foreground font-bold tracking-wider inline-flex items-center gap-1 cursor-pointer transition-colors"
              title="Tutup (Esc)"
            >
              <span>TUTUP</span>
              <X className="w-3 h-3" />
            </button>
          </div>

          {errorMsg && (
            <div className="px-3 py-1.5 bg-destructive/10 text-destructive text-[11px] font-sans border-b border-border-hairline">
              {errorMsg}
            </div>
          )}

          {/* Autocomplete List */}
          <div className="overflow-y-auto flex-1 divide-y divide-border-hairline">
            {/* Create on-the-fly option if typing a new tag */}
            {search.trim() && !exactMatchExists && canAddMore && (
              <button
                type="button"
                onClick={() => handleCreateNewTag(search.trim())}
                disabled={isCreating}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left bg-surface-muted/50 hover:bg-surface-muted transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isCreating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-foreground shrink-0" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-foreground shrink-0" />
                  )}
                  <span className="font-mono text-xs text-foreground truncate">
                    Buat tag baru: <strong>&ldquo;#{search.trim().replace(/^#+/, '')}&rdquo;</strong>
                  </span>
                </div>
                <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 border border-border text-muted shrink-0">
                  Enter ↵
                </span>
              </button>
            )}

            {filteredTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag)}
                disabled={!canAddMore}
                className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-40"
              >
                <div className="flex items-center gap-2">
                  <Hash className="w-3 h-3 text-muted shrink-0" />
                  <span className="font-mono text-xs text-foreground">{tag.name}</span>
                </div>
                <span className="font-mono text-[9px] uppercase text-muted hover:text-foreground">Pilih ↵</span>
              </button>
            ))}

            {filteredTags.length === 0 && !search.trim() && (
              <p className="px-3 py-3 text-[11px] font-mono text-muted text-center">
                Semua tag standar sudah dipilih. Ketik untuk membuat tag baru.
              </p>
            )}

            {filteredTags.length === 0 && search.trim() && exactMatchExists && (
              <p className="px-3 py-3 text-[11px] font-mono text-muted text-center">
                Tag ini sudah terdaftar atau sudah Anda pilih.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Guidance Note (Minimalist & Clean) ── */}
      <div className="flex items-center justify-between font-mono text-[10px] text-muted tracking-tight">
        <span>Ketik kata kunci bebas lalu tekan Enter untuk menyematkan (maksimal {maxTags} tag).</span>
        {isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-muted hover:text-foreground underline cursor-pointer"
          >
            Tutup Rekomendasi
          </button>
        )}
      </div>
    </div>
  );
}
