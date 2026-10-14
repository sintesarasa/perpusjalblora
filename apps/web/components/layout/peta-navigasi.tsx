'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface PetaNavigasiItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface PetaNavigasiProps {
  items: PetaNavigasiItem[];
  badge?: React.ReactNode;
  className?: string;
}

/**
 * PetaNavigasi (Uniform Stark Monochrome Breadcrumb Trail)
 * Digunakan secara konsisten pada seluruh halaman Dasbor Anggota dan Meja Pengurus (Admin).
 */
export function PetaNavigasi({ items, badge, className }: PetaNavigasiProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Peta Navigasi"
      className={cn(
        'flex flex-wrap items-center gap-1.5 font-mono text-[10px] sm:text-xs text-muted uppercase tracking-wider',
        className
      )}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const Icon = item.icon;

        return (
          <React.Fragment key={`${item.label}-${idx}`}>
            {idx > 0 && (
              <span
                className="text-border-hairline select-none font-sans text-xs px-0.5"
                aria-hidden="true"
              >
                /
              </span>
            )}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors inline-flex items-center gap-1 hover:underline"
              >
                {Icon && <Icon className="w-3 h-3 text-muted shrink-0" />}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span
                className={cn(
                  'inline-flex items-center gap-1',
                  isLast ? 'text-foreground font-bold' : 'text-muted'
                )}
                aria-current={isLast ? 'page' : undefined}
              >
                {Icon && (
                  <Icon
                    className={cn('w-3 h-3 shrink-0', isLast ? 'text-foreground' : 'text-muted')}
                  />
                )}
                <span>{item.label}</span>
              </span>
            )}
          </React.Fragment>
        );
      })}
      {badge && <span className="ml-1 inline-flex items-center">{badge}</span>}
    </nav>
  );
}
