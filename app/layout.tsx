import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'LBB — The Living Notebook', description: 'A conversation with the Exhibit Cart. A notebook for ideas in progress. Optional worlds of language, perception, and judgment.' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}<noscript><main className="noscript-page"><h1>LBB — The Living Notebook</h1><p>This conversational notebook needs JavaScript for chat, local notes, and journeys. Enable JavaScript in the web preview to continue. No account or API key is needed for demo mode.</p></main></noscript></body></html>;
}
