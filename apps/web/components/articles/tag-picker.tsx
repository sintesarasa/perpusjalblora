'use client';

import * as React from 'react';
import { X, Hash, ChevronDown } from 'lucide-react';
import { ArticleTag } from '@perpusjal/types';

interface TagPickerProps {
  tags: ArticleTag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  maxTags?: number;
}

export function TagPicker({ tags, selectedIds, onChange, maxTags = 5 }: TagPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selectedTags = tags.filter((t) => selectedIds.includes(t.id));
  const filteredTags = tags.filter(
    (t) =>
      !selectedIds.includes(t.id) &&
      t.name.toLowerCase().includes(search.toLowerCase())
  );

  // Close on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
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
    }
  };

  const removeTag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((sid) => sid !== id));
  };

  const canAddMore = selectedIds.length < maxTags;

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger / Tag Display */}
      <div
        onClick={() => {
          if (canAddMore || isOpen) {
            setIsOpen(!isOpen);
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className={`
          min-h-[44px] sm:min-h-[40px] px-2.5 py-1.5 border flex flex-wrap items-center gap-1.5 cursor-pointer transition-colors
          ${isOpen ? 'border-foreground' : 'border-border hover:border-foreground/60'}
          bg-surface
        `}
      >
        {/* Selected Tag Badges */}
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-foreground text-background font-mono text-[10px] uppercase tracking-wider"
          >
            <Hash className="w-2.5 h-2.5" />
            {tag.name}
            <button
              type="button"
              onClick={(e) => removeTag(tag.id, e)}
              className="ml-0.5 hover:opacity-70 transition-opacity"
              aria-label={`Hapus tag ${tag.name}`}
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}

        {/* Placeholder when empty */}
        {selectedTags.length === 0 && !isOpen && (
          <span className="font-sans text-sm sm:text-xs text-muted/60">
            Pilih tag topik...
          </span>
        )}

        {/* Count indicator when full */}
        {!canAddMore && (
          <span className="font-mono text-[10px] text-muted ml-auto">
            {maxTags}/{maxTags}
          </span>
        )}

        {canAddMore && (
          <ChevronDown
            className={`w-3.5 h-3.5 text-muted ml-auto shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 border border-foreground bg-surface shadow-lg mt-0.5 max-h-56 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="px-2.5 py-2 border-b border-border-hairline">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari tag..."
              className="w-full bg-transparent font-sans text-sm sm:text-xs text-foreground placeholder:text-muted/50 focus:outline-none"
            />
          </div>

          {/* Tag List */}
          <div className="overflow-y-auto flex-1">
            {filteredTags.length === 0 && (
              <p className="px-3 py-3 text-[10px] font-mono text-muted uppercase text-center">
                {search ? 'Tag tidak ditemukan' : 'Semua tag sudah dipilih'}
              </p>
            )}
            {filteredTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag)}
                disabled={!canAddMore}
                className="w-full flex items-center gap-2 px-3 py-2.5 sm:py-2 text-left hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Hash className="w-3 h-3 text-muted shrink-0" />
                <span className="font-mono text-xs text-foreground">{tag.name}</span>
              </button>
            ))}
          </div>

          {/* Footer */}
          {selectedIds.length > 0 && (
            <div className="px-3 py-1.5 border-t border-border-hairline bg-surface-muted/30">
              <span className="font-mono text-[9px] text-muted uppercase">
                {selectedIds.length}/{maxTags} tag dipilih
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
