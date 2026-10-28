'use client';
import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import ArtworkImage from './ArtworkImage';
import type { Artwork } from '@/lib/media';

// Media never gates the composer, notebook, or a journey. Only one silent play-through.
export default function MotionArtwork({ src, poster, label, autoplay = false, portrait = false }: { src: string; poster: Artwork; label: string; autoplay?: boolean; portrait?: boolean }) {
  const container = useRef<HTMLDivElement>(null); const video = useRef<HTMLVideoElement>(null); const autoStarted = useRef(false);
  const [reduced, setReduced] = useState(true); const [visible, setVisible] = useState(false);
  const [requested, setRequested] = useState(false); const [playing, setPlaying] = useState(false);
  const [hasFrame, setHasFrame] = useState(false); const [ended, setEnded] = useState(false); const [failed, setFailed] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)'); setReduced(query.matches);
    const change = () => { setReduced(query.matches); if (query.matches) { video.current?.pause(); setRequested(false); setHasFrame(false); setPlaying(false); } };
    query.addEventListener('change', change);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.15 });
    if (container.current) observer.observe(container.current);
    return () => { query.removeEventListener('change', change); observer.disconnect(); };
  }, []);
  useEffect(() => { if (autoplay && !reduced && visible && !autoStarted.current) { autoStarted.current = true; setRequested(true); } }, [autoplay, reduced, visible]);
  useEffect(() => { if (!visible) video.current?.pause(); }, [visible]);
  useEffect(() => { if (requested && !failed) { video.current?.play().catch(() => setPlaying(false)); } }, [requested, failed]);
  function toggle() {
    if (playing) { video.current?.pause(); return; }
    if (failed) { setFailed(false); setHasFrame(false); }
    if (!requested) { setRequested(true); return; }
    if (video.current) { if (ended) { video.current.currentTime = 0; setEnded(false); } video.current.play().catch(() => setPlaying(false)); }
  }
  const action = failed ? 'Retry' : playing ? 'Pause' : ended ? 'Replay' : 'Play';
  return <div ref={container} className={`motion-artwork ${portrait ? 'portrait-motion' : 'opening-motion'}`} data-motion-preference={reduced ? 'reduced' : 'normal'} aria-label={label} role="group">
    <ArtworkImage art={poster} sizes={portrait ? '96px' : '(max-width: 800px) 90vw, 580px'} eager={!portrait} />
    {requested && !failed && <video ref={video} src={src} muted playsInline preload="none" tabIndex={-1} aria-hidden="true" className={hasFrame ? 'has-frame' : ''} onPlaying={() => { setPlaying(true); setHasFrame(true); }} onPause={() => setPlaying(false)} onEnded={() => { setPlaying(false); setEnded(true); }} onError={() => { setFailed(true); setPlaying(false); setHasFrame(false); }} />}
    <button className="motion-control" aria-label={`${action} ${label}`} onClick={toggle}>{playing ? <Pause size={13} aria-hidden="true" /> : ended ? <RotateCcw size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}<span>{action}</span></button>
    {!portrait && <span className="motion-caption">{failed ? 'Animation unavailable · still artwork shown' : 'A beginning, in motion.'}</span>}
  </div>;
}
