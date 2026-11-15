import type { SpaceArtifact } from '../../../entities/planet/model/types';

export interface AstroGuessrRound {
  id: string;
  artifact: SpaceArtifact;
  planetId: 'mars' | 'moon';
  panoramaUrl: string;
  caption: string;
  credit: string;
  trueCoordinates: {
    lat: number;
    lon: number;
    locationName: string;
  };
  clue?: string;
}

export interface GuessResult {
  guessLat: number;
  guessLon: number;
  distanceKm: number;
  score: number;
  ratingBadge: string;
  ratingFeedback: string;
}

export type GamePhase = 'exploring' | 'guessing' | 'revealed' | 'gameover';
