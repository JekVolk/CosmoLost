import type { ShowcaseItem } from '@/entities/user';
import { RarityBadge } from '@/shared/ui';
import { Badge, Box, HStack, Text, VStack } from '@chakra-ui/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box as CubeIcon, GripVertical } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export interface ShowcaseSlotProps {
  id: string;
  slotIndex: number;
  item: ShowcaseItem | null;
  isOwner?: boolean;
}

const Micro3DCanvas: React.FC<{ rarity: string }> = ({ rarity }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = 80;
    const height = 80;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 2.8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Procedural fallback 3D mesh
    const geometry = new THREE.IcosahedronGeometry(0.85, 2);

    let color = 0x00f0ff;
    if (rarity === 'HISTORIC') color = 0xd69e2e;
    else if (rarity === 'ANOMALY') color = 0xe53e3e;
    else if (rarity === 'AUTONOMOUS') color = 0x805ad5;
    else if (rarity === 'PROTOTYPE') color = 0x3182ce;
    else if (rarity === 'SPECIALIZED') color = 0x38a169;

    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.35,
      metalness: 0.7,
      wireframe: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const wireMesh = new THREE.Mesh(geometry, wireframeMat);
    wireMesh.scale.setScalar(1.02);
    scene.add(wireMesh);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 2.5);
    pointLight.position.set(2, 2, 3);
    scene.add(pointLight);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      mesh.rotation.y += 0.015;
      mesh.rotation.x += 0.008;
      wireMesh.rotation.y += 0.015;
      wireMesh.rotation.x += 0.008;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      geometry.dispose();
      material.dispose();
      wireframeMat.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [rarity]);

  return (
    <Box
      ref={mountRef}
      w="80px"
      h="80px"
      borderRadius="md"
      overflow="hidden"
      bg="blackAlpha.600"
      borderWidth="1px"
      borderColor="whiteAlpha.100"
      display="flex"
      alignItems="center"
      justifyContent="center"
    />
  );
};

export const ShowcaseSlot: React.FC<ShowcaseSlotProps> = ({
  id,
  slotIndex,
  item,
  isOwner = false,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !isOwner || item === null,
  });

  const [isHovered, setIsHovered] = useState(false);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (!item) {
    return (
      <Box
        ref={setNodeRef}
        style={style}
        w="100%"
        minH="150px"
        borderWidth="1px"
        borderStyle="dashed"
        borderColor="whiteAlpha.200"
        borderRadius="lg"
        bg="rgba(15, 23, 42, 0.4)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <VStack gap={2} align="center">
          <CubeIcon size={22} color="#64748B" />
          <Text fontSize="xs" color="gray.500" textTransform="uppercase">
            Slot {slotIndex + 1}
          </Text>
          <Text fontSize="xs" color="gray.600">
            Empty Showcase Bay
          </Text>
        </VStack>
      </Box>
    );
  }

  const { equipment } = item;

  return (
    <Box
      ref={setNodeRef}
      style={style}
      w="100%"
      minH="150px"
      p={3}
      borderRadius="lg"
      bg="gray.900"
      borderWidth="1px"
      borderColor={isHovered ? 'cyan.500' : 'whiteAlpha.200'}
      boxShadow={isHovered ? '0 0 15px rgba(0, 240, 255, 0.2)' : 'none'}
      position="relative"
      transition="all 0.2s ease"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <HStack justify="space-between" align="flex-start" mb={2}>
        <HStack gap={2}>
          {isOwner && (
            <Box
              {...attributes}
              {...listeners}
              cursor="grab"
              color="gray.400"
              _hover={{ color: 'cyan.300' }}
            >
              <GripVertical size={16} />
            </Box>
          )}
          <Badge size="xs" colorPalette="cyan" variant="subtle">
            #{slotIndex + 1}
          </Badge>
        </HStack>
        <RarityBadge rarity={equipment.rarity} size="xs" />
      </HStack>

      <HStack gap={3} align="center">
        <Micro3DCanvas rarity={equipment.rarity} />
        <VStack align="flex-start" gap={1} flex="1" overflow="hidden">
          <Text fontSize="sm" fontWeight="bold" color="white" lineClamp={1} title={equipment.name}>
            {equipment.name}
          </Text>
          <Text fontSize="xs" color="gray.400" textTransform="uppercase">
            {equipment.equipment_class}
          </Text>
          <Badge size="xs" variant="outline" colorPalette="gray" fontSize="9px">
            Procedural 3D Mesh
          </Badge>
        </VStack>
      </HStack>
    </Box>
  );
};
