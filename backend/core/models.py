import uuid
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.translation import gettext_lazy as _


def generate_uuid_str() -> str:
    """Generate stringified UUID4 for varchar primary keys."""
    return str(uuid.uuid4())


class CoordinateSystemType(models.TextChoices):
    SELENOGRAPHIC = 'SELENOGRAPHIC', _('Selenographic')
    PLANETOCENTRIC_360 = 'PLANETOCENTRIC_360', _('Planetocentric 360')


class ArtifactType(models.TextChoices):
    ROVER = 'ROVER', _('Rover')
    HELICOPTER = 'HELICOPTER', _('Helicopter')
    LANDER = 'LANDER', _('Lander')
    DESCENT_STAGE = 'DESCENT_STAGE', _('Descent Stage')
    IMPACT_STAGE = 'IMPACT_STAGE', _('Impact Stage')
    INSTRUMENT = 'INSTRUMENT', _('Instrument')
    RETRO_REFLECTOR = 'RETRO_REFLECTOR', _('Retro Reflector')
    SAMPLE_TUBE = 'SAMPLE_TUBE', _('Sample Tube')
    ENTRY_DEBRIS = 'ENTRY_DEBRIS', _('Entry Debris')
    DEEP_SPACE_PROBE = 'DEEP_SPACE_PROBE', _('Deep Space Probe')


class OperationalStatus(models.TextChoices):
    ACTIVE = 'ACTIVE', _('Active')
    SLEEPING = 'SLEEPING', _('Sleeping')
    DORMANT = 'DORMANT', _('Dormant')
    PASSIVE_ACTIVE = 'PASSIVE_ACTIVE', _('Passive Active')
    DEACTIVATED = 'DEACTIVATED', _('Deactivated')
    DESTROYED = 'DESTROYED', _('Destroyed')


class MediaCategory(models.TextChoices):
    SURFACE_PHOTO = 'SURFACE_PHOTO', _('Surface Photo')
    LAST_KNOWN_PHOTO = 'LAST_KNOWN_PHOTO', _('Last Known Photo')
    PANORAMA = 'PANORAMA', _('Panorama')
    DESCENT = 'DESCENT', _('Descent')
    ENGINEERING = 'ENGINEERING', _('Engineering')
    ORBITAL = 'ORBITAL', _('Orbital')


class PlatformType(models.TextChoices):
    YOUTUBE = 'YOUTUBE', _('YouTube')
    TIKTOK = 'TIKTOK', _('TikTok')
    REELS = 'REELS', _('Reels')


class TimeStampedModel(models.Model):
    """Abstract base model that provides self-updating created and modified fields."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class CelestialBody(models.Model):
    """Celestial body (planet/satellite), e.g. Moon, Mars."""

    id = models.CharField(
        max_length=50,
        primary_key=True,
        help_text=_("Unique slug, e.g. 'moon', 'mars'"),
    )
    name = models.CharField(
        max_length=100,
        help_text=_("Name of the celestial body"),
    )
    radius_km = models.FloatField(
        help_text=_("Mean radius in kilometers"),
    )
    gravity_ms2 = models.FloatField(
        help_text=_("Surface gravity in m/s^2"),
    )
    coordinate_system_type = models.CharField(
        max_length=50,
        choices=CoordinateSystemType.choices,
        help_text=_("SELENOGRAPHIC or PLANETOCENTRIC_360"),
    )
    wmts_tile_url = models.CharField(
        max_length=500,
        help_text=_("NASA Treks WMTS tile template URL"),
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        db_table = 'celestial_bodies'
        verbose_name = _('Celestial Body')
        verbose_name_plural = _('Celestial Bodies')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.id})"


class Mission(models.Model):
    """Space mission that launched artifacts."""

    id = models.CharField(
        max_length=100,
        primary_key=True,
        help_text=_("System mission slug, e.g. 'apollo-11', 'mars-2020'"),
    )
    nssdca_id = models.CharField(
        max_length=50,
        unique=True,
        null=True,
        blank=True,
        help_text=_("Official NASA launch designator / NSSDC ID"),
    )
    name = models.CharField(
        max_length=200,
        help_text=_("Mission name (e.g. Apollo 11, Mars 2020)"),
    )
    agency = models.CharField(
        max_length=100,
        help_text=_("Space agency (e.g. NASA, NASA/JPL)"),
    )
    launch_date = models.DateField(
        null=True,
        blank=True,
        help_text=_("Earth launch date"),
    )
    landing_date = models.DateField(
        null=True,
        blank=True,
        help_text=_("Surface landing date"),
    )
    end_date = models.DateField(
        null=True,
        blank=True,
        help_text=_("Date of last contact / mission conclusion"),
    )
    summary = models.TextField(
        blank=True,
        help_text=_("Short summary of mission objectives and legacy"),
    )

    class Meta:
        db_table = 'missions'
        verbose_name = _('Mission')
        verbose_name_plural = _('Missions')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} [{self.agency}]"


class Artifact(models.Model):
    """Artifact deposited or abandoned on a celestial body surface."""

    id = models.CharField(
        max_length=100,
        primary_key=True,
        help_text=_("Unique artifact slug, e.g. 'opportunity-rover'"),
    )
    mission = models.ForeignKey(
        Mission,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='artifacts',
        db_column='mission_id',
        help_text=_("Foreign key to MISSIONS"),
    )
    celestial_body = models.ForeignKey(
        CelestialBody,
        on_delete=models.PROTECT,
        related_name='artifacts',
        db_column='celestial_body_id',
        help_text=_("Foreign key to CELESTIAL_BODIES"),
    )
    name = models.CharField(
        max_length=200,
        help_text=_("Artifact name"),
    )
    artifact_type = models.CharField(
        max_length=50,
        choices=ArtifactType.choices,
        help_text=_("ROVER, LANDER, INSTRUMENT, etc."),
    )
    operational_status = models.CharField(
        max_length=50,
        choices=OperationalStatus.choices,
        help_text=_("DORMANT, PASSIVE_ACTIVE, DESTROYED, etc."),
    )
    latitude = models.FloatField(
        validators=[MinValueValidator(-90.0), MaxValueValidator(90.0)],
        help_text=_("Latitude coordinate (-90.0 .. 90.0)"),
    )
    longitude = models.FloatField(
        validators=[MinValueValidator(-180.0), MaxValueValidator(360.0)],
        help_text=_("Longitude coordinate (-180.0 .. 180.0 or 0.0 .. 360.0)"),
    )
    elevation_m = models.FloatField(
        null=True,
        blank=True,
        help_text=_("Surface elevation in meters"),
    )
    location_name = models.CharField(
        max_length=200,
        blank=True,
        help_text=_("Name of crater, plain, or landing site"),
    )
    mass_kg = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0.0)],
        help_text=_("Landed mass in kilograms"),
    )
    last_contact_sol = models.IntegerField(
        null=True,
        blank=True,
        help_text=_("Last active contact Sol (for Mars missions)"),
    )
    cause_of_deactivation = models.TextField(
        blank=True,
        help_text=_("Primary failure mode or reason for deactivation"),
    )
    is_featured = models.BooleanField(
        default=False,
        help_text=_("Curated card / Tier 1 highlight"),
    )
    is_nasa_hardware = models.BooleanField(
        default=True,
        help_text=_("Official NASA hardware or international payload"),
    )
    first_person_monologue = models.TextField(
        blank=True,
        help_text=_("Artistic first-person monologue of the artifact (en-US)"),
    )
    model_3d_url = models.CharField(
        max_length=500,
        blank=True,
        help_text=_("URL to .glb 3D model asset on NASA CDN"),
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text=_("Timestamp of last update"),
    )

    class Meta:
        db_table = 'artifacts'
        verbose_name = _('Artifact')
        verbose_name_plural = _('Artifacts')
        ordering = ['name']
        indexes = [
            models.Index(fields=['celestial_body', 'operational_status']),
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['is_featured']),
        ]

    def __str__(self):
        return f"{self.name} ({self.id})"

    def normalize_coords(self) -> tuple[float, float]:
        """Normalize longitude to -180..180 range if required (e.g. IAU 2000 Mars)."""
        lon = self.longitude
        if lon > 180.0:
            lon = lon - 360.0
        return self.latitude, lon


class TraverseWaypoint(models.Model):
    """Waypoint along an artifact traverse route."""

    id = models.CharField(
        max_length=64,
        primary_key=True,
        default=generate_uuid_str,
        help_text=_("Unique waypoint UUID"),
    )
    artifact = models.ForeignKey(
        Artifact,
        on_delete=models.CASCADE,
        related_name='waypoints',
        db_column='artifact_id',
        help_text=_("Foreign key to ARTIFACTS"),
    )
    sol_or_step = models.IntegerField(
        help_text=_("Sol number or sequence step"),
    )
    latitude = models.FloatField(
        validators=[MinValueValidator(-90.0), MaxValueValidator(90.0)],
        help_text=_("Latitude coordinate"),
    )
    longitude = models.FloatField(
        validators=[MinValueValidator(-180.0), MaxValueValidator(360.0)],
        help_text=_("Longitude coordinate"),
    )
    elevation_m = models.FloatField(
        null=True,
        blank=True,
        help_text=_("Elevation in meters at waypoint"),
    )
    odometry_m = models.FloatField(
        null=True,
        blank=True,
        help_text=_("Cumulative odometry in meters"),
    )
    telemetry_snapshot = models.JSONField(
        default=dict,
        blank=True,
        help_text=_("Telemetry JSON: power (Wh), dust (Tau), tilt (deg)"),
    )
    story_snippet = models.TextField(
        blank=True,
        help_text=_("Short story snippet / log for this stop"),
    )

    class Meta:
        db_table = 'traverse_waypoints'
        verbose_name = _('Traverse Waypoint')
        verbose_name_plural = _('Traverse Waypoints')
        ordering = ['artifact', 'sol_or_step']
        indexes = [
            models.Index(fields=['artifact', 'sol_or_step']),
        ]

    def __str__(self):
        return f"{self.artifact_id} - Step {self.sol_or_step}"


class ScientificDiscovery(models.Model):
    """Major scientific finding or milestone enabled by the artifact."""

    id = models.CharField(
        max_length=64,
        primary_key=True,
        default=generate_uuid_str,
        help_text=_("Unique discovery UUID"),
    )
    artifact = models.ForeignKey(
        Artifact,
        on_delete=models.CASCADE,
        related_name='discoveries',
        db_column='artifact_id',
        help_text=_("Foreign key to ARTIFACTS"),
    )
    instrument_acronym = models.CharField(
        max_length=50,
        blank=True,
        help_text=_("Instrument acronym (e.g. Pancam, APXS, SEIS)"),
    )
    instrument_full_name = models.CharField(
        max_length=255,
        blank=True,
        help_text=_("Full instrument name"),
    )
    title = models.CharField(
        max_length=255,
        help_text=_("Scientific discovery title"),
    )
    kid_friendly_story = models.TextField(
        blank=True,
        help_text=_("Simplified explanation for students / public"),
    )
    scientific_fact = models.TextField(
        blank=True,
        help_text=_("Peer-reviewed scientific fact from NASA PDS archive"),
    )

    class Meta:
        db_table = 'scientific_discoveries'
        verbose_name = _('Scientific Discovery')
        verbose_name_plural = _('Scientific Discoveries')
        ordering = ['artifact', 'title']

    def __str__(self):
        return f"{self.artifact_id}: {self.title}"


class ArtifactMedia(models.Model):
    """Media file associated with an artifact."""

    id = models.CharField(
        max_length=64,
        primary_key=True,
        default=generate_uuid_str,
        help_text=_("Unique media UUID"),
    )
    artifact = models.ForeignKey(
        Artifact,
        on_delete=models.CASCADE,
        related_name='media',
        db_column='artifact_id',
        help_text=_("Foreign key to ARTIFACTS"),
    )
    media_category = models.CharField(
        max_length=50,
        choices=MediaCategory.choices,
        help_text=_("SURFACE_PHOTO, LAST_KNOWN_PHOTO, PANORAMA, etc."),
    )
    media_url = models.CharField(
        max_length=500,
        help_text=_("Direct URL on NASA CDN / GitHub Raw"),
    )
    nasa_id_or_pia = models.CharField(
        max_length=100,
        blank=True,
        help_text=_("Official NASA image catalog ID (e.g. PIA22521)"),
    )
    caption = models.CharField(
        max_length=500,
        blank=True,
        help_text=_("Image caption"),
    )
    credit = models.CharField(
        max_length=255,
        blank=True,
        help_text=_("Copyright / credit line (e.g. NASA/JPL-Caltech)"),
    )

    class Meta:
        db_table = 'artifact_media'
        verbose_name = _('Artifact Media')
        verbose_name_plural = _('Artifact Media')
        ordering = ['artifact', 'id']

    def __str__(self):
        return f"{self.artifact_id} [{self.media_category}]: {self.nasa_id_or_pia or self.id}"


class CommunityPublication(models.Model):
    """Community-created publication, short, or video referencing mission/artifact."""

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text=_("Unique publication UUID"),
    )
    mission = models.ForeignKey(
        Mission,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='community_publications',
        db_column='mission_id',
        help_text=_("Related mission (optional)"),
    )
    artifact = models.ForeignKey(
        Artifact,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='community_publications',
        db_column='artifact_id',
        help_text=_("Related artifact (optional)"),
    )
    title = models.CharField(
        max_length=255,
        help_text=_("Title of video or publication"),
    )
    video_url = models.CharField(
        max_length=500,
        help_text=_("Link to YouTube Shorts, TikTok, or Reels"),
    )
    platform_type = models.CharField(
        max_length=50,
        choices=PlatformType.choices,
        help_text=_("YOUTUBE, TIKTOK, REELS"),
    )
    source_references = models.TextField(
        blank=True,
        help_text=_("Content source references (NASA archives, photo credits)"),
    )
    author_name = models.CharField(
        max_length=150,
        help_text=_("Author username / nickname"),
    )
    is_approved = models.BooleanField(
        default=False,
        help_text=_("Pre-moderation approval for display on portal"),
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text=_("Creation timestamp"),
    )

    class Meta:
        db_table = 'community_publications'
        verbose_name = _('Community Publication')
        verbose_name_plural = _('Community Publications')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_approved', 'platform_type']),
        ]

    def __str__(self):
        return f"{self.title} by @{self.author_name} [{self.platform_type}]"
