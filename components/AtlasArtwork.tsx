'use client';
import { useState } from 'react';
import { artwork } from '@/lib/media';
import ArtworkImage from './ArtworkImage';
export default function AtlasArtwork() {
  const [room, setRoom] = useState<'present' | 'possible'>('present');
  return <section className="atlas-artwork" aria-label="Atlas gallery artwork"><div className="gallery-room-buttons" role="group" aria-label="Choose a gallery room"><button aria-pressed={room === 'present'} onClick={() => setRoom('present')}>The Present</button><button aria-pressed={room === 'possible'} onClick={() => setRoom('possible')}>The Possible</button><span>RUNWAY ARTWORK</span></div><div className="gallery-room-image"><ArtworkImage key={room} art={artwork[room]} sizes="(max-width: 800px) 90vw, 700px" /></div><p className="fine-print">An imagined space for inquiry. The artwork is not documentary evidence.</p></section>;
}
