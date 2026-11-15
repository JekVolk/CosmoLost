import { Badge, Box, HStack, Text } from '@chakra-ui/react';
import type React from 'react';
import * as THREE from 'three';
import type { TerrariumArtifact } from '../model/usePlanetaryTerrarium';

export function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

export function createArtifactMarkerMesh(
  artifact: TerrariumArtifact,
  planetRadius: number,
): THREE.Group {
  const group = new THREE.Group();
  group.name = `marker-${artifact.id}`;
  group.userData = { artifact };

  const position = latLonToVector3(artifact.latitude, artifact.longitude, planetRadius);
  group.position.copy(position);

  // Fallback 3D sphere marker (procedural geometric fallback per FE-11.3)
  const sphereGeo = new THREE.SphereGeometry(0.08, 16, 16);
  let color = 0x00f0ff;
  if (artifact.rarity === 'HISTORIC') color = 0xd69e2e;
  else if (artifact.rarity === 'ANOMALY') color = 0xe53e3e;
  else if (artifact.rarity === 'AUTONOMOUS') color = 0x805ad5;
  else if (artifact.rarity === 'SPECIALIZED') color = 0x38a169;

  const sphereMat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.8,
  });

  const markerSphere = new THREE.Mesh(sphereGeo, sphereMat);
  markerSphere.userData = { artifact };
  group.add(markerSphere);

  // Outer beacon pulse ring
  const ringGeo = new THREE.RingGeometry(0.1, 0.14, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.lookAt(position.clone().multiplyScalar(2));
  ring.userData = { artifact };
  group.add(ring);

  return group;
}

export interface ArtifactMarkerProps {
  artifact: TerrariumArtifact;
  onClick?: () => void;
}

export const ArtifactMarker: React.FC<ArtifactMarkerProps> = ({ artifact, onClick }) => {
  return (
    <Box
      cursor="pointer"
      onClick={onClick}
      p={1}
      bg="rgba(11, 15, 25, 0.85)"
      borderWidth="1px"
      borderColor="cyan.500"
      borderRadius="md"
      _hover={{ borderColor: 'cyan.300', transform: 'scale(1.05)' }}
      transition="all 0.15s ease"
    >
      <HStack gap={1}>
        <Box w="8px" h="8px" borderRadius="full" bg="cyan.400" />
        <Text fontSize="xs" fontWeight="bold" color="white">
          {artifact.name}
        </Text>
        <Badge size="xs" colorPalette="gray">
          Fallback 3D
        </Badge>
      </HStack>
    </Box>
  );
};
