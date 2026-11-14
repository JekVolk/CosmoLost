from django.db import models
from django.test import TestCase

from core.models import TimeStampedModel


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
