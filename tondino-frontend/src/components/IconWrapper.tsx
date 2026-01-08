import React from 'react';
import { mapFaToLucide } from '@/utils/iconMap';

type Props = {
  fa?: string | null;
  name?: string | null;
  className?: string;
  title?: string;
};

export default function IconWrapper({ fa, name, className = '', title }: Props) {
  const resolved = mapFaToLucide(fa || name || null) || name || fa || '';
  // Render a non-breaking wrapper that preserves existing classes/styles.
  // `data-lucide` helps future automated migration to real Lucide components.
  return (
    <i
      aria-hidden={true}
      className={className}
      data-lucide={resolved}
      title={title}
    />
  );
}
