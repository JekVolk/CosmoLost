import datetime
import uuid
from django.contrib import admin
from django.core.exceptions import ValidationError
from django.db import IntegrityError, models
from django.test import TestCase
from unfold.admin import ModelAdmin

from core.models import (
    Artifact,
    ArtifactMedia,
    ArtifactType,
    CelestialBody,
    CommunityPublication,
    CoordinateSystemType,
    MediaCategory,
    Mission,
    OperationalStatus,
    PlatformType,
    ScientificDiscovery,
    TimeStampedModel,
    TraverseWaypoint,
)


class ConcreteTimeStampedModel(TimeStampedModel):
    """Concrete model subclass used for testing abstract base functionality."""

    name = models.CharField(max_length=50)

    class Meta:
        app_label = 'core'


class CoreBaseModelTests(TestCase):
    """Tests for Core base models."""

    def test_timestamped_model_is_abstract(self):
        """Ensure TimeStampedModel is abstract."""
        self.assertTrue(TimeStampedModel._meta.abstract)

    def test_timestamped_model_fields(self):
        """Ensure created_at and updated_at fields exist with auto_now settings."""
        created_field = TimeStampedModel._meta.get_field('created_at')
        updated_field = TimeStampedModel._meta.get_field('updated_at')

        self.assertTrue(created_field.auto_now_add)
        self.assertTrue(updated_field.auto_now)


class PlanetaryDomainModelTests(TestCase):
    """Comprehensive tests for database models matching the ERD specification."""

    def setUp(self):
        self.mars = CelestialBody.objects.create(
            id='mars',
            name='Mars',
            radius_km=3396.2,
            gravity_ms2=3.72,
            coordinate_system_type=CoordinateSystemType.PLANETOCENTRIC_360,
            wmts_tile_url='https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0//default/default028mm/{TileMatrix}/{TileRow}/{TileCol}.jpg',
        )

        self.moon = CelestialBody.objects.create(
            id='moon',
            name='Moon',
            radius_km=1737.4,
            gravity_ms2=1.62,
            coordinate_system_type=CoordinateSystemType.SELENOGRAPHIC,
            wmts_tile_url='https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303P_100m/1.0.0//default/default028mm/{TileMatrix}/{TileRow}/{TileCol}.jpg',
        )

        self.mer_mission = Mission.objects.create(
            id='mer-b',
            nssdca_id='2003-032A',
            name='Mars Exploration Rover B',
            agency='NASA/JPL',
            launch_date=datetime.date(2003, 7, 7),
            landing_date=datetime.date(2004, 1, 25),
            end_date=datetime.date(2018, 6, 10),
            summary='Opportunity rover exploration of Meridiani Planum.',
        )

        self.artifact = Artifact.objects.create(
            id='opportunity-rover',
            mission=self.mer_mission,
            celestial_body=self.mars,
            name='Opportunity (MER-B)',
            artifact_type=ArtifactType.ROVER,
            operational_status=OperationalStatus.DORMANT,
            latitude=-1.9462,
            longitude=354.4734,
            elevation_m=-1440.0,
            location_name='Endeavour Crater / Perseverance Valley',
            mass_kg=185.0,
            last_contact_sol=5111,
            cause_of_deactivation='Planet-encircling global dust storm obscured solar panels.',
            is_featured=True,
            is_nasa_hardware=True,
            first_person_monologue='My battery is low and it is getting dark.',
            model_3d_url='https://raw.githubusercontent.com/nasa/3d-models/main/opportunity.glb',
        )

    def test_celestial_body_creation_and_str(self):
        """Test CelestialBody properties and __str__."""
        self.assertEqual(str(self.mars), 'Mars (mars)')
        self.assertEqual(self.mars.radius_km, 3396.2)
        self.assertIsNotNone(self.mars.created_at)

    def test_mission_creation_and_uniqueness(self):
        """Test Mission unique nssdca_id and __str__."""
        self.assertEqual(str(self.mer_mission), 'Mars Exploration Rover B [NASA/JPL]')
        with self.assertRaises(IntegrityError):
            Mission.objects.create(
                id='duplicate-mission',
                nssdca_id='2003-032A',  # Duplicate UK
                name='Duplicate Mission',
                agency='NASA',
            )

    def test_artifact_creation_and_normalization(self):
        """Test Artifact relations, attributes, and coordinate normalization."""
        self.assertEqual(self.artifact.mission, self.mer_mission)
        self.assertEqual(self.artifact.celestial_body, self.mars)
        self.assertEqual(str(self.artifact), 'Opportunity (MER-B) (opportunity-rover)')

        # Normalization test for IAU 2000 Mars longitude: 354.4734 -> -5.5266
        lat, lon = self.artifact.normalize_coords()
        self.assertEqual(lat, -1.9462)
        self.assertAlmostEqual(lon, -5.5266, places=4)

    def test_traverse_waypoint_creation(self):
        """Test TraverseWaypoint linked to Artifact."""
        waypoint = TraverseWaypoint.objects.create(
            artifact=self.artifact,
            sol_or_step=5111,
            latitude=-1.9462,
            longitude=354.4734,
            elevation_m=-1440.0,
            odometry_m=45160.0,
            telemetry_snapshot={'power_wh': 22.0, 'tau': 10.8, 'tilt_deg': 2.1},
            story_snippet='Final communication attempt from Perseverance Valley.',
        )
        self.assertEqual(waypoint.artifact, self.artifact)
        self.assertEqual(waypoint.telemetry_snapshot['tau'], 10.8)
        self.assertIn('5111', str(waypoint))

    def test_scientific_discovery_creation(self):
        """Test ScientificDiscovery linked to Artifact."""
        discovery = ScientificDiscovery.objects.create(
            artifact=self.artifact,
            instrument_acronym='MIMOS II',
            instrument_full_name='Mössbauer Spectrometer',
            title='Hematite Concretions (Blueberries)',
            kid_friendly_story='Small grey sphere rocks formed by ancient water.',
            scientific_fact='Discovery of jarosite and hematite spherules proving past acidic liquid water.',
        )
        self.assertEqual(discovery.artifact, self.artifact)
        self.assertIn('Hematite Concretions', str(discovery))

    def test_artifact_media_creation(self):
        """Test ArtifactMedia linked to Artifact."""
        media = ArtifactMedia.objects.create(
            artifact=self.artifact,
            media_category=MediaCategory.LAST_KNOWN_PHOTO,
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA22521.jpg',
            nasa_id_or_pia='PIA22521',
            caption='Opportunity final panorama segment in Perseverance Valley.',
            credit='NASA/JPL-Caltech/Cornell/ASU',
        )
        self.assertEqual(media.artifact, self.artifact)
        self.assertEqual(media.media_category, MediaCategory.LAST_KNOWN_PHOTO)
        self.assertIn('PIA22521', str(media))

    def test_community_publication_creation(self):
        """Test CommunityPublication linked to Mission and Artifact."""
        pub = CommunityPublication.objects.create(
            mission=self.mer_mission,
            artifact=self.artifact,
            title='The 15-Year Martian Journey of Opportunity',
            video_url='https://youtube.com/shorts/sample123',
            platform_type=PlatformType.YOUTUBE,
            source_references='NASA JPL Photojournal, PDS Geoscience Node',
            author_name='astro_creator',
            is_approved=True,
        )
        self.assertIsInstance(pub.id, uuid.UUID)
        self.assertTrue(pub.is_approved)
        self.assertEqual(pub.platform_type, PlatformType.YOUTUBE)
        self.assertIn('astro_creator', str(pub))

    def test_cascade_deletion_behavior(self):
        """Verify cascade deletion for waypoints, discoveries, and media when artifact is deleted."""
        waypoint = TraverseWaypoint.objects.create(
            artifact=self.artifact,
            sol_or_step=1,
            latitude=-1.9,
            longitude=354.0,
        )
        discovery = ScientificDiscovery.objects.create(
            artifact=self.artifact,
            title='Initial Landing Discovery',
        )
        media = ArtifactMedia.objects.create(
            artifact=self.artifact,
            media_category=MediaCategory.SURFACE_PHOTO,
            media_url='https://example.com/photo.jpg',
        )

        wp_id = waypoint.id
        disc_id = discovery.id
        med_id = media.id

        self.artifact.delete()

        self.assertFalse(TraverseWaypoint.objects.filter(id=wp_id).exists())
        self.assertFalse(ScientificDiscovery.objects.filter(id=disc_id).exists())
        self.assertFalse(ArtifactMedia.objects.filter(id=med_id).exists())


class AdminRegistrationTests(TestCase):
    """Verify all models are registered with Unfold ModelAdmin in admin.site."""

    def test_all_core_models_registered(self):
        models_to_check = [
            CelestialBody,
            Mission,
            Artifact,
            TraverseWaypoint,
            ScientificDiscovery,
            ArtifactMedia,
            CommunityPublication,
        ]
        for model in models_to_check:
            with self.subTest(model=model.__name__):
                admin_obj = admin.site._registry.get(model)
                self.assertIsNotNone(admin_obj, f"{model.__name__} is not registered in admin.site")
                self.assertIsInstance(admin_obj, ModelAdmin, f"{model.__name__} admin is not an Unfold ModelAdmin")
