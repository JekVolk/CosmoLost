import { Box, Layers, Maximize2, Minimize2, Pause, Play, RefreshCw, RotateCcw } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { resolveGlbModelUrl } from '../model/cdnModels';
import type { Model3DViewerProps } from '../types';

export const Model3DViewer: React.FC<Model3DViewerProps> = ({
  artifact,
  modelUrl,
  themeColor = '#38bdf8',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [modelSource, setModelSource] = useState<string>('NASA 3D CDN GLB');
  const [modelLoadError, setModelLoadError] = useState<string | null>(null);

  const controlsRef = useRef<OrbitControls | null>(null);
  const isAutoRotatingRef = useRef<boolean>(isAutoRotating);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<THREE.Material[]>([]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 400;
    let height = container.clientHeight || 320;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2.8, 2.0, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = isAutoRotatingRef.current;
    controls.autoRotateSpeed = 1.6;
    controls.minDistance = 1.0;
    controls.maxDistance = 8.0;
    controls.target.set(0, 0.4, 0);
    controlsRef.current = controls;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(4, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const rimLight = new THREE.SpotLight(new THREE.Color(themeColor), 3.0);
    rimLight.position.set(-4, 3, -4);
    rimLight.lookAt(0, 0, 0);
    scene.add(rimLight);

    // 4. Ground Grid & Pedestal
    const gridHelper = new THREE.GridHelper(6, 24, new THREE.Color(themeColor), 0x1e293b);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    const pedestalGeo = new THREE.CylinderGeometry(1.4, 1.5, 0.08, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.3,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.04;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // 5. Model Container
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;
    materialsRef.current = [];

    // Helper: Build Procedural 3D Model based on Artifact Type
    const buildProceduralModel = (type: string) => {
      modelGroup.clear();
      materialsRef.current = [];

      const metalMat = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        metalness: 0.85,
        roughness: 0.25,
      });
      const foilMat = new THREE.MeshStandardMaterial({
        color: 0xeab308,
        metalness: 0.9,
        roughness: 0.35,
      });
      const darkMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.4,
        roughness: 0.7,
      });
      const solarMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.7,
        roughness: 0.2,
      });

      materialsRef.current.push(metalMat, foilMat, darkMat, solarMat);

      if (type === 'rover') {
        // Body / Chassis
        const bodyGeo = new THREE.BoxGeometry(1.1, 0.45, 0.8);
        const body = new THREE.Mesh(bodyGeo, metalMat);
        body.position.y = 0.55;
        body.castShadow = true;
        modelGroup.add(body);

        // Solar Panel Deck
        const panelGeo = new THREE.BoxGeometry(1.3, 0.04, 1.0);
        const panel = new THREE.Mesh(panelGeo, solarMat);
        panel.position.set(0, 0.8, 0);
        modelGroup.add(panel);

        // Mastcam tower
        const mastGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.65, 12);
        const mast = new THREE.Mesh(mastGeo, darkMat);
        mast.position.set(0.4, 1.1, 0.25);
        modelGroup.add(mast);

        const cameraHeadGeo = new THREE.BoxGeometry(0.2, 0.12, 0.16);
        const cameraHead = new THREE.Mesh(cameraHeadGeo, metalMat);
        cameraHead.position.set(0.4, 1.45, 0.25);
        modelGroup.add(cameraHead);

        // Wheels (6 Rocker-Bogie)
        const wheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16);
        wheelGeo.rotateZ(Math.PI / 2);
        const xPositions = [-0.55, 0, 0.55];
        const zPositions = [-0.48, 0.48];

        xPositions.forEach((x) => {
          zPositions.forEach((z) => {
            const wheel = new THREE.Mesh(wheelGeo, darkMat);
            wheel.position.set(x, 0.2, z);
            wheel.castShadow = true;
            modelGroup.add(wheel);

            // Strut
            const strutGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8);
            const strut = new THREE.Mesh(strutGeo, metalMat);
            strut.position.set(x, 0.38, z * 0.7);
            modelGroup.add(strut);
          });
        });

        // High-Gain Antenna dish
        const dishGeo = new THREE.SphereGeometry(0.18, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const dish = new THREE.Mesh(dishGeo, foilMat);
        dish.position.set(-0.35, 1.0, -0.2);
        dish.rotation.x = Math.PI * 0.3;
        modelGroup.add(dish);
      } else if (type === 'helicopter') {
        // Ingenuity cube avionics
        const cubeGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
        const cube = new THREE.Mesh(cubeGeo, foilMat);
        cube.position.y = 0.5;
        modelGroup.add(cube);

        // Mast
        const mastGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.75, 12);
        const mast = new THREE.Mesh(mastGeo, darkMat);
        mast.position.y = 0.85;
        modelGroup.add(mast);

        // Rotor 1 & 2
        const rotorGeo = new THREE.BoxGeometry(1.2, 0.015, 0.08);
        const rotor1 = new THREE.Mesh(rotorGeo, darkMat);
        rotor1.position.y = 0.95;
        modelGroup.add(rotor1);

        const rotor2 = new THREE.Mesh(rotorGeo, darkMat);
        rotor2.position.y = 1.1;
        rotor2.rotation.y = Math.PI / 2;
        modelGroup.add(rotor2);

        // Solar panel at top
        const solarTopGeo = new THREE.BoxGeometry(0.3, 0.02, 0.3);
        const solarTop = new THREE.Mesh(solarTopGeo, solarMat);
        solarTop.position.y = 1.25;
        modelGroup.add(solarTop);

        // 4 Legs
        const legGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.6, 8);
        const legAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
        legAngles.forEach((ang) => {
          const leg = new THREE.Mesh(legGeo, darkMat);
          leg.position.set(Math.cos(ang) * 0.3, 0.25, Math.sin(ang) * 0.3);
          leg.rotation.z = Math.cos(ang) * 0.45;
          leg.rotation.x = Math.sin(ang) * 0.45;
          modelGroup.add(leg);
        });
      } else if (type === 'retro_reflector' || type === 'instrument') {
        // Laser Ranging Retro-Reflector palette
        const baseGeo = new THREE.BoxGeometry(0.8, 0.15, 0.8);
        const base = new THREE.Mesh(baseGeo, foilMat);
        base.position.y = 0.3;
        modelGroup.add(base);

        // Angled reflector panel
        const panelMountGeo = new THREE.BoxGeometry(0.7, 0.08, 0.7);
        const panelMount = new THREE.Mesh(panelMountGeo, metalMat);
        panelMount.position.set(0, 0.55, 0);
        panelMount.rotation.x = Math.PI * 0.18;
        modelGroup.add(panelMount);

        // Matrix of Corner-Cube Prisms
        const prismGeo = new THREE.ConeGeometry(0.045, 0.06, 6);
        for (let row = -2; row <= 2; row++) {
          for (let col = -2; col <= 2; col++) {
            const prismMat = new THREE.MeshStandardMaterial({
              color: 0x67e8f9,
              roughness: 0.1,
              metalness: 0.95,
            });
            materialsRef.current.push(prismMat);
            const prism = new THREE.Mesh(prismGeo, prismMat);
            prism.position.set(col * 0.12, 0.58 + row * 0.03, row * 0.12);
            prism.rotation.x = Math.PI * 0.18;
            modelGroup.add(prism);
          }
        }
      } else {
        // Lander / Descent Stage / General Spacecraft
        const stageGeo = new THREE.CylinderGeometry(0.75, 0.95, 0.6, 8);
        const stage = new THREE.Mesh(stageGeo, foilMat);
        stage.position.y = 0.55;
        stage.castShadow = true;
        modelGroup.add(stage);

        const bellGeo = new THREE.ConeGeometry(0.3, 0.45, 16);
        const bell = new THREE.Mesh(bellGeo, darkMat);
        bell.position.y = 0.15;
        bell.rotation.x = Math.PI;
        modelGroup.add(bell);

        // 4 Landing Legs with Footpads
        const legAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
        legAngles.forEach((ang) => {
          const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.7, 8);
          const leg = new THREE.Mesh(legGeo, metalMat);
          leg.position.set(Math.cos(ang) * 0.85, 0.35, Math.sin(ang) * 0.85);
          leg.rotation.z = Math.cos(ang) * 0.55;
          leg.rotation.x = Math.sin(ang) * 0.55;
          modelGroup.add(leg);

          const padGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.03, 12);
          const pad = new THREE.Mesh(padGeo, foilMat);
          pad.position.set(Math.cos(ang) * 1.15, 0.02, Math.sin(ang) * 1.15);
          modelGroup.add(pad);
        });

        // Top equipment payload
        const domeGeo = new THREE.SphereGeometry(0.45, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const dome = new THREE.Mesh(domeGeo, metalMat);
        dome.position.y = 0.85;
        modelGroup.add(dome);
      }

      setModelSource('Procedural Reconstruction');
      setLoading(false);
    };

    // Candidate NASA CDN model URL or fallback
    const candidateUrl =
      resolveGlbModelUrl(artifact.id, modelUrl || artifact.model3dUrl) ||
      (artifact.model3dName ? resolveGlbModelUrl(artifact.model3dName) : null);

    setLoading(true);
    setLoadProgress(0);
    setModelLoadError(null);

    if (candidateUrl) {
      const loader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('/draco/');
      loader.setDRACOLoader(dracoLoader);
      loader.load(
        candidateUrl,
        (gltf) => {
          modelGroup.clear();
          materialsRef.current = [];

          const root = gltf.scene;
          root.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                  materialsRef.current.push(...mesh.material);
                } else {
                  materialsRef.current.push(mesh.material);
                }
              }
            }
          });

          // Compute bounding box & normalize size
          const bbox = new THREE.Box3().setFromObject(root);
          const size = bbox.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 1.6 / (maxDim || 1);
          root.scale.setScalar(scale);

          const center = bbox.getCenter(new THREE.Vector3());
          root.position.x = -center.x * scale;
          root.position.z = -center.z * scale;
          root.position.y = -bbox.min.y * scale;

          modelGroup.add(root);
          setModelSource('NASA 3D Resources (GLB)');
          setLoadProgress(100);
          setLoading(false);
        },
        (xhr) => {
          if (xhr.lengthComputable && xhr.total > 0) {
            const percent = Math.min(100, Math.round((xhr.loaded / xhr.total) * 100));
            setLoadProgress(percent);
          }
        },
        () => {
          setLoading(false);
          setModelLoadError('NASA GLB model could not be loaded. Displaying procedural model.');
          buildProceduralModel(artifact.type);
        },
      );
    } else {
      buildProceduralModel(artifact.type);
    }

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      controls.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [artifact.id, artifact.type, artifact.model3dUrl, artifact.model3dName, modelUrl, themeColor]);

  useEffect(() => {
    isAutoRotatingRef.current = isAutoRotating;
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotating;
    }
  }, [isAutoRotating]);

  const toggleAutoRotate = () => {
    setIsAutoRotating((prev) => {
      if (controlsRef.current) {
        controlsRef.current.autoRotate = !prev;
      }
      return !prev;
    });
  };

  const toggleWireframe = () => {
    const nextState = !isWireframe;
    setIsWireframe(nextState);
    materialsRef.current.forEach((mat) => {
      if ('wireframe' in mat) {
        (mat as any).wireframe = nextState;
      }
    });
  };

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.target.set(0, 0.4, 0);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: isFullscreen ? '85vh' : '420px',
        borderRadius: '16px',
        overflow: 'hidden',
        border: `1.5px solid ${themeColor}40`,
        background: '#070b14',
        boxShadow: `0 16px 40px -12px ${themeColor}30`,
        transition: 'height 0.3s ease',
      }}
    >
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

      {/* Top HUD Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '14px',
          right: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '11px',
              fontWeight: 700,
              color: '#f8fafc',
              background: 'rgba(15, 23, 42, 0.85)',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box size={14} style={{ color: themeColor }} />
            <span>{artifact.name.toUpperCase()} (3D GLB)</span>
          </div>

          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '10px',
              color: '#34d399',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '4px 8px',
              borderRadius: '6px',
              fontWeight: 600,
            }}
          >
            {modelSource}
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', pointerEvents: 'auto' }}>
          <button
            type="button"
            onClick={toggleAutoRotate}
            title={isAutoRotating ? 'Pause Rotation' : 'Auto Rotate'}
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: isAutoRotating ? themeColor : '#94a3b8',
              borderRadius: '8px',
              padding: '6px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isAutoRotating ? <Pause size={13} /> : <Play size={13} />}
          </button>

          <button
            type="button"
            onClick={toggleWireframe}
            title={isWireframe ? 'Solid Mode' : 'Hologram Wireframe Mode'}
            style={{
              background: isWireframe ? `${themeColor}25` : 'rgba(15, 23, 42, 0.85)',
              border: `1px solid ${isWireframe ? themeColor : 'rgba(255, 255, 255, 0.15)'}`,
              color: isWireframe ? themeColor : '#94a3b8',
              borderRadius: '8px',
              padding: '6px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Layers size={13} />
          </button>

          <button
            type="button"
            onClick={handleResetCamera}
            title="Reset Camera Target"
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#94a3b8',
              borderRadius: '8px',
              padding: '6px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <RotateCcw size={13} />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand 3D Viewport'}
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#94a3b8',
              borderRadius: '8px',
              padding: '6px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Loading Overlay with Progress Indicator */}
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(7, 11, 20, 0.88)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: '#f1f5f9',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '12px',
            zIndex: 20,
          }}
        >
          <RefreshCw size={26} className="animate-spin" style={{ color: themeColor }} />
          <span style={{ fontWeight: 700, letterSpacing: '0.05em' }}>
            ACQUIRING NASA 3D TELEMETRY...
          </span>

          <div
            style={{
              width: '180px',
              height: '6px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <div
              style={{
                width: `${Math.max(10, loadProgress)}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${themeColor} 0%, #34d399 100%)`,
                boxShadow: `0 0 10px ${themeColor}`,
                transition: 'width 0.2s ease-out',
              }}
            />
          </div>

          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            {loadProgress > 0 ? `${loadProgress}% LOADED` : 'SYNCHRONIZING MESH...'}
          </span>
        </div>
      )}

      {modelLoadError && !loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            zIndex: 20,
            background: 'rgba(7, 11, 20, 0.92)',
            color: '#fca5a5',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '12px',
            textAlign: 'center',
            padding: '24px',
          }}
        >
          <Box size={28} />
          <strong>NASA 3D MODEL UNAVAILABLE</strong>
          <span style={{ color: '#94a3b8' }}>{modelLoadError}</span>
        </div>
      )}

      {/* Bottom Hint Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '14px',
          right: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '10.5px',
          color: '#64748b',
          fontFamily: 'var(--font-mono, monospace)',
          pointerEvents: 'none',
        }}
      >
        <span>LEFT CLICK: ROTATE • RIGHT CLICK: PAN • SCROLL: ZOOM</span>
        <span style={{ color: '#94a3b8' }}>ORBIT SPEED: 1.6x • SHADOWS: ACTIVE</span>
      </div>
    </div>
  );
};
