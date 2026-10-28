// Original Runway uploads are preserved byte-for-byte; see public/assets/lbb/manifest.json.
export interface Artwork { src: string; width: number; height: number; alt: string; }
export const artwork = {
  hero: { src: '/assets/lbb/images/butterfly-notebook.png', width: 2560, height: 1440, alt: 'A golden butterfly above an open notebook in a teal, glass, and marble gallery.' },
  cart: { src: '/assets/lbb/images/exhibit-cart.png', width: 2560, height: 2560, alt: 'The Exhibit Cart: a small teal-and-brass trolley carrying notebook pages.' },
  present: { src: '/assets/lbb/images/museum-present.png', width: 2560, height: 1440, alt: 'The Present gallery: an open book within golden orbital rings under a glass ceiling.' },
  possible: { src: '/assets/lbb/images/museum-possible.png', width: 2560, height: 1440, alt: 'The Possible gallery: an open book beneath a suspended glass prism and an expansive sky.' },
  refraction: { src: '/assets/lbb/images/refraction-lab.png', width: 2560, height: 1440, alt: 'The Refraction Lab: a central prism casts light among glass exhibits and an open notebook.' },
  notebook: { src: '/assets/lbb/images/notebook-workspace.png', width: 2560, height: 1440, alt: 'A personal notebook, golden pen, and butterfly on a teal writing desk.' },
} satisfies Record<string, Artwork>;
export const films = { opening: '/assets/lbb/videos/butterfly-opening.mp4', cart: '/assets/lbb/videos/exhibit-cart.mp4' } as const;
