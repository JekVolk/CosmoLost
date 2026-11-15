import { Box, Text } from '@chakra-ui/react';
import type React from 'react';
import { useRef, useState } from 'react';
import type { GeoCoordinates } from '../model/useAstroGuessr';

interface SurfaceMapProps {
  mapUrl?: string;
  planet?: string;
  pin: GeoCoordinates | null;
  onPinChange: (coords: GeoCoordinates) => void;
  disabled?: boolean;
}

export const SurfaceMap: React.FC<SurfaceMapProps> = ({
  mapUrl,
  planet = 'MARS',
  pin,
  onPinChange,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert pixel to Equirectangular Lat/Lon:
    // Longitude: -180 to +180
    // Latitude: -90 to +90 (90 at top, -90 at bottom)
    const lon = Math.round(((x / rect.width) * 360 - 180) * 1000) / 1000;
    const lat = Math.round((90 - (y / rect.height) * 180) * 1000) / 1000;

    onPinChange({ lat, lon });
  };

  // Convert lat/lon back to percentage for pin placement
  const pinLeft = pin ? `${((pin.lon + 180) / 360) * 100}%` : '50%';
  const pinTop = pin ? `${((90 - pin.lat) / 180) * 100}%` : '50%';

  const isMars = planet.toUpperCase().includes('MARS');
  const effectiveMapUrl =
    mapUrl ||
    (isMars ? '/assets/3d/planets/mars_diffuse_2k.jpg' : '/assets/3d/planets/moon_diffuse_2k.jpg');

  return (
    <Box
      as="section"
      ref={containerRef}
      position="relative"
      w="100%"
      h="360px"
      bg={isMars ? '#2A1810' : '#1A202C'}
      borderRadius="xl"
      overflow="hidden"
      border="1px solid"
      borderColor={isMars ? 'orange.800' : 'gray.700'}
      cursor={disabled ? 'not-allowed' : 'crosshair'}
      onClick={handleClick}
      boxShadow="inset 0 0 40px rgba(0, 0, 0, 0.7)"
      aria-label="2D інтерактивна карта поверхні"
    >
      {/* Real NASA Map Image or Graceful Fallback Grid */}
      {effectiveMapUrl && !imageError ? (
        <img
          src={effectiveMapUrl}
          alt={`${planet} Surface Map`}
          onError={() => setImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
      ) : (
        /* Graceful SVG Surface Grid Fallback */
        <Box
          position="absolute"
          inset={0}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          pointerEvents="none"
        >
          <svg
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: 'absolute', inset: 0, opacity: 0.35 }}
            aria-hidden="true"
          >
            <defs>
              <pattern id="grid-pattern" width="60" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 60 0 L 0 0 0 40"
                  fill="none"
                  stroke={isMars ? '#E28743' : '#A0AEC0'}
                  strokeWidth="0.8"
                  strokeDasharray="2,2"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            {/* Equator */}
            <line
              x1="0"
              y1="50%"
              x2="100%"
              y2="50%"
              stroke={isMars ? '#DD6B20' : '#63B3ED'}
              strokeWidth="1.5"
            />
            {/* Prime Meridian */}
            <line
              x1="50%"
              y1="0"
              x2="50%"
              y2="100%"
              stroke={isMars ? '#DD6B20' : '#63B3ED'}
              strokeWidth="1.5"
            />
          </svg>

          <Box
            p={3}
            bg="rgba(0, 0, 0, 0.65)"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.800"
            textAlign="center"
            zIndex={2}
          >
            <Text fontSize="xs" fontWeight="bold" color={isMars ? 'orange.300' : 'blue.300'}>
              {planet.toUpperCase()} CARTA (2D NASA PROJECTION)
            </Text>
            <Text fontSize="2xs" color="gray.400">
              Екватор (0°) та нульовий меридіан (0°) позначено осями. Клікніть для постановки піна.
            </Text>
          </Box>
        </Box>
      )}

      {/* Coordinate HUD in bottom corner */}
      <Box
        position="absolute"
        bottom={2}
        left={2}
        bg="rgba(0, 0, 0, 0.75)"
        px={2.5}
        py={1}
        borderRadius="md"
        border="1px solid"
        borderColor="gray.800"
        pointerEvents="none"
      >
        <Text fontSize="2xs" color="gray.300" fontFamily="monospace">
          {pin
            ? `PIN: ${pin.lat.toFixed(2)}° N/S, ${pin.lon.toFixed(2)}° E/W`
            : 'КЛІКНІТЬ НА КАРТУ ДЛЯ ВИБОРУ МІСЦЯ'}
        </Text>
      </Box>

      {/* Render Pin Marker */}
      {pin && (
        <Box
          position="absolute"
          left={pinLeft}
          top={pinTop}
          transform="translate(-50%, -100%)"
          pointerEvents="none"
          zIndex={10}
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          {/* Animated pin beacon */}
          <Box w="24px" h="24px" display="flex" alignItems="center" justifyContent="center">
            <svg
              width="24"
              height="28"
              viewBox="0 0 24 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12 0C5.37258 0 0 5.37258 0 12C0 20.25 12 28 12 28C12 28 24 20.25 24 12C24 5.37258 18.6274 0 12 0Z"
                fill="#E53E3E"
              />
              <circle cx="12" cy="11" r="5" fill="#FFFFFF" />
            </svg>
          </Box>
        </Box>
      )}
    </Box>
  );
};
