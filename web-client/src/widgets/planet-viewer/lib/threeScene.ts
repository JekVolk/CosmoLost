import * as THREE from 'three';
import type { PlanetConfig, SpaceArtifact } from '../../../entities/planet/model/types';
import { latLonToVector3 } from '../../../shared/lib/coordinates';
import { PLANETS } from '../../../entities/planet/model/planetData';

export class PlanetScene {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  private currentPlanet: PlanetConfig;
  private isAutoRotating = true;

  private planetGroup: THREE.Group = new THREE.Group();
  private starfieldGroup: THREE.Group = new THREE.Group();
  private planetMesh: THREE.Mesh | null = null;
  private markersGroup: THREE.Group = new THREE.Group();
  private traverseGroup: THREE.Group = new THREE.Group();

  private ambientLight: THREE.AmbientLight;
  private dirLight: THREE.DirectionalLight;

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2(-999, -999);
  private markerMeshes: {
    mesh: THREE.Object3D;
    markerGroup: THREE.Group;
    artifact: SpaceArtifact;
    beaconHead: THREE.Group;
    sonarRing: THREE.Mesh;
    beamMesh: THREE.Mesh;
    rotorTop?: THREE.Mesh;
    rotorBottom?: THREE.Mesh;
    phase: number;
  }[] = [];

  private hoveredArtifact: SpaceArtifact | null = null;
  private pointerDownPos = { x: 0, y: 0 };
  private lastPointerPos = { x: 0, y: 0 };
  private isPointerDown = false;
  private isDragging = false;
  private angularVelocity = new THREE.Vector2(0, 0);

  private cameraDistance = 5.8;
  private targetCameraDistance = 5.8;
  private minDistance = 1.25;
  private maxDistance = 5.0;
  private controlsEnabled = true;

  private isGliding = false;
  private glideTargetQuat: THREE.Quaternion | null = null;
  private glideTargetDist: number | null = null;
  private onGlideComplete: (() => void) | null = null;
  private glideStartTime: number | null = null;

  private filteredArtifactIds: Set<string> | null = null;

  public onMarkerHover?: (artifact: SpaceArtifact | null, screenPos: { x: number; y: number } | null) => void;
  public onMarkerClick?: (artifact: SpaceArtifact, screenPos: { x: number; y: number }) => void;

  private animationFrameId: number = 0;
  private textureLoader = new THREE.TextureLoader();
  private textureCache: Map<string, THREE.Texture> = new Map();
  private planetBodies: Map<
    string,
    {
      mesh: THREE.Mesh;
      atmosphere?: THREE.Mesh;
      material: THREE.MeshStandardMaterial;
    }
  > = new Map();

  constructor(container: HTMLElement, initialPlanet: PlanetConfig) {
    this.container = container;
    this.currentPlanet = initialPlanet;

    this.scene = new THREE.Scene();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

    this.minDistance = initialPlanet.radius * 1.25;
    this.maxDistance = initialPlanet.radius * 5.0;
    this.cameraDistance = initialPlanet.radius * 2.6;
    this.targetCameraDistance = this.cameraDistance;

    this.camera.position.set(0, 0, this.cameraDistance);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    this.ambientLight = new THREE.AmbientLight(0xddeeff, 0.28);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xfff8ee, 2.5);
    this.dirLight.position.set(8, 3, 6);
    this.scene.add(this.dirLight);

    const rimLight = new THREE.DirectionalLight(0x406080, 0.35);
    rimLight.position.set(-8, -2, -6);
    this.scene.add(rimLight);

    this.buildStars();

    this.planetGroup.add(this.traverseGroup);
    this.planetGroup.add(this.markersGroup);
    this.scene.add(this.planetGroup);

    Object.values(PLANETS).forEach((cfg) => {
      const body = this.getOrCreatePlanetBody(cfg);
      const isCurrent = cfg.id === initialPlanet.id;
      body.mesh.visible = isCurrent;
      if (body.atmosphere) body.atmosphere.visible = isCurrent;
    });

    this.loadPlanet(initialPlanet);

    window.addEventListener('resize', this.onResize);
    const dom = this.renderer.domElement;
    dom.addEventListener('pointermove', this.onPointerMove);
    dom.addEventListener('pointerdown', this.onPointerDown);
    dom.addEventListener('pointerup', this.onPointerUp);
    dom.addEventListener('pointercancel', this.onPointerUp);
    dom.addEventListener('wheel', this.onWheel, { passive: false });
    dom.addEventListener('touchstart', this.onTouchStart, { passive: true });
    dom.addEventListener('touchmove', this.onTouchMove, { passive: true });
    dom.addEventListener('touchend', this.onTouchEnd, { passive: true });

    this.animate();
  }

  private getTexture(url: string, sRGB = true): THREE.Texture {
    if (this.textureCache.has(url)) {
      return this.textureCache.get(url)!;
    }
    const tex = this.textureLoader.load(url);
    if (sRGB) {
      tex.colorSpace = THREE.SRGBColorSpace;
    }
    this.textureCache.set(url, tex);
    return tex;
  }

  private buildStars() {
    this.scene.add(this.starfieldGroup);

    this.textureLoader.load('/textures/milkyway.jpg', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      const skyGeo = new THREE.SphereGeometry(120, 32, 32);
      const skyMat = new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.BackSide,
        depthWrite: false,
      });
      const skyMesh = new THREE.Mesh(skyGeo, skyMat);
      this.starfieldGroup.add(skyMesh);
    });

    const starCount = 1800;
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 40 + Math.random() * 50;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const colorDice = Math.random();
      if (colorDice > 0.8) {
        colors[i * 3] = 0.6;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 1.0;
      } else if (colorDice > 0.6) {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.85;
        colors[i * 3 + 2] = 0.65;
      } else {
        const b = 0.75 + Math.random() * 0.25;
        colors[i * 3] = b;
        colors[i * 3 + 1] = b;
        colors[i * 3 + 2] = b;
      }
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: false,
    });
    this.starfieldGroup.add(new THREE.Points(starGeo, starMat));
  }

  private getOrCreatePlanetBody(planet: PlanetConfig) {
    if (this.planetBodies.has(planet.id)) {
      return this.planetBodies.get(planet.id)!;
    }

    const geo = new THREE.SphereGeometry(planet.radius, 128, 128);
    const colorTex = this.getTexture(planet.colorMap, true);

    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: colorTex,
      roughness: planet.id === 'moon' ? 0.92 : 0.82,
      metalness: 0.05,
    });

    const mesh = new THREE.Mesh(geo, mat);
    this.planetGroup.add(mesh);

    let atmosphere: THREE.Mesh | undefined;
    if (planet.atmosphere) {
      const atmosColor = new THREE.Color(planet.atmosphere.color);
      const intensity = planet.atmosphere.intensity ?? 0.6;
      const atmosGeo = new THREE.SphereGeometry(planet.radius * 1.026, 64, 64);
      const atmosMat = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.6);
            vec3 color = vec3(${atmosColor.r.toFixed(3)}, ${atmosColor.g.toFixed(3)}, ${atmosColor.b.toFixed(3)});
            gl_FragColor = vec4(color, intensity * ${intensity.toFixed(2)});
          }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
      });

      atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
      this.planetGroup.add(atmosphere);
    }

    const entry = { mesh, atmosphere, material: mat };
    this.planetBodies.set(planet.id, entry);
    return entry;
  }

  public setPlanet(planet: PlanetConfig) {
    if (this.currentPlanet.id === planet.id) {
      this.currentPlanet = planet;
      while (this.markersGroup.children.length > 0) {
        const child = this.markersGroup.children[0];
        this.markersGroup.remove(child);
      }
      this.markerMeshes = [];

      while (this.traverseGroup.children.length > 0) {
        const child = this.traverseGroup.children[0];
        this.traverseGroup.remove(child);
      }

      this.buildArtifactMarkers(planet);
      this.buildTraversePaths(planet);
      return;
    }
    this.loadPlanet(planet);
  }

  private loadPlanet(planet: PlanetConfig) {
    this.cancelGlide(false);
    this.currentPlanet = planet;

    const currentBody = this.getOrCreatePlanetBody(planet);
    this.planetBodies.forEach((body, id) => {
      const isCurrent = id === planet.id;
      body.mesh.visible = isCurrent;
      if (body.atmosphere) body.atmosphere.visible = isCurrent;
    });

    currentBody.mesh.visible = true;
    if (currentBody.atmosphere) currentBody.atmosphere.visible = true;

    this.planetMesh = currentBody.mesh;

    while (this.markersGroup.children.length > 0) {
      const child = this.markersGroup.children[0];
      this.markersGroup.remove(child);
    }
    this.markerMeshes = [];

    while (this.traverseGroup.children.length > 0) {
      const child = this.traverseGroup.children[0];
      this.traverseGroup.remove(child);
    }

    this.buildArtifactMarkers(planet);
    this.buildTraversePaths(planet);

    this.minDistance = planet.radius * 1.25;
    this.maxDistance = planet.radius * 5.0;
    this.targetCameraDistance = planet.radius * 2.6;

    this.planetGroup.quaternion.set(0, 0, 0, 1);
    this.angularVelocity.set(0, 0);
  }

  private buildArtifactMarkers(planet: PlanetConfig) {
    const CLUSTER_THRESHOLD_DEG = 1.5;
    const visited = new Set<string>();

    const artifactPositions = new Map<string, THREE.Vector3>();
    planet.artifacts.forEach((art) => {
      artifactPositions.set(art.id, latLonToVector3(art.lat, art.lon, planet.radius));
    });

    const clusters: { center: THREE.Vector3; items: SpaceArtifact[] }[] = [];

    planet.artifacts.forEach((art) => {
      if (visited.has(art.id)) return;
      const clusterItems: SpaceArtifact[] = [art];
      visited.add(art.id);

      const queue = [art];
      while (queue.length > 0) {
        const cur = queue.shift()!;
        const curPos = artifactPositions.get(cur.id)!;
        const curNormal = curPos.clone().normalize();

        planet.artifacts.forEach((candidate) => {
          if (visited.has(candidate.id)) return;
          const candidatePos = artifactPositions.get(candidate.id)!;
          const candidateNormal = candidatePos.clone().normalize();

          const dot = THREE.MathUtils.clamp(curNormal.dot(candidateNormal), -1, 1);
          const angleDeg = THREE.MathUtils.radToDeg(Math.acos(dot));

          if (angleDeg <= CLUSTER_THRESHOLD_DEG) {
            visited.add(candidate.id);
            clusterItems.push(candidate);
            queue.push(candidate);
          }
        });
      }

      const centroid = new THREE.Vector3();
      clusterItems.forEach((item) => {
        centroid.add(artifactPositions.get(item.id)!);
      });
      centroid.normalize().multiplyScalar(planet.radius);

      clusters.push({ center: centroid, items: clusterItems });
    });

    interface ProposedMarker {
      artifact: SpaceArtifact;
      pos: THREE.Vector3;
      hubCenter?: THREE.Vector3;
    }
    const allMarkers: ProposedMarker[] = [];

    clusters.forEach((cluster) => {
      const isCluster = cluster.items.length > 1;
      const hubNormal = cluster.center.clone().normalize();

      if (isCluster) {
        const hubGroup = new THREE.Group();
        hubGroup.position.copy(cluster.center.clone().multiplyScalar(1.0012));
        hubGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), hubNormal);

        const anchorRingGeo = new THREE.RingGeometry(0.024, 0.032, 32);
        const anchorRingMat = new THREE.MeshBasicMaterial({
          color: planet.id === 'mars' ? 0xf97316 : 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.65,
        });
        const anchorRing = new THREE.Mesh(anchorRingGeo, anchorRingMat);
        anchorRing.rotation.x = Math.PI / 2;
        hubGroup.add(anchorRing);

        const crossPts = [
          new THREE.Vector3(-0.019, 0.001, 0),
          new THREE.Vector3(0.019, 0.001, 0),
          new THREE.Vector3(0, 0.001, -0.019),
          new THREE.Vector3(0, 0.001, 0.019),
        ];
        const crossLine = new THREE.LineSegments(
          new THREE.BufferGeometry().setFromPoints(crossPts),
          new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.85,
          })
        );
        hubGroup.add(crossLine);

        this.markersGroup.add(hubGroup);

        const up = Math.abs(hubNormal.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
        const tangentU = new THREE.Vector3().crossVectors(hubNormal, up).normalize();
        const tangentV = new THREE.Vector3().crossVectors(hubNormal, tangentU).normalize();

        const count = cluster.items.length;
        const MIN_ARC_GAP = 0.096;
        const INNER_MAX = 5;

        const ringDisplacements: THREE.Vector3[] = [];

        if (count <= INNER_MAX) {
          const rSingle = Math.max((count * MIN_ARC_GAP) / (2 * Math.PI), 0.11);
          for (let i = 0; i < count; i++) {
            const angle = (2 * Math.PI * i) / count - Math.PI / 2;
            ringDisplacements.push(
              new THREE.Vector3()
                .addScaledVector(tangentU, Math.cos(angle) * rSingle)
                .addScaledVector(tangentV, Math.sin(angle) * rSingle)
            );
          }
        } else {
          const innerCount = INNER_MAX;
          const outerCount = count - innerCount;
          const rInner = Math.max((innerCount * MIN_ARC_GAP) / (2 * Math.PI), 0.11);
          const rOuter = Math.max((outerCount * MIN_ARC_GAP) / (2 * Math.PI), rInner + MIN_ARC_GAP);

          for (let i = 0; i < innerCount; i++) {
            const angle = (2 * Math.PI * i) / innerCount - Math.PI / 2;
            ringDisplacements.push(
              new THREE.Vector3()
                .addScaledVector(tangentU, Math.cos(angle) * rInner)
                .addScaledVector(tangentV, Math.sin(angle) * rInner)
            );
          }
          for (let i = 0; i < outerCount; i++) {
            const angle = (2 * Math.PI * i) / outerCount - Math.PI / 2 + Math.PI / outerCount;
            ringDisplacements.push(
              new THREE.Vector3()
                .addScaledVector(tangentU, Math.cos(angle) * rOuter)
                .addScaledVector(tangentV, Math.sin(angle) * rOuter)
            );
          }
        }

        cluster.items.forEach((artifact, idx) => {
          const disp = ringDisplacements[idx];
          const markerPos = cluster.center.clone().add(disp).normalize().multiplyScalar(planet.radius);
          allMarkers.push({
            artifact,
            pos: markerPos,
            hubCenter: cluster.center.clone(),
          });
        });
      } else {
        allMarkers.push({
          artifact: cluster.items[0],
          pos: cluster.center.clone(),
        });
      }
    });

    const MIN_SAFE_DIST = 0.098;
    for (let iter = 0; iter < 50; iter++) {
      let anyMoved = false;
      for (let i = 0; i < allMarkers.length; i++) {
        for (let j = i + 1; j < allMarkers.length; j++) {
          const d = allMarkers[i].pos.distanceTo(allMarkers[j].pos);
          if (d < MIN_SAFE_DIST) {
            anyMoved = true;
            const delta = allMarkers[i].pos.clone().sub(allMarkers[j].pos);
            if (delta.lengthSq() < 0.000001) {
              delta.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
            }
            delta.normalize();
            const push = (MIN_SAFE_DIST - d) * 0.55;
            allMarkers[i].pos.addScaledVector(delta, push).normalize().multiplyScalar(planet.radius);
            allMarkers[j].pos.addScaledVector(delta, -push).normalize().multiplyScalar(planet.radius);
          }
        }
      }
      if (!anyMoved) break;
    }

    allMarkers.forEach((m) => {
      const markerNormal = m.pos.clone().normalize();

      if (m.hubCenter) {
        const spokeGeo = new THREE.BufferGeometry().setFromPoints([
          m.hubCenter.clone().multiplyScalar(1.002),
          m.pos.clone().multiplyScalar(1.002),
        ]);
        const spokeMat = new THREE.LineBasicMaterial({
          color: m.artifact.badgeColor ? new THREE.Color(m.artifact.badgeColor) : new THREE.Color(0x38bdf8),
          transparent: true,
          opacity: 0.45,
        });
        const spokeLine = new THREE.Line(spokeGeo, spokeMat);
        this.markersGroup.add(spokeLine);
      }

      this.createSingleMarker(m.artifact, m.pos, markerNormal);
    });
  }

  private createSingleMarker(artifact: SpaceArtifact, pos: THREE.Vector3, normal: THREE.Vector3) {
    const markerObj = new THREE.Group();
    markerObj.position.copy(pos);
    markerObj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

    const colorHex = artifact.badgeColor ? new THREE.Color(artifact.badgeColor) : new THREE.Color(0x38bdf8);
    const phase = Math.random() * Math.PI * 2;

    const groundRingGeo = new THREE.RingGeometry(0.013, 0.017, 32);
    const groundRingMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    });
    const groundRing = new THREE.Mesh(groundRingGeo, groundRingMat);
    groundRing.rotation.x = Math.PI / 2;
    groundRing.position.y = 0.002;
    markerObj.add(groundRing);

    const tickPoints = [
      new THREE.Vector3(-0.022, 0.002, 0),
      new THREE.Vector3(0.022, 0.002, 0),
      new THREE.Vector3(0, 0.002, -0.022),
      new THREE.Vector3(0, 0.002, 0.022),
    ];
    const crossGeo = new THREE.BufferGeometry().setFromPoints(tickPoints);
    const crossMat = new THREE.LineBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.5,
    });
    const cross = new THREE.LineSegments(crossGeo, crossMat);
    markerObj.add(cross);

    const sonarGeo = new THREE.RingGeometry(0.007, 0.011, 32);
    const sonarMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    const sonarRing = new THREE.Mesh(sonarGeo, sonarMat);
    sonarRing.rotation.x = Math.PI / 2;
    sonarRing.position.y = 0.0025;
    markerObj.add(sonarRing);

    const beamGeo = new THREE.CylinderGeometry(0.003, 0.010, 0.080, 12, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.y = 0.040;
    markerObj.add(beamMesh);

    const coreBeamGeo = new THREE.CylinderGeometry(0.0012, 0.0012, 0.080, 6);
    const coreBeamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
    });
    const coreBeam = new THREE.Mesh(coreBeamGeo, coreBeamMat);
    coreBeam.position.y = 0.040;
    markerObj.add(coreBeam);

    const beaconHead = new THREE.Group();
    beaconHead.position.y = 0.080;

    const headMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.92,
    });
    const wireMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const sparkMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
    });

    let rotorTop: THREE.Mesh | undefined;
    let rotorBottom: THREE.Mesh | undefined;

    switch (artifact.type) {
      case 'rover': {
        const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.018, 0), headMat);
        beaconHead.add(core);

        const gimbal = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.0018, 6, 24), wireMat);
        gimbal.rotation.x = Math.PI / 3.5;
        beaconHead.add(gimbal);

        const spark = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 8, 8), sparkMat);
        beaconHead.add(spark);
        break;
      }
      case 'helicopter': {
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.011, 12, 12), headMat);
        beaconHead.add(body);

        rotorTop = new THREE.Mesh(new THREE.BoxGeometry(0.040, 0.002, 0.006), headMat);
        rotorTop.position.y = 0.010;
        beaconHead.add(rotorTop);

        rotorBottom = new THREE.Mesh(new THREE.BoxGeometry(0.040, 0.002, 0.006), headMat);
        rotorBottom.position.y = -0.009;
        rotorBottom.rotation.y = Math.PI / 2;
        beaconHead.add(rotorBottom);

        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.0015, 0.0015, 0.022, 6), sparkMat);
        beaconHead.add(mast);
        break;
      }
      case 'lander':
      case 'descent_stage': {
        const landerBody = new THREE.Mesh(new THREE.ConeGeometry(0.020, 0.026, 4), headMat);
        landerBody.rotation.y = Math.PI / 4;
        beaconHead.add(landerBody);

        const landerBase = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.011, 4), wireMat);
        landerBase.rotation.x = Math.PI;
        landerBase.rotation.y = Math.PI / 4;
        landerBase.position.y = -0.010;
        beaconHead.add(landerBase);

        const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 8, 8), sparkMat);
        antennaTip.position.y = 0.014;
        beaconHead.add(antennaTip);
        break;
      }
      case 'retro_reflector':
      case 'instrument': {
        const crystalCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.016, 0), headMat);
        beaconHead.add(crystalCore);

        const crystalShell = new THREE.Mesh(new THREE.IcosahedronGeometry(0.024, 0), wireMat);
        beaconHead.add(crystalShell);

        const glint = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 8, 8), sparkMat);
        beaconHead.add(glint);
        break;
      }
      case 'impact_stage': {
        const hazardCone = new THREE.Mesh(new THREE.ConeGeometry(0.020, 0.030, 3), headMat);
        hazardCone.rotation.x = Math.PI;
        beaconHead.add(hazardCone);

        const hazardRing = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.0018, 4, 16), wireMat);
        hazardRing.rotation.x = Math.PI / 2;
        beaconHead.add(hazardRing);

        const strobe = new THREE.Mesh(new THREE.SphereGeometry(0.0065, 8, 8), sparkMat);
        beaconHead.add(strobe);
        break;
      }
      case 'sample_depot': {
        const canister = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.026, 8), headMat);
        beaconHead.add(canister);

        const bandTop = new THREE.Mesh(new THREE.TorusGeometry(0.013, 0.0015, 6, 16), sparkMat);
        bandTop.position.y = 0.007;
        bandTop.rotation.x = Math.PI / 2;
        beaconHead.add(bandTop);

        const bandBottom = new THREE.Mesh(new THREE.TorusGeometry(0.013, 0.0015, 6, 16), sparkMat);
        bandBottom.position.y = -0.007;
        bandBottom.rotation.x = Math.PI / 2;
        beaconHead.add(bandBottom);
        break;
      }
      default: {
        const defaultCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.016, 0), headMat);
        beaconHead.add(defaultCore);
        const defaultShell = new THREE.Mesh(new THREE.OctahedronGeometry(0.024, 0), wireMat);
        beaconHead.add(defaultShell);
        break;
      }
    }

    markerObj.add(beaconHead);

    const hitGeo = new THREE.SphereGeometry(0.048, 10, 10);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.y = 0.080;
    markerObj.add(hitMesh);

    this.markersGroup.add(markerObj);
    this.markerMeshes.push({
      mesh: hitMesh,
      markerGroup: markerObj,
      artifact,
      beaconHead,
      sonarRing,
      beamMesh,
      rotorTop,
      rotorBottom,
      phase,
    });
  }

  private buildTraversePaths(planet: PlanetConfig) {
    planet.artifacts.forEach((artifact) => {
      if (!artifact.traversePath || artifact.traversePath.length < 2) return;

      const points = artifact.traversePath.map((pt) =>
        latLonToVector3(pt.lat, pt.lon, planet.radius * 1.003)
      );

      const colorHex = artifact.badgeColor ? new THREE.Color(artifact.badgeColor) : new THREE.Color(0xf59e0b);

      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.8,
      });
      const lineMesh = new THREE.Line(lineGeo, lineMat);
      this.traverseGroup.add(lineMesh);

      artifact.traversePath.forEach((pt, idx) => {
        if (idx === artifact.traversePath!.length - 1) return;
        const dotGeo = new THREE.SphereGeometry(0.018, 8, 8);
        const dotMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.75 });
        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.copy(latLonToVector3(pt.lat, pt.lon, planet.radius * 1.0035));
        this.traverseGroup.add(dot);
      });
    });
  }

  public setFilteredArtifactIds(ids: Set<string> | string[] | null) {
    if (ids === null) {
      this.filteredArtifactIds = null;
    } else if (Array.isArray(ids)) {
      this.filteredArtifactIds = new Set(ids);
    } else {
      this.filteredArtifactIds = ids;
    }
  }

  public cancelGlide(completed = false) {
    if (this.isGliding) {
      this.isGliding = false;
      this.glideTargetQuat = null;
      this.glideTargetDist = null;
    }

    if (completed) {
      const cb = this.onGlideComplete;
      this.onGlideComplete = null;
      cb?.();
    } else {
      this.onGlideComplete = null;
    }
  }

  public freezeControls() {
    this.controlsEnabled = false;
    window.setTimeout(() => {
      this.controlsEnabled = true;
    }, 400);
  }

  public flyToArtifact(artifact: SpaceArtifact, onComplete?: () => void) {
    this.cancelGlide(false);
    this.onGlideComplete = onComplete || null;

    const markerInfo = this.markerMeshes.find((m) => m.artifact.id === artifact.id);
    const pos = markerInfo
      ? markerInfo.markerGroup.position.clone()
      : latLonToVector3(artifact.lat, artifact.lon, this.currentPlanet.radius);
    const localNormal = pos.clone().normalize();

    this.isAutoRotating = false;

    const targetViewDir = new THREE.Vector3(0, 0.08, 0.99).normalize();
    this.glideTargetQuat = new THREE.Quaternion().setFromUnitVectors(localNormal, targetViewDir);
    this.glideTargetDist = this.currentPlanet.radius * 1.55;

    this.isGliding = true;
    this.glideStartTime = performance.now();
  }

  public resetView() {
    this.cancelGlide(false);
    this.glideTargetQuat = new THREE.Quaternion(0, 0, 0, 1);
    this.glideTargetDist = this.currentPlanet.radius * 2.6;
    this.isGliding = true;
    this.glideStartTime = performance.now();
    this.isAutoRotating = true;
  }

  public toggleAutoRotate() {
    this.isAutoRotating = !this.isAutoRotating;
    return this.isAutoRotating;
  }

  public setAutoRotate(enabled: boolean) {
    this.isAutoRotating = enabled;
  }

  public setMarkersVisible(visible: boolean) {
    this.markersGroup.visible = visible;
  }

  private onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    this.cancelGlide();
    this.isPointerDown = true;
    this.isDragging = false;
    this.pointerDownPos = { x: e.clientX, y: e.clientY };
    this.lastPointerPos = { x: e.clientX, y: e.clientY };
    this.angularVelocity.set(0, 0);
  };

  private onPointerMove = (e: PointerEvent) => {
    if (this.isPointerDown && this.controlsEnabled) {
      const dx = e.clientX - this.lastPointerPos.x;
      const dy = e.clientY - this.lastPointerPos.y;
      const totalDist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);

      if (totalDist > 5) {
        this.isDragging = true;
        this.isAutoRotating = false;
        if (this.hoveredArtifact) {
          this.hoveredArtifact = null;
          this.container.style.cursor = 'grab';
          if (this.onMarkerHover) this.onMarkerHover(null, null);
        }
      }

      this.lastPointerPos = { x: e.clientX, y: e.clientY };

      const baseDist = this.currentPlanet.radius * 2.6;
      const zoomFactor = THREE.MathUtils.clamp(this.cameraDistance / baseDist, 0.22, 1.0);
      const speed = zoomFactor * 0.0018;

      const rotY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx * speed);
      const rotX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy * speed);

      this.planetGroup.quaternion.premultiply(rotY);
      this.planetGroup.quaternion.premultiply(rotX);

      this.angularVelocity.set(dx * speed * 0.65, dy * speed * 0.65);
      return;
    }

    if (!this.markersGroup.visible || this.isDragging) {
      if (this.hoveredArtifact !== null) {
        this.hoveredArtifact = null;
        this.container.style.cursor = 'default';
        if (this.onMarkerHover) this.onMarkerHover(null, null);
      }
      return;
    }

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const visibleMarkers = this.markerMeshes.filter((m) => {
      const isFilteredIn = this.filteredArtifactIds ? this.filteredArtifactIds.has(m.artifact.id) : true;
      return isFilteredIn && this.isMarkerVisibleFromCamera(m.mesh);
    });
    const visibleHitObjects = visibleMarkers.map((m) => m.mesh);

    const testTargets: THREE.Object3D[] = this.planetMesh
      ? [this.planetMesh, ...visibleHitObjects]
      : visibleHitObjects;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(testTargets);

    if (intersects.length > 0 && intersects[0].object !== this.planetMesh) {
      const hit = intersects[0].object;
      const found = visibleMarkers.find((m) => m.mesh === hit);

      if (found) {
        this.container.style.cursor = 'pointer';
        if (this.hoveredArtifact !== found.artifact) {
          this.hoveredArtifact = found.artifact;

          const worldPos = new THREE.Vector3();
          found.mesh.getWorldPosition(worldPos);
          worldPos.project(this.camera);

          const screenX = ((worldPos.x + 1) * rect.width) / 2 + rect.left;
          const screenY = ((-worldPos.y + 1) * rect.height) / 2 + rect.top;

          if (this.onMarkerHover) {
            this.onMarkerHover(found.artifact, { x: screenX, y: screenY });
          }
        }
        return;
      }
    }

    if (this.hoveredArtifact !== null) {
      this.hoveredArtifact = null;
      this.container.style.cursor = 'default';
      if (this.onMarkerHover) {
        this.onMarkerHover(null, null);
      }
    }
  };

  private onPointerUp = (e: PointerEvent) => {
    if (!this.isPointerDown) return;
    this.isPointerDown = false;

    const dragDist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
    if (dragDist <= 6) {
      this.onClick(e);
    }
    this.isDragging = false;
  };

  private onClick = (e: PointerEvent) => {
    if (!this.markersGroup.visible) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const clickY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const visibleMarkers = this.markerMeshes.filter((m) => {
      const isFilteredIn = this.filteredArtifactIds ? this.filteredArtifactIds.has(m.artifact.id) : true;
      return isFilteredIn && this.isMarkerVisibleFromCamera(m.mesh);
    });
    const visibleHitObjects = visibleMarkers.map((m) => m.mesh);

    const testTargets: THREE.Object3D[] = this.planetMesh
      ? [this.planetMesh, ...visibleHitObjects]
      : visibleHitObjects;

    this.raycaster.setFromCamera(new THREE.Vector2(clickX, clickY), this.camera);
    const intersects = this.raycaster.intersectObjects(testTargets);

    if (intersects.length > 0 && intersects[0].object !== this.planetMesh) {
      const hit = intersects[0].object;
      const found = visibleMarkers.find((m) => m.mesh === hit);
      if (found && this.onMarkerClick) {
        const worldPos = new THREE.Vector3();
        found.mesh.getWorldPosition(worldPos);
        worldPos.project(this.camera);

        const screenX = ((worldPos.x + 1) * rect.width) / 2 + rect.left;
        const screenY = ((-worldPos.y + 1) * rect.height) / 2 + rect.top;

        this.onMarkerClick(found.artifact, { x: screenX, y: screenY });
      }
    }
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.cancelGlide();

    const zoomStep = Math.exp(e.deltaY * 0.001);
    this.targetCameraDistance = THREE.MathUtils.clamp(
      this.targetCameraDistance * zoomStep,
      this.minDistance,
      this.maxDistance
    );
  };

  private touchStartDist = 0;
  private onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      this.touchStartDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  };

  private onTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2 && this.touchStartDist > 0) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = this.touchStartDist / Math.max(currentDist, 1);
      this.targetCameraDistance = THREE.MathUtils.clamp(
        this.targetCameraDistance * ratio,
        this.minDistance,
        this.maxDistance
      );
      this.touchStartDist = currentDist;
    }
  };

  private onTouchEnd = () => {
    this.touchStartDist = 0;
  };

  public isMarkerVisibleFromCamera(object: THREE.Object3D): boolean {
    const worldPos = new THREE.Vector3();
    object.getWorldPosition(worldPos);

    const surfaceNormal = worldPos.clone().normalize();
    const toCamera = this.camera.position.clone().sub(worldPos).normalize();

    return surfaceNormal.dot(toCamera) > 0.05;
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    this.cameraDistance = THREE.MathUtils.lerp(this.cameraDistance, this.targetCameraDistance, 0.12);
    this.camera.position.set(0, 0, this.cameraDistance);
    this.camera.lookAt(0, 0, 0);

    if (!this.isPointerDown && !this.isGliding) {
      if (this.angularVelocity.lengthSq() > 0.0000001) {
        const rotY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.angularVelocity.x);
        const rotX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.angularVelocity.y);
        this.planetGroup.quaternion.premultiply(rotY);
        this.planetGroup.quaternion.premultiply(rotX);
        this.angularVelocity.multiplyScalar(0.88);
      } else if (this.isAutoRotating) {
        const autoRot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.0010);
        this.planetGroup.quaternion.premultiply(autoRot);
      }
    }

    if (this.isGliding && this.glideTargetQuat) {
      this.planetGroup.quaternion.slerp(this.glideTargetQuat, 0.085);
      if (this.glideTargetDist) {
        this.targetCameraDistance = THREE.MathUtils.lerp(this.targetCameraDistance, this.glideTargetDist, 0.085);
      }

      const angleDiff = this.planetGroup.quaternion.angleTo(this.glideTargetQuat);
      const distDiff = Math.abs(this.cameraDistance - (this.glideTargetDist || this.cameraDistance));
      const elapsed = performance.now() - (this.glideStartTime || 0);

      if ((angleDiff < 0.008 && distDiff < 0.02) || elapsed > 1500) {
        this.planetGroup.quaternion.copy(this.glideTargetQuat);
        if (this.glideTargetDist) this.targetCameraDistance = this.glideTargetDist;
        this.isGliding = false;
        this.glideTargetQuat = null;
        this.glideTargetDist = null;

        if (this.onGlideComplete) {
          const cb = this.onGlideComplete;
          this.onGlideComplete = null;
          cb();
        }
      }
    }

    const time = performance.now() * 0.0025;
    this.markerMeshes.forEach((item) => {
      const isFilteredIn = this.filteredArtifactIds ? this.filteredArtifactIds.has(item.artifact.id) : true;
      const isVisible = isFilteredIn && this.isMarkerVisibleFromCamera(item.mesh);
      item.markerGroup.visible = isVisible;
      if (!isVisible) return;

      const isHovered = this.hoveredArtifact?.id === item.artifact.id;

      item.beaconHead.rotation.y += isHovered ? 0.042 : 0.016;

      const bob = Math.sin(time * 2.2 + item.phase) * 0.005;
      item.beaconHead.position.y = 0.080 + bob;

      if (item.rotorTop && item.rotorBottom) {
        item.rotorTop.rotation.y += isHovered ? 0.28 : 0.09;
        item.rotorBottom.rotation.y -= isHovered ? 0.28 : 0.09;
      }

      if (item.sonarRing && item.sonarRing.material instanceof THREE.MeshBasicMaterial) {
        const cycle = (time * 0.75 + item.phase / (Math.PI * 2)) % 1;
        const sonarScale = 0.6 + cycle * 2.2;
        item.sonarRing.scale.set(sonarScale, sonarScale, 1);
        item.sonarRing.material.opacity = Math.max(0, (1 - cycle) * 0.65);
      }

      const targetScale = isHovered ? 1.42 : 1.0;
      item.beaconHead.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.2);

      if (item.beamMesh && item.beamMesh.material instanceof THREE.MeshBasicMaterial) {
        item.beamMesh.material.opacity = isHovered ? 0.8 : 0.38;
      }
    });

    if (this.hoveredArtifact) {
      const current = this.markerMeshes.find((m) => m.artifact.id === this.hoveredArtifact?.id);
      if (current && !this.isMarkerVisibleFromCamera(current.mesh)) {
        this.hoveredArtifact = null;
        this.container.style.cursor = 'default';
        if (this.onMarkerHover) {
          this.onMarkerHover(null, null);
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
  };

  public destroy() {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.onResize);
    const dom = this.renderer.domElement;
    dom.removeEventListener('pointermove', this.onPointerMove);
    dom.removeEventListener('pointerdown', this.onPointerDown);
    dom.removeEventListener('pointerup', this.onPointerUp);
    dom.removeEventListener('pointercancel', this.onPointerUp);
    dom.removeEventListener('wheel', this.onWheel);
    dom.removeEventListener('touchstart', this.onTouchStart);
    dom.removeEventListener('touchmove', this.onTouchMove);
    dom.removeEventListener('touchend', this.onTouchEnd);

    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
