import { Badge, Box, Button, HStack, Text } from '@chakra-ui/react';
import { Eye, Globe2, RotateCw } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { type TerrariumArtifact, usePlanetaryTerrarium } from '../model/usePlanetaryTerrarium';
import { ArtifactCard } from './ArtifactCard';
import { createArtifactMarkerMesh } from './ArtifactMarker';

export interface PlanetaryTerrariumProps {
  artifacts?: TerrariumArtifact[];
  initialPlanet?: 'mars' | 'moon';
  height?: string | number;
}

const DEFAULT_ARTIFACTS: TerrariumArtifact[] = [
  {
    id: 'perseverance',
    name: 'Perseverance Rover',
    equipment_class: 'Exploration Rover',
    rarity: 'HISTORIC',
    latitude: 18.38,
    longitude: 77.58,
    first_person_monologue:
      'I drill into Jezero crater seeking ancient biosignatures, caching humankind memories in titanium tubes.',
    cause_of_deactivation: 'Active operational mission.',
  },
  {
    id: 'opportunity',
    name: 'Opportunity (MER-B)',
    equipment_class: 'Exploration Rover',
    rarity: 'HISTORIC',
    latitude: -1.94,
    longitude: 354.47,
    first_person_monologue:
      'My battery is low and it is getting dark. After 5,111 sols in Perseverance Valley, I sleep.',
    cause_of_deactivation: 'Global dust storm depleted solar arrays in 2018.',
  },
  {
    id: 'curiosity',
    name: 'Curiosity Rover',
    equipment_class: 'Exploration Rover',
    rarity: 'AUTONOMOUS',
    latitude: -4.58,
    longitude: 137.44,
    first_person_monologue:
      'Climbing Mount Sharp sol after sol, analyzing powdered mudstones of Gale crater.',
    cause_of_deactivation: 'Active operational mission.',
  },
];

export const PlanetaryTerrarium: React.FC<PlanetaryTerrariumProps> = ({
  artifacts = DEFAULT_ARTIFACTS,
  initialPlanet = 'mars',
  height = '500px',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [currentPlanet, setCurrentPlanet] = useState<'mars' | 'moon'>(initialPlanet);
  const [autoRotate, setAutoRotate] = useState(true);

  const { selectedArtifact, setSelectedArtifact } = usePlanetaryTerrarium();

  const planetRadius = 2.0;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const heightPx = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070a13);

    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 0.1, 1000);
    camera.position.set(0, 0, 5.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Planet procedural sphere
    const isMars = currentPlanet === 'mars';
    const planetColor = isMars ? 0xc1440e : 0x888c94;
    const emissiveColor = isMars ? 0x2d0d02 : 0x111116;

    const planetGeo = new THREE.SphereGeometry(planetRadius, 64, 64);
    const planetMat = new THREE.MeshStandardMaterial({
      color: planetColor,
      roughness: 0.8,
      metalness: 0.1,
      emissive: emissiveColor,
      emissiveIntensity: 0.2,
    });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    scene.add(planetMesh);

    // Subtle atmospheric glow ring
    const atmosphereGeo = new THREE.SphereGeometry(planetRadius * 1.025, 32, 32);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: isMars ? 0xff6633 : 0x00f0ff,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphereMesh);

    // Markers group
    const markersGroup = new THREE.Group();
    scene.add(markersGroup);

    const markerMeshes: THREE.Object3D[] = [];
    for (const art of artifacts) {
      const markerGroup = createArtifactMarkerMesh(art, planetRadius);
      markersGroup.add(markerGroup);
      markerMeshes.push(markerGroup);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const secondaryLight = new THREE.PointLight(0x00f0ff, 1.2, 50);
    secondaryLight.position.set(-6, -3, 3);
    scene.add(secondaryLight);

    // Raycaster for clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markersGroup.children, true);

      if (intersects.length > 0) {
        let current: THREE.Object3D | null = intersects[0].object;
        while (current && !current.userData?.artifact) {
          current = current.parent;
        }
        if (current?.userData?.artifact) {
          setSelectedArtifact(current.userData.artifact as TerrariumArtifact);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    // Simple drag to rotate
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      planetMesh.rotation.y += deltaX * 0.005;
      markersGroup.rotation.y += deltaX * 0.005;
      planetMesh.rotation.x += deltaY * 0.005;
      markersGroup.rotation.x += deltaY * 0.005;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (autoRotate && !isDragging) {
        planetMesh.rotation.y += 0.0015;
        markersGroup.rotation.y += 0.0015;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);

      planetGeo.dispose();
      planetMat.dispose();
      atmosphereGeo.dispose();
      atmosphereMat.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [currentPlanet, artifacts, autoRotate, setSelectedArtifact]);

  return (
    <Box
      w="100%"
      h={height}
      position="relative"
      borderRadius="xl"
      overflow="hidden"
      borderWidth="1px"
      borderColor="whiteAlpha.100"
      bg="#070A13"
    >
      {/* 3D Canvas Container */}
      <Box ref={mountRef} w="100%" h="100%" />

      {/* Top HUD Controls */}
      <Box
        position="absolute"
        top={4}
        left={4}
        right={4}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        pointerEvents="none"
      >
        <HStack gap={2} pointerEvents="auto">
          <Badge
            colorPalette={currentPlanet === 'mars' ? 'orange' : 'gray'}
            variant="solid"
            px={3}
            py={1}
            borderRadius="md"
          >
            <HStack gap={1}>
              <Globe2 size={13} />
              <Text fontWeight="bold">
                {currentPlanet === 'mars' ? 'Mars Terrarium' : 'Moon Terrarium'}
              </Text>
            </HStack>
          </Badge>
          <Badge colorPalette="cyan" variant="outline" size="xs">
            {artifacts.length} ARTIFACTS PLACED
          </Badge>
        </HStack>

        <HStack gap={2} pointerEvents="auto">
          <Button
            size="xs"
            colorPalette={currentPlanet === 'mars' ? 'orange' : 'gray'}
            variant={currentPlanet === 'mars' ? 'solid' : 'outline'}
            onClick={() => setCurrentPlanet('mars')}
          >
            Mars
          </Button>
          <Button
            size="xs"
            colorPalette={currentPlanet === 'moon' ? 'gray' : 'cyan'}
            variant={currentPlanet === 'moon' ? 'solid' : 'outline'}
            onClick={() => setCurrentPlanet('moon')}
          >
            Moon
          </Button>
          <Button
            size="xs"
            variant="outline"
            colorPalette={autoRotate ? 'cyan' : 'gray'}
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle Auto Rotation"
          >
            <RotateCw size={13} />
          </Button>
        </HStack>
      </Box>

      {/* Bottom Hint */}
      <Box position="absolute" bottom={4} left={4} pointerEvents="none">
        <HStack
          gap={2}
          bg="blackAlpha.600"
          backdropFilter="blur(4px)"
          px={3}
          py={1.5}
          borderRadius="md"
          borderWidth="1px"
          borderColor="whiteAlpha.100"
        >
          <Eye size={13} color="#00F0FF" />
          <Text fontSize="xs" color="gray.300">
            Click any glowing telemetry marker to examine artifact dossier
          </Text>
        </HStack>
      </Box>

      {/* Artifact Dossier Modal */}
      <ArtifactCard artifact={selectedArtifact} onClose={() => setSelectedArtifact(null)} />
    </Box>
  );
};
