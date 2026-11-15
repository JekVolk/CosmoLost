import { CELESTIAL_PRESETS } from './constants';
import type {
  GameplayObstacle,
  GameplaySimulationConfig,
  Particle,
  TelemetryMetrics,
} from './types';

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkleSpeed: number;
}

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
}

export class GameplayRunnerEngine {
  private config: GameplaySimulationConfig;
  private width = 1080;
  private height = 1920;

  // Player state
  public playerX = 220;
  public playerY = 600;
  public playerVy = 0;
  public isGrounded = false;
  public rotation = 0;
  public squashX = 1;
  public squashY = 1;

  // World & Camera
  public worldDistance = 0;
  public cameraShake = 0;

  // Procedural terrain & obstacles
  private groundHeight = 1200; // Base ground level in 1080x1920 space
  private platforms: Platform[] = [];
  private obstacles: GameplayObstacle[] = [];
  private particles: Particle[] = [];
  private stars: Star[] = [];
  private trail: TrailPoint[] = [];

  // Metrics
  public score = 0;
  public collectedSamples = 0;
  public combo = 1;
  public comboTimer = 0;
  public lastJumpTime = 0;

  constructor(config: GameplaySimulationConfig, width = 1080, height = 1920) {
    this.config = config;
    this.resize(width, height);
    this.initStars();
    this.initStartingWorld();
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.groundHeight = height * 0.75;
    this.playerX = width * 0.22;
    if (this.playerY > this.groundHeight) {
      this.playerY = this.groundHeight - 25;
    }
  }

  public updateConfig(newConfig: Partial<GameplaySimulationConfig>): void {
    const prevPreset = this.config.preset;
    this.config = { ...this.config, ...newConfig };
    if (newConfig.preset && newConfig.preset !== prevPreset) {
      const presetInfo = CELESTIAL_PRESETS[newConfig.preset];
      this.config.gravity = presetInfo.gravity;
      this.initStars();
      this.initStartingWorld();
    }
  }

  private initStars(): void {
    const preset = CELESTIAL_PRESETS[this.config.preset];
    this.stars = [];
    for (let i = 0; i < preset.ambientStarsCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.65),
        size: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: (Math.random() - 0.5) * 0.05,
      });
    }
  }

  private initStartingWorld(): void {
    this.platforms = [];
    this.obstacles = [];
    this.particles = [];
    this.trail = [];
    this.playerY = this.groundHeight - 30;
    this.playerVy = 0;
    this.isGrounded = true;
    this.worldDistance = 0;
    this.score = 0;
    this.collectedSamples = 0;
    this.combo = 1;

    // Initial platforms
    for (let i = 0; i < 4; i++) {
      this.platforms.push({
        x: 600 + i * 400,
        y: this.groundHeight - 140 - (i % 2) * 80,
        width: 220,
        height: 24,
      });
    }

    // Initial sample tubes
    for (let i = 0; i < 5; i++) {
      this.obstacles.push({
        id: `sample-${i}`,
        x: 500 + i * 320,
        y: this.groundHeight - 90 - (i % 3) * 60,
        width: 28,
        height: 28,
        type: 'SAMPLE_TUBE',
      });
    }
  }

  public triggerJump(): boolean {
    if (!this.isGrounded && Date.now() - this.lastJumpTime < 300) {
      return false;
    }

    const preset = CELESTIAL_PRESETS[this.config.preset];
    const power = preset.jumpForce * (this.isGrounded ? 1.0 : 0.85);

    this.playerVy = power;
    this.isGrounded = false;
    this.lastJumpTime = Date.now();
    this.squashX = 0.75;
    this.squashY = 1.35;

    // Spawn jump dust particles
    this.spawnDustPuff(this.playerX, this.playerY + 20, 10);
    return true;
  }

  public step(deltaTimeSec: number): void {
    const dt = Math.min(deltaTimeSec, 0.05);
    const preset = CELESTIAL_PRESETS[this.config.preset];
    const speed = preset.baseSpeed * this.config.speedMultiplier;
    const movePx = speed * dt * 60;

    this.worldDistance += movePx * 0.08;

    // Apply gravity
    this.playerVy += this.config.gravity * dt * 60;
    this.playerY += this.playerVy;

    // Rotation
    if (this.isGrounded) {
      this.rotation += movePx * 0.04;
    } else {
      this.rotation += movePx * 0.02;
    }

    // Squash & stretch spring relaxation
    this.squashX += (1 - this.squashX) * 0.15;
    this.squashY += (1 - this.squashY) * 0.15;

    // Screen shake decay
    if (this.cameraShake > 0) {
      this.cameraShake = Math.max(0, this.cameraShake - dt * 20);
    }

    // Autopilot AI decision
    if (this.config.autoPilot) {
      this.runAutoPilot(speed);
    }

    // Move world entities leftwards
    this.updateWorldEntities(movePx);

    // Collision detection with ground & platforms
    this.resolveCollisions();

    // Spawn new obstacles & platforms as world scrolls
    this.generateWorldAhead();

    // Update particles & trail
    this.updateParticles(dt);
    this.updateTrail();

    // Combo timer
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 1;
      }
    }
  }

  private runAutoPilot(speed: number): void {
    // Look ahead window in front of player
    const lookAhead = 160 + speed * 12;

    for (const obs of this.obstacles) {
      const dist = obs.x - this.playerX;
      if (dist > 20 && dist < lookAhead) {
        if (obs.type === 'PIT' || obs.type === 'BOULDER') {
          if (this.isGrounded) {
            this.triggerJump();
            break;
          }
        } else if (obs.type === 'SAMPLE_TUBE' && !obs.collected) {
          // If sample tube is high up and player is grounded, jump to collect
          if (this.isGrounded && obs.y < this.playerY - 60) {
            this.triggerJump();
            break;
          }
        }
      }
    }

    // Check platform gaps ahead
    const groundCheckX = this.playerX + lookAhead * 0.6;
    if (this.isGrounded && this.isPitAt(groundCheckX)) {
      this.triggerJump();
    }
  }

  private isPitAt(worldX: number): boolean {
    for (const obs of this.obstacles) {
      if (obs.type === 'PIT' && worldX >= obs.x && worldX <= obs.x + obs.width) {
        return true;
      }
    }
    return false;
  }

  private updateWorldEntities(movePx: number): void {
    // Move platforms
    for (const plat of this.platforms) {
      plat.x -= movePx;
    }
    this.platforms = this.platforms.filter((p) => p.x + p.width > -100);

    // Move obstacles & check pickup
    for (const obs of this.obstacles) {
      obs.x -= movePx;

      // Check collision with player
      if (!obs.collected) {
        const dx = Math.abs(obs.x - this.playerX);
        const dy = Math.abs(obs.y - this.playerY);

        if (dx < 35 && dy < 35) {
          if (obs.type === 'SAMPLE_TUBE') {
            obs.collected = true;
            this.collectedSamples += 1;
            this.combo = Math.min(8, this.combo + 1);
            this.comboTimer = 3.5;
            this.score += 100 * this.combo;
            this.spawnCollectSparkles(obs.x, obs.y, 16);
            this.cameraShake = 4;
          } else if (obs.type === 'JUMP_PAD') {
            this.playerVy = -14.5;
            this.isGrounded = false;
            this.cameraShake = 6;
            this.spawnDustPuff(obs.x, obs.y, 14);
          } else if (obs.type === 'FLAG') {
            obs.collected = true;
            this.score += 500;
            this.spawnCollectSparkles(obs.x, obs.y, 25);
          }
        }
      }
    }
    this.obstacles = this.obstacles.filter((o) => o.x + o.width > -150);
  }

  private resolveCollisions(): void {
    let hitSurface = false;
    let surfaceY = this.groundHeight;

    // Check if player is above any platform
    for (const plat of this.platforms) {
      if (
        this.playerX >= plat.x - 20 &&
        this.playerX <= plat.x + plat.width + 20 &&
        this.playerY + 20 >= plat.y &&
        this.playerY - this.playerVy <= plat.y + 10
      ) {
        surfaceY = plat.y - 20;
        hitSurface = true;
        break;
      }
    }

    // Default ground level (check for pits)
    if (!hitSurface) {
      const insidePit = this.isPitAt(this.playerX);
      if (!insidePit) {
        if (this.playerY >= this.groundHeight - 20) {
          surfaceY = this.groundHeight - 20;
          hitSurface = true;
        }
      }
    }

    if (hitSurface && this.playerVy >= 0) {
      if (!this.isGrounded && this.playerVy > 4) {
        // Landing impact
        this.squashX = 1.35;
        this.squashY = 0.75;
        this.spawnDustPuff(this.playerX, surfaceY + 20, 8);
        if (this.playerVy > 8) {
          this.cameraShake = 3;
        }
      }
      this.playerY = surfaceY;
      this.playerVy = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    // Rescue if fallen down a pit
    if (this.playerY > this.height + 60) {
      this.playerY = this.groundHeight - 160;
      this.playerVy = -4;
      this.isGrounded = false;
      this.combo = 1;
      this.spawnCollectSparkles(this.playerX, this.playerY, 20);
    }
  }

  private generateWorldAhead(): void {
    const maxX = Math.max(
      ...this.platforms.map((p) => p.x + p.width),
      ...this.obstacles.map((o) => o.x),
      this.width,
    );

    if (maxX < this.width + 800) {
      const spawnX = maxX + 220 + Math.random() * 180;
      const roll = Math.random();

      if (roll < 0.35) {
        // Spawn high platform with sample tube
        const platY = this.groundHeight - 120 - Math.random() * 120;
        const platWidth = 180 + Math.random() * 140;
        this.platforms.push({
          x: spawnX,
          y: platY,
          width: platWidth,
          height: 22,
        });

        this.obstacles.push({
          id: `sample-${Date.now()}-${Math.random()}`,
          x: spawnX + platWidth * 0.5,
          y: platY - 45,
          width: 26,
          height: 26,
          type: 'SAMPLE_TUBE',
        });
      } else if (roll < 0.6) {
        // Boulder hazard or crater pit
        if (Math.random() > 0.5) {
          this.obstacles.push({
            id: `boulder-${Date.now()}`,
            x: spawnX,
            y: this.groundHeight - 28,
            width: 38,
            height: 38,
            type: 'BOULDER',
          });
        } else {
          this.obstacles.push({
            id: `pit-${Date.now()}`,
            x: spawnX,
            y: this.groundHeight,
            width: 140 + Math.random() * 100,
            height: 120,
            type: 'PIT',
          });
        }
      } else if (roll < 0.8) {
        // Geyser / Jump pad
        this.obstacles.push({
          id: `jumppad-${Date.now()}`,
          x: spawnX,
          y: this.groundHeight - 12,
          width: 44,
          height: 16,
          type: 'JUMP_PAD',
        });
      } else {
        // NASA Mission Flag Checkpoint
        this.obstacles.push({
          id: `flag-${Date.now()}`,
          x: spawnX,
          y: this.groundHeight - 65,
          width: 32,
          height: 65,
          type: 'FLAG',
        });
      }
    }
  }

  private spawnDustPuff(x: number, y: number, count: number): void {
    const preset = CELESTIAL_PRESETS[this.config.preset];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 4 - 1.5,
        vy: -Math.random() * 3.5,
        size: Math.random() * 4 + 2,
        color: preset.dustColor,
        alpha: 0.8,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.4,
      });
    }
  }

  private spawnCollectSparkles(x: number, y: number, count: number): void {
    const preset = CELESTIAL_PRESETS[this.config.preset];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 5 + 3,
        color: preset.accentGlow,
        alpha: 1,
        life: 0,
        maxLife: 0.7 + Math.random() * 0.5,
      });
    }
  }

  private updateParticles(dt: number): void {
    for (const p of this.particles) {
      p.life += dt;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += this.config.gravity * 0.2;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
    }
    this.particles = this.particles.filter((p) => p.life < p.maxLife);
  }

  private updateTrail(): void {
    this.trail.unshift({
      x: this.playerX,
      y: this.playerY,
      alpha: 0.8,
    });

    if (this.trail.length > 18) {
      this.trail.pop();
    }

    for (let i = 0; i < this.trail.length; i++) {
      const pt = this.trail[i];
      if (pt) {
        pt.alpha = 0.8 * (1 - i / this.trail.length);
      }
    }
  }

  public getTelemetry(): TelemetryMetrics {
    const preset = CELESTIAL_PRESETS[this.config.preset];
    const speed = preset.baseSpeed * this.config.speedMultiplier * 7.5;
    const altitude = Math.max(0, (this.groundHeight - this.playerY) * 0.25);

    return {
      distanceMeters: Math.floor(this.worldDistance),
      currentSpeedKmH: Math.round(speed),
      gravityMps2: preset.gravityDisplay,
      altitudeMeters: Math.round(altitude),
      score: this.score,
      collectedSamples: this.collectedSamples,
      comboMultiplier: this.combo,
      environmentName: preset.name,
    };
  }

  // Canvas Drawing
  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Camera shake offset
    if (this.cameraShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.cameraShake * 2;
      const shakeY = (Math.random() - 0.5) * this.cameraShake * 2;
      ctx.translate(shakeX, shakeY);
    }

    const preset = CELESTIAL_PRESETS[this.config.preset];

    // 1. Sky Gradient Background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    skyGrad.addColorStop(0, preset.skyGradient[0]);
    skyGrad.addColorStop(0.7, preset.skyGradient[1]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Stars
    ctx.fillStyle = '#ffffff';
    for (const star of this.stars) {
      star.alpha += star.twinkleSpeed;
      if (star.alpha > 0.95 || star.alpha < 0.2) {
        star.twinkleSpeed = -star.twinkleSpeed;
      }
      ctx.globalAlpha = star.alpha;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 3. Horizon Celestial Body (Earth / Phobos / Jupiter)
    this.renderHorizonCelestial(ctx, preset.horizonCelestial);

    // 4. Distant Parallax Mountain Ridges
    this.renderParallaxMountains(ctx, preset.groundColor);

    // 5. Ground Surface & Crater Pits
    this.renderGround(ctx, preset.groundColor, preset.groundHighlight);

    // 6. Floating Platforms
    this.renderPlatforms(ctx, preset.groundHighlight, preset.accentGlow);

    // 7. Obstacles (Boulders, Sample Tubes, Jump Pads, Flags)
    this.renderObstacles(ctx, preset.accentGlow);

    // 8. Particles
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 9. Player Motion Trail
    this.renderPlayerTrail(ctx, preset.accentGlow);

    // 10. Player Avatar (Sphere, Rover, or Astronaut)
    this.renderPlayerAvatar(ctx);

    // 11. NASA Telemetry HUD Overlay
    if (this.config.showTelemetry) {
      this.renderTelemetryHUD(ctx);
    }

    ctx.restore();
  }

  private renderHorizonCelestial(
    ctx: CanvasRenderingContext2D,
    type: 'EARTH' | 'PHOBOS' | 'JUPITER',
  ): void {
    const cx = this.width * 0.82;
    const cy = this.height * 0.22;

    ctx.save();
    if (type === 'EARTH') {
      // Earth disk
      const r = 70;
      const grad = ctx.createRadialGradient(cx - 15, cy - 15, 10, cx, cy, r);
      grad.addColorStop(0, '#60a5fa');
      grad.addColorStop(0.6, '#1d4ed8');
      grad.addColorStop(1, '#0f172a');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric glow halo
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.4)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
      ctx.stroke();
    } else if (type === 'PHOBOS') {
      // Phobos irregular moon
      const r = 40;
      ctx.fillStyle = '#78716c';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'JUPITER') {
      // Giant Jupiter with stripes
      const r = 110;
      const jgrad = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
      jgrad.addColorStop(0, '#fed7aa');
      jgrad.addColorStop(0.3, '#c2410c');
      jgrad.addColorStop(0.5, '#ffedd5');
      jgrad.addColorStop(0.7, '#ea580c');
      jgrad.addColorStop(1, '#7c2d12');

      ctx.fillStyle = jgrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Great Red Spot
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.ellipse(cx + 25, cy + 20, 22, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderParallaxMountains(ctx: CanvasRenderingContext2D, _baseColor: string): void {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.beginPath();
    ctx.moveTo(0, this.groundHeight);

    const step = 80;
    const offset = (this.worldDistance * 0.15) % step;
    for (let x = -offset; x < this.width + step; x += step) {
      const peakY = this.groundHeight - 120 - Math.sin((x + offset) * 0.02) * 60;
      ctx.lineTo(x, peakY);
    }
    ctx.lineTo(this.width, this.height);
    ctx.lineTo(0, this.height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private renderGround(
    ctx: CanvasRenderingContext2D,
    groundColor: string,
    highlightColor: string,
  ): void {
    ctx.save();

    // Fill main ground body
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, this.groundHeight, this.width, this.height - this.groundHeight);

    // Top lighted ridge line
    ctx.strokeStyle = highlightColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, this.groundHeight);

    // Render pits as downward gaps in the line
    for (let x = 0; x < this.width; x += 10) {
      if (this.isPitAt(x)) {
        ctx.lineTo(x, this.groundHeight + 90);
      } else {
        ctx.lineTo(x, this.groundHeight);
      }
    }
    ctx.stroke();

    // Darken pits
    for (const obs of this.obstacles) {
      if (obs.type === 'PIT') {
        ctx.fillStyle = '#05070d';
        ctx.fillRect(obs.x, this.groundHeight, obs.width, this.height - this.groundHeight);
      }
    }

    ctx.restore();
  }

  private renderPlatforms(
    ctx: CanvasRenderingContext2D,
    highlightColor: string,
    accentGlow: string,
  ): void {
    ctx.save();
    for (const plat of this.platforms) {
      // Glow under platform
      ctx.shadowColor = accentGlow;
      ctx.shadowBlur = 12;

      ctx.fillStyle = highlightColor;
      ctx.beginPath();
      ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 8);
      ctx.fill();

      // Top edge highlight
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(plat.x, plat.y);
      ctx.lineTo(plat.x + plat.width, plat.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderObstacles(ctx: CanvasRenderingContext2D, accentGlow: string): void {
    ctx.save();
    for (const obs of this.obstacles) {
      if (obs.type === 'SAMPLE_TUBE' && !obs.collected) {
        // Golden/Cyan glowing NASA sample tube
        ctx.save();
        ctx.shadowColor = accentGlow;
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.roundRect(obs.x - 8, obs.y - 14, 16, 28, 6);
        ctx.fill();

        // Inner glowing core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (obs.type === 'BOULDER') {
        // Lunar / Martian jagged boulder
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, 20, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.type === 'JUMP_PAD') {
        // Cryo-geyser or launch pad
        ctx.fillStyle = accentGlow;
        ctx.beginPath();
        ctx.roundRect(obs.x - 22, obs.y - 6, 44, 12, 4);
        ctx.fill();
      } else if (obs.type === 'FLAG') {
        // Apollo / CosmoLost flag
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y + 60);
        ctx.lineTo(obs.x, obs.y);
        ctx.stroke();

        ctx.fillStyle = obs.collected ? '#22c55e' : '#ef4444';
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y);
        ctx.lineTo(obs.x + 24, obs.y + 10);
        ctx.lineTo(obs.x, obs.y + 20);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  }

  private renderPlayerTrail(ctx: CanvasRenderingContext2D, glowColor: string): void {
    if (this.trail.length < 2) return;
    ctx.save();
    ctx.strokeStyle = glowColor;
    ctx.lineCap = 'round';

    for (let i = 0; i < this.trail.length - 1; i++) {
      const p1 = this.trail[i];
      const p2 = this.trail[i + 1];
      if (!p1 || !p2) continue;
      ctx.globalAlpha = p1.alpha * 0.7;
      ctx.lineWidth = 14 * (1 - i / this.trail.length);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderPlayerAvatar(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.playerX, this.playerY);
    ctx.scale(this.squashX, this.squashY);

    const avatar = this.config.avatar;

    if (avatar === 'COSMIC_SPHERE') {
      // Satisfying glowing neon sphere
      ctx.rotate(this.rotation);
      const r = 24;

      // Glow halo
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 20;

      // 3D Sphere gradient
      const sGrad = ctx.createRadialGradient(-8, -8, 2, 0, 0, r);
      sGrad.addColorStop(0, '#ffffff');
      sGrad.addColorStop(0.3, '#38bdf8');
      sGrad.addColorStop(0.8, '#0284c7');
      sGrad.addColorStop(1, '#082f49');

      ctx.fillStyle = sGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Specular highlight spot
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(-7, -7, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (avatar === 'LUNAR_ROVER') {
      // 6-wheeled NASA Rover
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 10;

      // Chassis
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.roundRect(-28, -14, 56, 18, 5);
      ctx.fill();

      // Cabin / Science Mast
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-8, -26, 16, 12);

      // Antenna
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-16, -14);
      ctx.lineTo(-20, -28);
      ctx.stroke();

      // Wheels
      const wheelOffsets = [-20, 0, 20];
      for (const ox of wheelOffsets) {
        ctx.save();
        ctx.translate(ox, 10);
        ctx.rotate(this.rotation * 1.5);
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-8, 0);
        ctx.lineTo(8, 0);
        ctx.moveTo(0, -8);
        ctx.lineTo(0, 8);
        ctx.stroke();
        ctx.restore();
      }
    } else if (avatar === 'JETPACK_ASTRONAUT') {
      // Chibi EVA Astronaut
      ctx.rotate(this.playerVy * 0.03);

      // Jetpack Thruster Flames if jumping
      if (!this.isGrounded) {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(-18, 10);
        ctx.lineTo(-24, 26 + Math.random() * 8);
        ctx.lineTo(-12, 10);
        ctx.fill();
      }

      // Spacesuit Body
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(-16, -10, 32, 28, 8);
      ctx.fill();

      // Helmet
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(0, -18, 16, 0, Math.PI * 2);
      ctx.fill();

      // Golden Visor
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.roundRect(2, -24, 14, 12, 4);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderTelemetryHUD(ctx: CanvasRenderingContext2D): void {
    const telemetry = this.getTelemetry();
    ctx.save();

    // Top NASA Mission Banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(20, 30, this.width - 40, 60);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(20, 30, this.width - 40, 60);

    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('NASA COSMOLOST • B-ROLL EXPLORATION SIMULATOR', 40, 66);

    if (this.config.autoPilot) {
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('● AI AUTOPILOT ACTIVE', this.width - 240, 66);
    }

    // Telemetry Gauges (Speed, Gravity, Altitude, Samples, Score)
    const hudY = 110;
    const items = [
      { label: 'GRAVITY', val: `${telemetry.gravityMps2} m/s²` },
      { label: 'SPEED', val: `${telemetry.currentSpeedKmH} km/h` },
      { label: 'ALTITUDE', val: `${telemetry.altitudeMeters} m` },
      { label: 'SAMPLES', val: `${telemetry.collectedSamples}` },
      { label: 'SCORE', val: `${telemetry.score}` },
    ];

    let currX = 20;
    const boxW = (this.width - 40 - (items.length - 1) * 12) / items.length;

    for (const it of items) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(currX, hudY, boxW, 56);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.strokeRect(currX, hudY, boxW, 56);

      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(it.label, currX + 12, hudY + 20);

      ctx.font = 'bold 18px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(it.val, currX + 12, hudY + 44);

      currX += boxW + 12;
    }

    // Active Combo badge
    if (this.combo > 1) {
      ctx.save();
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(`x${this.combo} DOPAMINE COMBO!`, 30, hudY + 100);
      ctx.restore();
    }

    ctx.restore();
  }
}
