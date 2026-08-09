export const COLOR_PRESETS: string[] = [
  '#f0f4f8',
  '#111827',
  '#1e3a8a',
  '#14532d',
  '#581c87',
  '#7f1d1d'
];

export interface ImagePreset {
  id: string;
  label: string;
  url: string;
}

export const IMAGE_PRESETS: ImagePreset[] = [
  { id: 'mountains', label: 'Mountains', url: 'https://picsum.photos/seed/mountains/1920/1080' },
  { id: 'ocean', label: 'Ocean', url: 'https://picsum.photos/seed/ocean/1920/1080' },
  { id: 'forest', label: 'Forest', url: 'https://picsum.photos/seed/forest/1920/1080' },
  { id: 'city', label: 'City', url: 'https://picsum.photos/seed/city/1920/1080' },
  { id: 'abstract', label: 'Abstract', url: 'https://picsum.photos/seed/abstract/1920/1080' }
];

export function randomImageUrl(): string {
  return `https://picsum.photos/seed/${Date.now()}/1920/1080`;
}
