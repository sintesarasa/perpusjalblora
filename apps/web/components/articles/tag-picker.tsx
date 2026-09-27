'use client';

import * as React from 'react';
import { X, Hash, ChevronDown, Plus, Sparkles, Loader2 } from 'lucide-react';
import { ArticleTag } from '@perpusjal/types';
import { apiClient } from '@/lib/api';

const POPULAR_SUGGESTED_TAGS = [
  'alun-alun',
  'pramoedya',
  'sedulur-sikep',
  'relawan',
  'hutan-jati',
  'barongan',
  'ruang-terbuka',
];

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
    } else if (selectedIds.length < maxTags) {
      onChange([...selectedIds, tag.id]);
      setSearch('');
      setErrorMsg(null);
    }
  };

  const removeTag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((sid) => sid !== id));
  };

  const handleCreateNewTag = async (tagName: string) => {
    const clean = tagName.trim().replace(/^#+/, '');
    if (!clean || selectedIds.length >= maxTags || isCreating) return;

    // Check if already in allTags
    const existing = allTags.find(
      (t) => t.name.toLowerCase() === clean.toLowerCase() || t.slug === clean.toLowerCase()
    );

    if (existing) {
      if (!selectedIds.includes(existing.id)) {
        onChange([...selectedIds, existing.id]);
      }
      setSearch('');
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

  const handleQuickAdd = async (tagName: string) => {
    const existing = allTags.find(
      (t) => t.slug === tagName || t.name.toLowerCase() === tagName.toLowerCase()
    );
    if (existing) {
      if (!selectedIds.includes(existing.id) && selectedIds.length < maxTags) {
        onChange([...selectedIds, existing.id]);
      }
    } else {
      await handleCreateNewTag(tagName);
    }
  };

  const canAddMore = selectedIds.length < maxTags;

  return (
    <div ref={dropdownRef} className="space-y-2">
      {/* ── Main Tag Input / Badges Display Container ── */}
      <div
        onClick={() => {
          if (canAddMore || isOpen) {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className={`
          min-h-[46px] px-3 py-2 border flex flex-wrap items-center gap-2 cursor-pointer transition-colors
          ${isOpen ? 'border-foreground ring-1 ring-foreground' : 'border-border hover:border-foreground'}
          bg-background
        `}
      >
        {/* Selected Tag Badges */}
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-foreground text-background font-mono text-[10px] uppercase tracking-wider select-none"
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
              setSearch(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedTags.length === 0
                ? 'Pilih atau ketik tag lalu tekan Enter...'
                : 'Tambah tag...'
            }
            className="flex-1 min-w-[140px] bg-transparent font-sans text-xs text-foreground placeholder:text-muted/40 focus:outline-none py-1"
          />
        )}

        {/* Quota indicator */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <span
            className={`font-mono text-[10px] uppercase tracking-wider ${
              selectedIds.length >= maxTags ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-muted'
            }`}
          >
            {selectedIds.length}/{maxTags} Tag
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* ── Dropdown Suggestions ── */}
      {isOpen && (
        <div className="border border-foreground bg-surface shadow-xl max-h-60 overflow-hidden flex flex-col z-50">
          {errorMsg && (
            <div className="px-3 py-1.5 bg-destructive/10 text-destructive text-[11px] font-sans">
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
                <span className="font-mono text-[9px] uppercase text-muted">Pilih</span>
              </button>
            ))}

            {filteredTags.length === 0 && !search.trim() && (
              <p className="px-3 py-3 text-[11px] font-mono text-muted text-center">
                Semua tag standar sudah dipilih. Ketik untuk membuat tag baru.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Quick-Click Recommendations (Mobile-Ready) ── */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 select-none">
        <span className="font-mono text-[9px] uppercase tracking-wider text-muted flex items-center gap-1 mr-1">
          <Sparkles className="w-2.5 h-2.5" />
          Rekomendasi Cepat:
        </span>
        {POPULAR_SUGGESTED_TAGS.map((name) => {
          const matchedTag = allTags.find(
            (t) => t.slug === name || t.name.toLowerCase() === name.toLowerCase()
          );
          const isSelected = matchedTag && selectedIds.includes(matchedTag.id);

          if (isSelected) return null;

          return (
            <button
              key={name}
              type="button"
              onClick={() => handleQuickAdd(name)}
              disabled={!canAddMore || isCreating}
              className="inline-flex items-center gap-1 px-2 py-0.5 border border-border bg-background hover:border-foreground font-mono text-[10px] text-muted hover:text-foreground transition-colors disabled:opacity-30 cursor-pointer"
              title={`Klik untuk menambahkan #${name}`}
            >
              <span>+ #{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
