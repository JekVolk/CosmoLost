"""
CosmoLost Database Models (Django ORM / PostgreSQL 16)
Specification Version: v0.5.8 (APPROVED)
"""

import uuid
from django.db import models
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVector


# =============================================================================
# ENUMS (TextChoices)
# =============================================================================

class CoordinateSystemType(models.TextChoices):
    SELENOGRAPHIC = "SELENOGRAPHIC", "Selenographic (Moon, lon -180..180)"
    PLANETOCENTRIC_360 = "PLANETOCENTRIC_360", "Planetocentric East (Mars IAU 2000, lon 0..360)"


class ArtifactType(models.TextChoices):
    ROVER = "ROVER", "Rover (Spirit, Opportunity, Apollo LRV)"
    HELICOPTER = "HELICOPTER", "Atmospheric Drone (Ingenuity)"
    LANDER = "LANDER", "Stationary Lander (Viking 1/2, InSight, Phoenix)"
    DESCENT_STAGE = "DESCENT_STAGE", "Descent Stage (Apollo 11 LM Eagle)"
    IMPACT_STAGE = "IMPACT_STAGE", "Seismic Impact Stage (Saturn V S-IVB)"
    INSTRUMENT = "INSTRUMENT", "Surface Instrument (ALSEP, SEIS)"
    RETRO_REFLECTOR = "RETRO_REFLECTOR", "Passive Laser Retro-Reflector (Apollo LRRR)"
    SAMPLE_TUBE = "SAMPLE_TUBE", "Sealed Sample Tube (Three Forks Depot)"
    ENTRY_DEBRIS = "ENTRY_DEBRIS", "Entry Debris (Backshell, Parachute, Heat Shield)"
    DEEP_SPACE_PROBE = "DEEP_SPACE_PROBE", "Deep Space Probe (Voyager 1/2, Pioneer)"


class OperationalStatus(models.TextChoices):
    DORMANT = "DORMANT", "Dormant (Deactivated, awaiting human discovery)"
    PASSIVE_ACTIVE = "PASSIVE_ACTIVE", "Passive Active (Reflects Earth lasers without power)"
    DESTROYED_ON_IMPACT = "DESTROYED_ON_IMPACT", "Destroyed on Impact (Deliberate seismic test)"
    ACTIVE_TRANSMITTING = "ACTIVE_TRANSMITTING", "Active Transmitting (Voyager Deep Space)"


class MediaCategory(models.TextChoices):
    SURFACE_FIRST_PERSON = "SURFACE_FIRST_PERSON", "Surface Photo (Mastcam/Pancam/Hazcam)"
    LAST_KNOWN_PHOTO = "LAST_KNOWN_PHOTO", "Last Known Photo before Silence"
    ORBITAL_PROOF_LROC_HIRISE = "ORBITAL_PROOF_LROC_HIRISE", "Orbital Reconnaissance (LROC/HiRISE)"
    MODEL_3D = "MODEL_3D", "Interactive 3D Model (.glb)"
    AUDIO_RECORDING = "AUDIO_RECORDING", "Surface Audio Recording (InSight/Perseverance)"


class PlatformType(models.TextChoices):
    YOUTUBE = "YOUTUBE", "YouTube Shorts / Video"
    TIKTOK = "TIKTOK", "TikTok Video"
    REELS = "REELS", "Instagram Reels"
    OTHER = "OTHER", "Other Video Platform"


# =============================================================================
# MODELS
# =============================================================================

class CelestialBody(models.Model):
    """
    Physical parameters and WMTS tile configuration for Moon and Mars.
    """
    id = models.CharField(max_length=32, primary_key=True, help_text="e.g. 'moon', 'mars'")
    name = models.CharField(max_length=64, help_text="Human-readable celestial body name")
    radius_km = models.FloatField(help_text="Equatorial radius in kilometers (1737.4 for Moon, 3396.2 for Mars)")
    gravity_ms2 = models.FloatField(help_text="Surface gravity in m/s^2 (1.62 for Moon, 3.72 for Mars)")
    coordinate_system_type = models.CharField(
        max_length=32,
        choices=CoordinateSystemType.choices,
        default=CoordinateSystemType.SELENOGRAPHIC
    )
    wmts_tile_url = models.URLField(max_length=512, help_text="NASA Treks WMTS tile template URL for Three.js sphere")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "celestial_bodies"
        verbose_name = "Celestial Body"
        verbose_name_plural = "Celestial Bodies"

    def __str__(self):
        return f"{self.name} ({self.id})"


class Mission(models.Model):
    """
    NASA Spaceflight mission or expedition from NSSDCA catalog.
    """
    id = models.CharField(max_length=64, primary_key=True, help_text="System slug: 'apollo-11', 'mars-2020'")
    nssdca_id = models.CharField(max_length=32, unique=True, help_text="Official NASA launch ID, e.g. '1969-059C'")
    name = models.CharField(max_length=128, help_text="Mission full display name")
    agency = models.CharField(max_length=64, default="NASA", help_text="Space agency (NASA, NASA/JPL)")
    launch_date = models.DateField(null=True, blank=True, help_text="Launch date from Earth")
    landing_date = models.DateField(null=True, blank=True, help_text="Landing date on the surface")
    end_date = models.DateField(null=True, blank=True, help_text="Final contact date or formal deactivation")
    summary = models.TextField(help_text="Short narrative summary of mission goals and scientific legacy")

    class Meta:
        db_table = "missions"
        verbose_name = "Mission"
        verbose_name_plural = "Missions"

    def __str__(self):
        return f"{self.name} [{self.nssdca_id}]"


class Artifact(models.Model):
    """
    Discarded equipment or historic artifact on the Moon or Mars.
    """
    id = models.CharField(max_length=64, primary_key=True, help_text="Unique slug, e.g. 'opportunity-rover'")
    mission = models.ForeignKey(Mission, on_delete=models.CASCADE, related_name="artifacts")
    celestial_body = models.ForeignKey(CelestialBody, on_delete=models.CASCADE, related_name="artifacts")
    name = models.CharField(max_length=128, help_text="Equipment name, e.g. 'Opportunity Rover (MER-B)'")
    artifact_type = models.CharField(max_length=32, choices=ArtifactType.choices, default=ArtifactType.ROVER)
    operational_status = models.CharField(
        max_length=32,
        choices=OperationalStatus.choices,
        default=OperationalStatus.DORMANT
    )
    latitude = models.FloatField(help_text="Latitude [-90.0 .. 90.0]")
    longitude = models.FloatField(help_text="Longitude (Moon: [-180..180], Mars IAU 2000: [0..360])")
    elevation_m = models.FloatField(default=0.0, help_text="Elevation from LOLA/MOLA DEM in meters")
    location_name = models.CharField(max_length=128, help_text="Region or crater, e.g. 'Perseverance Valley'")
    mass_kg = models.FloatField(null=True, blank=True, help_text="Landed dry mass in kilograms")
    last_contact_sol = models.IntegerField(null=True, blank=True, help_text="Last Sol of radio contact (5111 for Oppy)")
    cause_of_deactivation = models.TextField(null=True, blank=True, help_text="Engineering cause of failure/retirement")
    is_featured = models.BooleanField(default=False, help_text="Tier 1 curated object for homepage spotlight")
    is_nasa_hardware = models.BooleanField(default=True, help_text="True if official NASA; False if international in NASA catalog")
    first_person_monologue = models.TextField(help_text="Atmospheric 1st-person storytelling script strictly in en-US")
    model_3d_url = models.URLField(max_length=512, null=True, blank=True, help_text="URL to NASA 3D .glb file")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "artifacts"
        verbose_name = "Artifact"
        verbose_name_plural = "Artifacts"
        indexes = [
            models.Index(fields=["celestial_body", "is_featured"], name="idx_art_body_feat"),
            models.Index(fields=["artifact_type"], name="idx_art_type"),
        ]

    def __str__(self):
        return f"{self.name} ({self.location_name})"


class TraverseWaypoint(models.Model):
    """
    Telemetry step or odometry stop along a rover or drone route.
    """
    id = models.CharField(max_length=64, primary_key=True, help_text="Unique UUID or slug")
    artifact = models.ForeignKey(Artifact, on_delete=models.CASCADE, related_name="waypoints")
    sol_or_step = models.IntegerField(help_text="Sol number or sequential step index")
    latitude = models.FloatField(help_text="Waypoint latitude")
    longitude = models.FloatField(help_text="Waypoint longitude")
    elevation_m = models.FloatField(default=0.0)
    odometry_m = models.FloatField(default=0.0, help_text="Cumulative drive distance in meters")
    telemetry_snapshot = models.JSONField(default=dict, blank=True, help_text="Power (Wh), dust tau, tilt")
    story_snippet = models.TextField(null=True, blank=True, help_text="Mini-narrative event at this stop")

    class Meta:
        db_table = "traverse_waypoints"
        ordering = ["sol_or_step"]
        indexes = [
            models.Index(fields=["artifact", "sol_or_step"], name="idx_wp_art_sol"),
        ]

    def __str__(self):
        return f"{self.artifact_id} - Sol {self.sol_or_step}"


class ScientificDiscovery(models.Model):
    """
    Key scientific findings and instruments associated with an artifact.
    """
    id = models.CharField(max_length=64, primary_key=True, default=uuid.uuid4)
    artifact = models.ForeignKey(Artifact, on_delete=models.CASCADE, related_name="discoveries")
    instrument_acronym = models.CharField(max_length=32, help_text="Instrument code (Pancam, APXS, SEIS, MOXIE)")
    instrument_full_name = models.CharField(max_length=256, help_text="Full technical instrument title")
    title = models.CharField(max_length=256, help_text="Discovery headline")
    kid_friendly_story = models.TextField(help_text="Simple analogy explanation for school audiences")
    scientific_fact = models.TextField(help_text="Rigorous scientific fact from NASA PDS archives")

    class Meta:
        db_table = "scientific_discoveries"
        verbose_name = "Scientific Discovery"
        verbose_name_plural = "Scientific Discoveries"

    def __str__(self):
        return f"{self.instrument_acronym}: {self.title}"


class ArtifactMedia(models.Model):
    """
    NASA archival imagery and sound recordings streamed via direct CDN links.
    """
    id = models.CharField(max_length=64, primary_key=True, default=uuid.uuid4)
    artifact = models.ForeignKey(Artifact, on_delete=models.CASCADE, related_name="media_files")
    media_category = models.CharField(max_length=32, choices=MediaCategory.choices)
    media_url = models.URLField(max_length=512, help_text="Direct link to NASA image/audio asset CDN")
    nasa_id_or_pia = models.CharField(max_length=64, null=True, blank=True, help_text="Official PIA photo code")
    caption = models.CharField(max_length=512, help_text="Image description")
    credit = models.CharField(max_length=256, default="NASA/JPL-Caltech", help_text="Attribution line")

    class Meta:
        db_table = "artifact_media"
        verbose_name = "Artifact Media"
        verbose_name_plural = "Artifact Media Files"

    def __str__(self):
        return f"[{self.media_category}] {self.caption[:40]}"


class CommunityPublication(models.Model):
    """
    Future-ready table for community/user video submissions by mission or artifact.
    Client-side UI is in backlog [AI-DRAFT], but backend schema and API are ready now.
    User profiles / Google OAuth will link to this table in future milestones.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mission = models.ForeignKey(Mission, on_delete=models.CASCADE, related_name="community_publications")
    artifact = models.ForeignKey(
        Artifact,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="community_publications"
    )
    title = models.CharField(max_length=256, help_text="Video title or storytelling topic")
    video_url = models.URLField(max_length=512, help_text="Direct YouTube Shorts / TikTok link")
    platform_type = models.CharField(
        max_length=32,
        choices=PlatformType.choices,
        default=PlatformType.YOUTUBE
    )
    source_references = models.TextField(
        help_text="Content source citations (NASA PIA photo codes, PDS papers, catalog links)"
    )
    author_name = models.CharField(max_length=128, help_text="Creator display nickname (until Google Auth is added)")
    is_approved = models.BooleanField(default=False, help_text="Moderation approval flag for display on public portal")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "community_publications"
        verbose_name = "Community Publication"
        verbose_name_plural = "Community Publications"
        indexes = [
            models.Index(fields=["mission", "is_approved"], name="idx_comm_pub_miss_appr"),
            models.Index(fields=["artifact", "is_approved"], name="idx_comm_pub_art_appr"),
        ]

    def __str__(self):
        return f"[{self.platform_type}] {self.title} by {self.author_name}"
