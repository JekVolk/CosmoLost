export type PlanetTheme = 'mars' | 'moon';

export interface PhotosphereViewerProps {
  isOpen?: boolean;
  onClose?: () => void;
  imageUrl: string;
  caption?: string;
  nasaIdOrPia?: string;
  credit?: string;
  planetTheme?: PlanetTheme;
  mode?: 'modal' | 'embedded';
  showHeadingCompass?: boolean;
  showTopHud?: boolean;
  initialFov?: number;
  onHeadingChange?: (headingDeg: number) => void;
}
