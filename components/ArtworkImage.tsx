'use client';
import Image from 'next/image';
import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import type { Artwork } from '@/lib/media';
export default function ArtworkImage({ art, sizes, decorative = false, eager = false, className = '' }: { art: Artwork; sizes: string; decorative?: boolean; eager?: boolean; className?: string }) {
  const [failed, setFailed] = useState(false);
  return <span className={`artwork-image ${className}`}>
    {failed ? <span className="artwork-fallback" role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : art.alt}><BookOpen size={24} aria-hidden="true" /><span>{decorative ? '' : 'Artwork temporarily unavailable'}</span></span> : <Image src={art.src} alt={decorative ? '' : art.alt} fill sizes={sizes} loading={eager ? 'eager' : 'lazy'} onError={() => setFailed(true)} />}
  </span>;
}
