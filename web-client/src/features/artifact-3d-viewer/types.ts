import type { SpaceArtifact } from '../../entities/planet/model/types';

export interface Model3DViewerProps {
  artifact: SpaceArtifact;
  modelUrl?: string | null;
  themeColor?: string;
}
