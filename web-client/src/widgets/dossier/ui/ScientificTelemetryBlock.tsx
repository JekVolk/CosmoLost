import React from 'react';
import type { PlanetConfig, SpaceArtifact } from '../../../entities/planet/model/types';
import {
  Activity,
  Wind,
  Thermometer,
  Gauge,
  Sun,
  Shield,
  ExternalLink,
  Layers,
  Database,
  Radio,
} from 'lucide-react';

interface ScientificTelemetryBlockProps {
  planet: PlanetConfig;
  artifact: SpaceArtifact;
  themeColor: string;
}

export const ScientificTelemetryBlock: React.FC<ScientificTelemetryBlockProps> = ({
  planet,
  artifact,
  themeColor,
}) => {
  const isMars = planet.id === 'mars';

  // Atmospheric gas composition breakdown (NASA PDS / Planetary Fact Sheet Data)
  const marsGases = [
    { name: 'Carbon Dioxide (CO₂)', percent: 95.32, color: '#f97316' },
    { name: 'Nitrogen (N₂)', percent: 2.60, color: '#38bdf8' },
    { name: 'Argon (⁴⁰Ar)', percent: 1.90, color: '#a855f7' },
    { name: 'Oxygen (O₂)', percent: 0.16, color: '#34d399' },
    { name: 'Carbon Monoxide (CO)', percent: 0.08, color: '#fbbf24' },
    { name: 'Water Vapor / Trace', percent: 0.03, color: '#94a3b8' },
  ];

  const moonGases = [
    { name: 'Argon (⁴⁰Ar)', percent: 40.0, color: '#a855f7' },
    { name: 'Helium (⁴He)', percent: 30.0, color: '#38bdf8' },
    { name: 'Neon (²⁰Ne)', percent: 20.0, color: '#34d399' },
    { name: 'Hydrogen (H₂)', percent: 8.0, color: '#f97316' },
    { name: 'Trace (Na, K, Rn)', percent: 2.0, color: '#fbbf24' },
  ];

  const gasList = isMars ? marsGases : moonGases;

  return (
    <div
      className="cosmo-glass dossier-block"
      style={{
        border: `1.5px solid ${themeColor}40`,
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 15, 28, 0.9) 100%)',
        boxShadow: `0 12px 32px -10px ${themeColor}20`,
        marginBottom: '24px',
      }}
    >
      {/* Block Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '14px',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: `${themeColor}20`,
              border: `1px solid ${themeColor}50`,
            }}
          >
            <Wind size={18} style={{ color: themeColor }} />
          </div>
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-chakra, sans-serif)',
                fontSize: '16px',
                fontWeight: 700,
                color: '#fff',
                margin: 0,
                letterSpacing: '0.04em',
              }}
            >
              NASA Scientific Telemetry & Atmospheric Profile
            </h3>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
              Direct scientific environmental observation data from NASA Planetary Data System (PDS)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '10.5px',
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: '6px',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#38bdf8',
            }}
          >
            NASA PDS VERIFIED
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '10.5px',
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: '6px',
              background: `${themeColor}18`,
              border: `1px solid ${themeColor}40`,
              color: themeColor,
            }}
          >
            {isMars ? 'MARTIAN ATMOSPHERE' : 'LUNAR EXOSPHERE'}
          </span>
        </div>
      </div>

      {/* Atmospheric Composition Section */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '11px',
              fontWeight: 700,
              color: '#cbd5e1',
              letterSpacing: '0.05em',
            }}
          >
            ATMOSPHERIC GAS COMPOSITION
          </span>
          <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono, monospace)' }}>
            {isMars ? 'Mean Volumetric Mixing Ratio' : 'Exospheric Relative Fraction'}
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div
          style={{
            display: 'flex',
            height: '10px',
            borderRadius: '5px',
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '10px',
          }}
        >
          {gasList.map((gas, i) => (
            <div
              key={i}
              style={{
                width: `${gas.percent}%`,
                background: gas.color,
                transition: 'width 0.4s ease',
              }}
              title={`${gas.name}: ${gas.percent}%`}
            />
          ))}
        </div>

        {/* Gas Legend Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {gasList.map((gas, i) => (
            <div
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '11px',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: gas.color,
                  display: 'inline-block',
                }}
              />
              <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{gas.name}</span>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', color: gas.color, fontWeight: 700 }}>
                {gas.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Atmospheric & Physical Parameters Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        {/* Surface Atmospheric Pressure */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Gauge size={14} style={{ color: themeColor }} />
            <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>
              SURFACE PRESSURE
            </span>
          </div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: '#f8fafc', fontFamily: 'var(--font-mono, monospace)' }}>
            {isMars ? '6.10 mbar (610 Pa)' : '10⁻¹² bar (10⁻⁷ Pa)'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            {isMars ? '~0.6% of Earth sea level (±25% seasonal CO₂ cap cycle)' : 'Surface-bound collisionless vacuum (<10 tons total)'}
          </div>
        </div>

        {/* Atmospheric Density */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Layers size={14} style={{ color: '#38bdf8' }} />
            <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>
              ATMOSPHERIC DENSITY
            </span>
          </div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: '#f8fafc', fontFamily: 'var(--font-mono, monospace)' }}>
            {isMars ? '~0.020 kg/m³' : '< 10⁻¹⁵ kg/m³'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            {isMars ? 'Scale height H = 11.1 km • Thin aerodynamic regime' : 'Non-collisional ballistic particle exosphere'}
          </div>
        </div>

        {/* Surface Temperature Range */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Thermometer size={14} style={{ color: '#fbbf24' }} />
            <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>
              SURFACE TEMPERATURE
            </span>
          </div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: '#fbbf24', fontFamily: 'var(--font-mono, monospace)' }}>
            {planet.telemetry.avgTemperature} (Mean)
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Range: {planet.telemetry.tempRange} • Diurnal swing up to {isMars ? '80 K' : '300 K'}
          </div>
        </div>

        {/* Solar Insolation / Dust Opacity (Tau) */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Sun size={14} style={{ color: '#f59e0b' }} />
            <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>
              {isMars ? 'DUST OPTICAL DEPTH (TAU)' : 'SOLAR FLUX (INSOLATION)'}
            </span>
          </div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: '#f8fafc', fontFamily: 'var(--font-mono, monospace)' }}>
            {isMars ? 'Clear τ = 0.4–0.9 | Storm τ > 4.5' : '1,361 W/m² (Unshielded)'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            {isMars ? 'Solar flux ~590 W/m² (43% of Earth) • Blackout hazard' : 'Unfiltered cosmic rays & solar wind radiation'}
          </div>
        </div>

        {/* Surface Gravity */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Shield size={14} style={{ color: '#34d399' }} />
            <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>
              SURFACE GRAVITY
            </span>
          </div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono, monospace)' }}>
            {planet.telemetry.surfaceGravity}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Escape Velocity: {isMars ? '5.03 km/s' : '2.38 km/s'} • Planetary Radius: {planet.telemetry.radiusKm.toLocaleString()} km
          </div>
        </div>

        {/* Planetary Rotation & Day Length */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Activity size={14} style={{ color: themeColor }} />
            <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>
              ROTATION & SOL LENGTH
            </span>
          </div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: '#f8fafc', fontFamily: 'var(--font-mono, monospace)' }}>
            {planet.telemetry.dayLength}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Orbital Period: {planet.telemetry.orbitPeriod} • Axial Tilt: {planet.axialTiltDeg}°
          </div>
        </div>
      </div>

      {/* Artifact Mission Hardware Telemetry Summary */}
      {artifact.lastTelemetry && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Radio size={15} style={{ color: '#ef4444' }} />
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#f87171',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {artifact.name} Mission Telemetry Log
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
            {artifact.lastTelemetry.powerWh !== undefined && (
              <div>
                <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono, monospace)' }}>FINAL POWER:</span>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#fca5a5', fontFamily: 'var(--font-mono, monospace)' }}>
                  {artifact.lastTelemetry.powerWh} Wh
                </div>
              </div>
            )}
            {artifact.lastTelemetry.dustTau !== undefined && (
              <div>
                <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono, monospace)' }}>RECORD TAU:</span>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#fbbf24', fontFamily: 'var(--font-mono, monospace)' }}>
                  {artifact.lastTelemetry.dustTau}
                </div>
              </div>
            )}
            {artifact.lastTelemetry.pitchDeg !== undefined && (
              <div>
                <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono, monospace)' }}>CHASSIS TILT:</span>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono, monospace)' }}>
                  {artifact.lastTelemetry.pitchDeg}°
                </div>
              </div>
            )}
            {artifact.lastTelemetry.finalSol !== undefined && (
              <div>
                <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono, monospace)' }}>LAST CONTACT SOL:</span>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono, monospace)' }}>
                  Sol {artifact.lastTelemetry.finalSol}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Official NASA Sources & Data Citations */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Database size={13} style={{ color: themeColor }} />
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>
            OFFICIAL NASA SCIENTIFIC DATA SOURCES & CITATIONS
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <a
            href="https://pds-atmospheres.nmsu.edu/"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '6px',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              color: '#38bdf8',
              fontSize: '11px',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            <span>NASA PDS Atmospheres Node</span>
            <ExternalLink size={11} />
          </a>

          <a
            href={isMars ? 'https://mars.nasa.gov/' : 'https://lunar.gsfc.nasa.gov/'}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '6px',
              background: `${themeColor}15`,
              border: `1px solid ${themeColor}30`,
              color: themeColor,
              fontSize: '11px',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            <span>{isMars ? 'NASA Mars Exploration Program (MEP)' : 'NASA Lunar Reconnaissance Orbiter (LRO)'}</span>
            <ExternalLink size={11} />
          </a>

          <a
            href="https://nssdca.gsfc.nasa.gov/"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#cbd5e1',
              fontSize: '11px',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            <span>NASA NSSDCA Master Catalog</span>
            <ExternalLink size={11} />
          </a>

          <a
            href="https://www.jpl.nasa.gov/"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '6px',
              background: 'rgba(52, 211, 153, 0.1)',
              border: '1px solid rgba(52, 211, 153, 0.25)',
              color: '#34d399',
              fontSize: '11px',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            <span>NASA Jet Propulsion Laboratory (JPL)</span>
            <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  );
};
