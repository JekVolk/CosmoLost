from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase

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
