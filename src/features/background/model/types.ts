export type BackgroundType = 'color' | 'image';

export interface BackgroundState {
  type: BackgroundType;
  color: string;
  imageUrl: string;
}
