'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  username?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  className?: string;
  linkToProfile?: boolean;
  priority?: boolean;
}

const SIZE_MAP = {
  xs: { box: 'w-6 h-6', text: 'text-[9px]', icon: 'w-3 h-3' },
  sm: { box: 'w-9 h-9', text: 'text-xs', icon: 'w-4 h-4' },
  md: { box: 'w-11 h-11', text: 'text-sm', icon: 'w-5 h-5' },
  lg: { box: 'w-14 h-14', text: 'text-base', icon: 'w-6 h-6' },
  xl: { box: 'w-20 h-20', text: 'text-2xl', icon: 'w-8 h-8' },
  '2xl': { box: 'w-24 h-24 sm:w-28 sm:h-28', text: 'text-3xl sm:text-4xl', icon: 'w-10 h-10' },
};

/**
 * Extract 2-letter monogram from user's full name.
 * e.g. "Larasati Suluh" -> "LS", "Arga" -> "AR", null -> "PJ"
 */
export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return 'PJ';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserAvatar({
  src,
  name,
  username,
  size = 'md',
  shape = 'circle',
  className,
  linkToProfile = false,
}: UserAvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const initials = React.useMemo(() => getInitials(name), [name]);
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;

  // Reset error when src changes
  React.useEffect(() => {
    setImageError(false);
  }, [src]);

  const avatarContent = (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden flex items-center justify-center select-none font-serif font-bold transition-all duration-150',
        sizeConfig.box,
        shape === 'circle' ? 'rounded-full' : 'rounded-sm',
        'border-2 border-foreground/80 bg-surface shadow-xs text-foreground',
        className
      )}
    >
      {src && !imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name || username || 'Avatar'}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span
          className={cn(
            'tracking-wider font-mono font-bold uppercase flex items-center justify-center w-full h-full bg-surface-muted text-foreground',
            sizeConfig.text
          )}
          title={name || username || 'Pengguna Perpusjal'}
        >
          {initials}
        </span>
      )}
    </div>
  );

  if (linkToProfile && username) {
    return (
      <Link
        href={`/warga/${username}`}
        className="inline-block transition-transform duration-150 hover:scale-105 hover:opacity-95 focus:outline-none"
        title={`Buka profil ${name || `@${username}`}`}
        onClick={(e) => e.stopPropagation()}
      >
        {avatarContent}
      </Link>
    );
  }

  return avatarContent;
}
