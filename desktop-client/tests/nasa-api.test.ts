import { describe, expect, it } from 'vitest';
import { nasaApi } from '../src/shared/api/nasa';

describe('NASA Open Data & CDN Client', () => {
  it('returns verified catalog for Opportunity rover', async () => {
    const assets = await nasaApi.getArtifactAssets('opportunity-rover');

    expect(assets.artifactId).toBe('opportunity-rover');
    expect(assets.name).toContain('Opportunity');
    expect(assets.photos.length).toBeGreaterThan(0);
    expect(assets.photos[0].nasaId).toBe('PIA22521');
    expect(assets.photos[0].fullResUrl).toContain('PIA22521.jpg');
    expect(assets.model3dGlbUrl).toContain('opportunity.glb');
    expect(assets.telemetrySnapshot?.sol).toBe(5111);
    expect(assets.telemetrySnapshot?.coordinates?.locationName).toContain('Perseverance Valley');
  });

  it('returns verified catalog for Spirit rover', async () => {
    const assets = await nasaApi.getArtifactAssets('spirit-rover');

    expect(assets.artifactId).toBe('spirit-rover');
    expect(assets.telemetrySnapshot?.sol).toBe(2210);
    expect(assets.telemetrySnapshot?.coordinates?.locationName).toContain('Troy');
  });

  it('returns verified catalog for Apollo 11 Eagle', async () => {
    const assets = await nasaApi.getArtifactAssets('apollo-11-lm-eagle');

    expect(assets.artifactId).toBe('apollo-11-lm-eagle');
    expect(assets.model3dGlbUrl).toContain('lunar_module.glb');
    expect(assets.telemetrySnapshot?.coordinates?.locationName).toContain('Tranquility Base');
  });

  it('provides graceful fallback for unknown artifact query', async () => {
    const assets = await nasaApi.getArtifactAssets('unknown-space-probe-404');

    expect(assets.artifactId).toBe('unknown-space-probe-404');
    expect(assets.name).toBe('UNKNOWN SPACE PROBE 404');
    expect(assets.telemetrySnapshot?.batteryLevelPct).toBe(80);
  });

  it('provides planetary tile configs for Mars and Moon', () => {
    const mars = nasaApi.getPlanetConfig('mars');
    expect(mars.planetId).toBe('mars');
    expect(mars.radiusKm).toBe(3396.2);
    expect(mars.gravityMs2).toBe(3.72);
    expect(mars.wmtsTileUrl).toContain('trek.nasa.gov');

    const moon = nasaApi.getPlanetConfig('moon');
    expect(moon.planetId).toBe('moon');
    expect(moon.radiusKm).toBe(1737.4);
    expect(moon.gravityMs2).toBe(1.62);
  });

  it('lists all local catalog artifacts', () => {
    const list = nasaApi.listCatalogArtifacts();
    expect(list.length).toBeGreaterThanOrEqual(3);
    const ids = list.map((a) => a.artifactId);
    expect(ids).toContain('opportunity-rover');
    expect(ids).toContain('spirit-rover');
    expect(ids).toContain('apollo-11-lm-eagle');
  });
});
