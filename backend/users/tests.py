from django.conf import settings
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import Client, TestCase
from django.urls import reverse
from unfold.admin import ModelAdmin

User = get_user_model()


class UserModelTests(TestCase):
    """Tests for the custom User model."""

    def test_custom_user_model_is_configured(self):
        """Verify AUTH_USER_MODEL is pointed to users.User."""
        self.assertEqual(settings.AUTH_USER_MODEL, 'users.User')
        self.assertEqual(User.__name__, 'User')

    def test_create_user(self):
        """Verify creating a standard user works as expected."""
        user = User.objects.create_user(
            username='cosmo_user',
            email='user@cosmolost.local',
            password='TestPassword123!',
        )
        self.assertEqual(user.username, 'cosmo_user')
        self.assertEqual(user.email, 'user@cosmolost.local')
        self.assertTrue(user.check_password('TestPassword123!'))
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertEqual(str(user), 'cosmo_user')

    def test_create_superuser(self):
        """Verify creating a superuser sets administrative permissions."""
        superuser = User.objects.create_superuser(
            username='cosmo_admin',
            email='admin@cosmolost.local',
            password='AdminPassword123!',
        )
        self.assertTrue(superuser.is_staff)
        self.assertTrue(superuser.is_superuser)


class UnfoldAdminTests(TestCase):
    """Tests for Django Unfold admin calibration and registration."""

    def test_user_and_group_registered_with_unfold_modeladmin(self):
        """Verify User and Group are registered with unfold.admin.ModelAdmin."""
        user_admin = admin.site._registry.get(User)
        group_admin = admin.site._registry.get(Group)

        self.assertIsNotNone(user_admin)
        self.assertIsInstance(user_admin, ModelAdmin)

        self.assertIsNotNone(group_admin)
        self.assertIsInstance(group_admin, ModelAdmin)

    def test_admin_login_page_renders_with_unfold(self):
        """Verify admin login page responds with 200 and loads Unfold assets."""
        client = Client()
        response = client.get(reverse('admin:login'))
        self.assertEqual(response.status_code, 200)
        # Verify Unfold branding or title is present in rendered context/HTML
        self.assertContains(response, 'CosmoLost')
