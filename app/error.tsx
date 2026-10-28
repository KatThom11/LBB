'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="recovery-page"><span className="eyebrow">LBB / THE LIVING NOTEBOOK</span><h1>This page needs another moment.</h1><p>Your browser’s saved conversations and notes have not been cleared.</p><button className="button button-dark" onClick={reset}>Try opening the notebook again</button></main>;
}
