-- =============================================================================
-- CosmoLost: PostgreSQL 16 DDL Schema (7+1 Tables)
-- Specification Version: v0.5.8 (APPROVED)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- -----------------------------------------------------------------------------
-- 1. CELESTIAL_BODIES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS celestial_bodies (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    radius_km DOUBLE PRECISION NOT NULL,
    gravity_ms2 DOUBLE PRECISION NOT NULL,
    coordinate_system_type VARCHAR(32) NOT NULL DEFAULT 'SELENOGRAPHIC',
    wmts_tile_url VARCHAR(512) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. MISSIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS missions (
    id VARCHAR(64) PRIMARY KEY,
    nssdca_id VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    agency VARCHAR(64) NOT NULL DEFAULT 'NASA',
    launch_date DATE,
    landing_date DATE,
    end_date DATE,
    summary TEXT NOT NULL
);

-- -----------------------------------------------------------------------------
-- 3. ARTIFACTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS artifacts (
    id VARCHAR(64) PRIMARY KEY,
    mission_id VARCHAR(64) NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    celestial_body_id VARCHAR(32) NOT NULL REFERENCES celestial_bodies(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    artifact_type VARCHAR(32) NOT NULL DEFAULT 'ROVER',
    operational_status VARCHAR(32) NOT NULL DEFAULT 'DORMANT',
    latitude DOUBLE PRECISION NOT NULL CHECK (latitude >= -90.0 AND latitude <= 90.0),
    longitude DOUBLE PRECISION NOT NULL,
    elevation_m DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    location_name VARCHAR(128) NOT NULL,
    mass_kg DOUBLE PRECISION,
    last_contact_sol INTEGER,
    cause_of_deactivation TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_nasa_hardware BOOLEAN NOT NULL DEFAULT TRUE,
    first_person_monologue TEXT NOT NULL,
    model_3d_url VARCHAR(512),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artifacts_body_feat ON artifacts (celestial_body_id, is_featured);
CREATE INDEX IF NOT EXISTS idx_artifacts_type ON artifacts (artifact_type);
CREATE INDEX IF NOT EXISTS idx_artifacts_search ON artifacts USING gin (
    to_tsvector('english', name || ' ' || location_name)
);

-- -----------------------------------------------------------------------------
-- 4. TRAVERSE_WAYPOINTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS traverse_waypoints (
    id VARCHAR(64) PRIMARY KEY,
    artifact_id VARCHAR(64) NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
    sol_or_step INTEGER NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    elevation_m DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    odometry_m DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    telemetry_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    story_snippet TEXT
);

CREATE INDEX IF NOT EXISTS idx_waypoints_artifact_sol ON traverse_waypoints (artifact_id, sol_or_step);

-- -----------------------------------------------------------------------------
-- 5. SCIENTIFIC_DISCOVERIES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scientific_discoveries (
    id VARCHAR(64) PRIMARY KEY,
    artifact_id VARCHAR(64) NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
    instrument_acronym VARCHAR(32) NOT NULL,
    instrument_full_name VARCHAR(256) NOT NULL,
    title VARCHAR(256) NOT NULL,
    kid_friendly_story TEXT NOT NULL,
    scientific_fact TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_discoveries_artifact ON scientific_discoveries (artifact_id);

-- -----------------------------------------------------------------------------
-- 6. ARTIFACT_MEDIA
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS artifact_media (
    id VARCHAR(64) PRIMARY KEY,
    artifact_id VARCHAR(64) NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
    media_category VARCHAR(32) NOT NULL,
    media_url VARCHAR(512) NOT NULL,
    nasa_id_or_pia VARCHAR(64),
    caption VARCHAR(512) NOT NULL,
    credit VARCHAR(256) NOT NULL DEFAULT 'NASA/JPL-Caltech'
);

CREATE INDEX IF NOT EXISTS idx_media_artifact ON artifact_media (artifact_id);

-- -----------------------------------------------------------------------------
-- 7. COMMUNITY_PUBLICATIONS (Future Community Videos / Moderation)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS community_publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id VARCHAR(64) NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    artifact_id VARCHAR(64) REFERENCES artifacts(id) ON DELETE SET NULL,
    title VARCHAR(256) NOT NULL,
    video_url VARCHAR(512) NOT NULL,
    platform_type VARCHAR(32) NOT NULL DEFAULT 'YOUTUBE',
    source_references TEXT NOT NULL,
    author_name VARCHAR(128) NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comm_pub_mission_approved ON community_publications (mission_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_comm_pub_artifact_approved ON community_publications (artifact_id, is_approved);
