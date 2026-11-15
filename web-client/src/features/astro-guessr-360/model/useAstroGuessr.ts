import { useState, useEffect, useCallback, useMemo } from 'react';
import { portalApi, apiArtifactSummaryToSpaceArtifact } from '../../../shared/api/portalApi';
import { haversineDistance, calculateAstroGuessrScore } from '../../../shared/lib/coordinates';
import type { AstroGuessrRound, GuessResult, GamePhase } from './types';

export const STATIC_ROUNDS: AstroGuessrRound[] = [
  {
    id: 'round-oppy',
    planetId: 'mars',
    artifact: {
      id: 'opportunity-rover',
      name: 'Opportunity Rover (MER-B)',
      mission: 'Mars Exploration Rover B',
      agency: 'NASA',
      country: 'USA',
      type: 'rover',
      status: 'silent',
      operationalStatus: 'DORMANT',
      statusLabel: 'Dormant',
      lat: -1.9462,
      lon: -5.5266,
      locationName: 'Perseverance Valley, Endeavour Crater',
      landingDate: '2004-01-25',
      brief: 'Longest-operating Mars rover, traveled 45.16 km across Meridiani Planum.',
      description: 'Opportunity explored Meridiani Planum, finding hematite spherules and ancient aqueous signs.',
      whyAbandoned: 'Global 2018 dust storm obscured solar panels.',
      keyFacts: ['Traveled 45.16 km', 'Operating for 14 years, 138 days', 'Discovered Martian blueberries'],
      imageUrl: 'https://images-assets.nasa.gov/image/PIA20285/PIA20285~small.jpg',
      badgeColor: '#f97316',
    },
    panoramaUrl: 'https://images-assets.nasa.gov/image/PIA22074/PIA22074~medium.jpg',
    caption: 'View From Within Perseverance Valley on Mars (Overlooking Endeavour Crater)',
    credit: 'NASA/JPL-Caltech/Cornell/ASU',
    trueCoordinates: {
      lat: -1.9462,
      lon: -5.5266,
      locationName: 'Perseverance Valley, Endeavour Crater',
    },
    clue: 'Notice the rocky terraces of an ancient 22 km impact crater rim and dark basaltic sand ripples.',
  },
  {
    id: 'round-spirit',
    planetId: 'mars',
    artifact: {
      id: 'spirit-rover',
      name: 'Spirit Rover (MER-A)',
      mission: 'Mars Exploration Rover A',
      agency: 'NASA',
      country: 'USA',
      type: 'rover',
      status: 'silent',
      operationalStatus: 'DORMANT',
      statusLabel: 'Dormant',
      lat: -14.5684,
      lon: 175.4726,
      locationName: 'Troy, West of Home Plate, Gusev Crater',
      landingDate: '2004-01-04',
      brief: 'Twin sister to Opportunity, conquered Husband Hill before resting at Troy.',
      description: 'Spirit discovered pure hydrothermal silica deposits in Gusev Crater before becoming stuck in soft soil.',
      whyAbandoned: 'Stuck in soft soil; winter sun angle did not suffice for battery recharge.',
      keyFacts: ['Traveled 7.73 km in Gusev Crater', 'Discovered hydrothermal silica deposits', 'First rover to climb a martian hill'],
      imageUrl: 'https://images-assets.nasa.gov/image/PIA07075/PIA07075~small.jpg',
      badgeColor: '#f97316',
    },
    panoramaUrl: 'https://images-assets.nasa.gov/image/PIA16440/PIA16440~medium.jpg',
    caption: 'Spirit Mars Rover 360-Degree McMurdo Panorama from Husband Hill Summit',
    credit: 'NASA/JPL-Caltech/Cornell',
    trueCoordinates: {
      lat: -14.5684,
      lon: 175.4726,
      locationName: 'Gusev Crater, Columbia Hills',
    },
    clue: 'Look for the Columbia Hills summits and hydrothermal volcanic plateaus stretching towards the horizon.',
  },
  {
    id: 'round-apollo11',
    planetId: 'moon',
    artifact: {
      id: 'apollo-11-descent-stage',
      name: 'Apollo 11 Lunar Module Descent Stage (Eagle)',
      mission: 'Apollo 11',
      agency: 'NASA',
      country: 'USA',
      type: 'descent_stage',
      status: 'historic',
      operationalStatus: 'PASSIVE_ACTIVE',
      statusLabel: 'Historic Landmark',
      lat: 0.67408,
      lon: 23.47297,
      locationName: 'Statio Tranquillitatis (Tranquility Base)',
      landingDate: '1969-07-20',
      brief: 'The first human landing site on an extraterrestrial body.',
      description: 'Neil Armstrong and Buzz Aldrin spent 21.5 hours on the lunar surface.',
      whyAbandoned: 'Descent stage served as the launch platform for ascent module liftoff.',
      keyFacts: ['First human landing site', 'Statio Tranquillitatis', 'Left golden olive branch and plaque'],
      imageUrl: 'https://images-assets.nasa.gov/image/KSC-as11-40-5964/KSC-as11-40-5964~medium.jpg',
      badgeColor: '#38bdf8',
    },
    panoramaUrl: 'https://images-assets.nasa.gov/image/6900957/6900957~medium.jpg',
    caption: 'Tranquility Base 360-Degree Panorama, Mare Tranquillitatis',
    credit: 'NASA / Neil Armstrong & Buzz Aldrin Archive',
    trueCoordinates: {
      lat: 0.67408,
      lon: 23.47297,
      locationName: 'Statio Tranquillitatis, Mare Tranquillitatis',
    },
    clue: 'Pitch black sky, powdery lunar regolith, and smooth volcanic basalt mare plains.',
  },
];

export function useAstroGuessr() {
  const [rounds, setRounds] = useState<AstroGuessrRound[]>(STATIC_ROUNDS);
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [phase, setPhase] = useState<GamePhase>('exploring');
  const [playerPin, setPlayerPin] = useState<{ lat: number; lon: number } | null>(null);
  const [lastResult, setLastResult] = useState<GuessResult | null>(null);
  const [roundScores, setRoundScores] = useState<number[]>([]);

  // Dynamically load additional live panorama media from backend
  useEffect(() => {
    let active = true;

    async function loadLivePanoramas() {
      try {
        const [marsArts, moonArts] = await Promise.all([
          portalApi.listArtifacts({ body: 'mars', limit: 20 }),
          portalApi.listArtifacts({ body: 'moon', limit: 20 }),
        ]);

        if (!active) return;
        const all = [...marsArts.results, ...moonArts.results];

        for (const item of all) {
          const media = await portalApi.getArtifactMedia(item.id);
          const pan = media.find((m) => m.media_category === 'PANORAMA' || m.caption?.includes('360'));
          if (pan && !STATIC_ROUNDS.some((r) => r.artifact.id === item.id)) {
            const planetId: 'mars' | 'moon' = item.celestial_body === 'moon' ? 'moon' : 'mars';
            const mappedArtifact = apiArtifactSummaryToSpaceArtifact(item, planetId);
            const newRound: AstroGuessrRound = {
              id: `round-live-${item.id}`,
              planetId,
              artifact: mappedArtifact,
              panoramaUrl: pan.media_url,
              caption: pan.caption || `${item.name} 360° Panorama`,
              credit: pan.credit || 'NASA Archive',
              trueCoordinates: {
                lat: item.coordinates.latitude,
                lon: item.coordinates.longitude,
                locationName: item.coordinates.location_name,
              },
            };
            setRounds((prev) => [...prev, newRound]);
          }
        }
      } catch {}
    }

    loadLivePanoramas();

    return () => {
      active = false;
    };
  }, []);

  const currentRound = useMemo(() => {
    return rounds[currentRoundIndex] || rounds[0];
  }, [rounds, currentRoundIndex]);

  const totalScore = useMemo(() => {
    return roundScores.reduce((acc, s) => acc + s, 0);
  }, [roundScores]);

  // Handle pin placement on map
  const handleSetPin = useCallback((coords: { lat: number; lon: number }) => {
    if (phase === 'revealed' || phase === 'gameover') return;
    setPlayerPin(coords);
    setPhase('guessing');
  }, [phase]);

  // Confirm guess and evaluate score using Haversine formula
  const handleConfirmGuess = useCallback(() => {
    if (!playerPin || !currentRound) return;

    const radiusKm = currentRound.planetId === 'mars' ? 3389.5 : 1737.4;
    const distanceKm = haversineDistance(
      playerPin.lat,
      playerPin.lon,
      currentRound.trueCoordinates.lat,
      currentRound.trueCoordinates.lon,
      radiusKm
    );

    const score = calculateAstroGuessrScore(distanceKm);

    let ratingBadge = '🎯 PRECISION STRIKE';
    let ratingFeedback = `Exceptional astrometric deduction! Coordinates error only ${distanceKm.toFixed(1)} km!`;

    if (distanceKm > 250) {
      ratingBadge = '🛰️ ORBITAL DEVIATION';
      ratingFeedback = `Estimated sector was off by ${distanceKm.toFixed(1)} km. Better reconnaissance next time!`;
    } else if (distanceKm > 75) {
      ratingBadge = '🔍 REGIONAL SECTOR';
      ratingFeedback = `Good visual identification! Landed within ${distanceKm.toFixed(1)} km of the target.`;
    } else if (distanceKm > 20) {
      ratingBadge = '⚡ CLOSE RECON';
      ratingFeedback = `Impressive crater recognition! Only ${distanceKm.toFixed(1)} km deviation.`;
    }

    const result: GuessResult = {
      guessLat: playerPin.lat,
      guessLon: playerPin.lon,
      distanceKm: Math.round(distanceKm * 10) / 10,
      score,
      ratingBadge,
      ratingFeedback,
    };

    setLastResult(result);
    setRoundScores((prev) => [...prev, score]);
    setPhase('revealed');
  }, [playerPin, currentRound]);

  // Next round
  const handleNextRound = useCallback(() => {
    if (currentRoundIndex + 1 < rounds.length) {
      setCurrentRoundIndex((prev) => prev + 1);
      setPlayerPin(null);
      setLastResult(null);
      setPhase('exploring');
    } else {
      setPhase('gameover');
    }
  }, [currentRoundIndex, rounds.length]);

  // Restart game
  const handleRestart = useCallback(() => {
    setCurrentRoundIndex(0);
    setPlayerPin(null);
    setLastResult(null);
    setRoundScores([]);
    setPhase('exploring');
  }, []);

  return {
    rounds,
    currentRound,
    currentRoundIndex,
    totalRounds: rounds.length,
    phase,
    playerPin,
    lastResult,
    totalScore,
    roundScores,
    setPlayerPin: handleSetPin,
    confirmGuess: handleConfirmGuess,
    nextRound: handleNextRound,
    restartGame: handleRestart,
  };
}
