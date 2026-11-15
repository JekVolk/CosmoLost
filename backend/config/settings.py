"""
Django settings for CosmoLost backend project.
"""

import os
from pathlib import Path

from django.urls import reverse_lazy
from django.utils.translation import gettext_lazy as _

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load local .env file into os.environ if present
_env_path = BASE_DIR / '.env'
if _env_path.exists():
    with open(_env_path, encoding='utf-8') as _f:
        for _line in _f:
            _line = _line.strip()
            if _line and not _line.startswith('#') and '=' in _line:
                _k, _v = _line.split('=', 1)
                os.environ.setdefault(_k.strip(), _v.strip())

# Silenced system checks (urls.W005 is expected due to intentional alias routes for API compatibility)
SILENCED_SYSTEM_CHECKS = ['urls.W005']

# Security & environment settings
SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY',
    'django-insecure-m!6m4)xc#03dcyfoymebe8gw=_b-5%csol^7hpdhoxlf))8o58',
)

DEBUG = os.environ.get('DJANGO_DEBUG', 'True').lower() in ('true', '1', 'yes')

ALLOWED_HOSTS = [
    host.strip()
    for host in os.environ.get(
        'DJANGO_ALLOWED_HOSTS',
        'localhost,127.0.0.1,0.0.0.0,backend,testserver,cosmolost.lihtar.org,.lihtar.org',
    ).split(',')
    if host.strip()
]

CSRF_TRUSTED_ORIGINS = [
    host.strip()
    for host in os.environ.get(
        'DJANGO_CSRF_TRUSTED_ORIGINS',
        'http://localhost:9088,http://127.0.0.1:9088,http://testserver:9088,http://localhost:8000,http://127.0.0.1:8000,http://testserver:8000,http://backend:8000,https://cosmolost.lihtar.org,http://cosmolost.lihtar.org',
    ).split(',')
    if host.strip()
]

# Application definition

INSTALLED_APPS = [
    # Admin theme (must precede django.contrib.admin)
    'unfold',
    'unfold.contrib.filters',
    'unfold.contrib.forms',
    'unfold.contrib.inlines',

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',
    'django_tasks',

    # Local apps
    'core',
    'users',
    'loader',
    'mcp',
    'web_api',
    'desktop_api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'config.middleware.SimpleCorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database
USE_SQLITE = os.environ.get('USE_SQLITE', 'True') == 'True'

if USE_SQLITE:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DB_NAME', 'cosmolost'),
            'USER': os.environ.get('DB_USER', 'postgres'),
            'PASSWORD': os.environ.get('DB_PASSWORD', 'postgres'),
            'HOST': os.environ.get('DB_HOST', 'db'),
            'PORT': os.environ.get('DB_PORT', '5432'),
        }
    }

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

STATIC_URL = 'static/'

# Django REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# Mailers configuration (Django 6.1+)
MAILERS = {
    'default': {
        'BACKEND': os.environ.get(
            'DJANGO_MAIL_BACKEND',
            'django.core.mail.backends.console.EmailBackend'
            if DEBUG
            else 'django.core.mail.backends.smtp.EmailBackend',
        ),
    },
}

# Django Tasks configuration
# Configured via DJANGO_TASKS_BACKEND (ImmediateBackend for local/sync execution)
TASKS = {
    'default': {
        'BACKEND': os.environ.get(
            'DJANGO_TASKS_BACKEND',
            'django_tasks.backends.immediate.ImmediateBackend',
        ),
    }
}

# Django Unfold theme configuration
UNFOLD = {
    "SITE_TITLE": "CosmoLost Admin",
    "SITE_HEADER": "CosmoLost",
    "SITE_SUBHEADER": _("Platform Operations & Management"),
    "SITE_SYMBOL": "rocket_launch",
    "SHOW_HISTORY": True,
    "SHOW_VIEW_ON_SITE": False,
    "SHOW_BACK_BUTTON": True,
    "BORDER_RADIUS": "8px",
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": True,
        "navigation": [
            {
                "title": _("Overview"),
                "separator": False,
                "collapsible": False,
                "items": [
                    {
                        "title": _("Dashboard"),
                        "icon": "dashboard",
                        "link": reverse_lazy("admin:index"),
                    },
                ],
            },
            {
                "title": _("Planetary Core"),
                "separator": True,
                "collapsible": False,
                "items": [
                    {
                        "title": _("Celestial Bodies"),
                        "icon": "public",
                        "link": reverse_lazy("admin:core_celestialbody_changelist"),
                    },
                    {
                        "title": _("Missions"),
                        "icon": "rocket_launch",
                        "link": reverse_lazy("admin:core_mission_changelist"),
                    },
                    {
                        "title": _("Artifacts"),
                        "icon": "satellite_alt",
                        "link": reverse_lazy("admin:core_artifact_changelist"),
                    },
                    {
                        "title": _("Waypoints"),
                        "icon": "route",
                        "link": reverse_lazy("admin:core_traversewaypoint_changelist"),
                    },
                    {
                        "title": _("Scientific Discoveries"),
                        "icon": "science",
                        "link": reverse_lazy("admin:core_scientificdiscovery_changelist"),
                    },
                    {
                        "title": _("Artifact Media"),
                        "icon": "photo_library",
                        "link": reverse_lazy("admin:core_artifactmedia_changelist"),
                    },
                ],
            },
            {
                "title": _("Community & Publications"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {
                        "title": _("Community Publications"),
                        "icon": "video_library",
                        "link": reverse_lazy("admin:core_communitypublication_changelist"),
                    },
                ],
            },
            {
                "title": _("Authentication & Authorization"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {
                        "title": _("Users"),
                        "icon": "person",
                        "link": reverse_lazy("admin:users_user_changelist"),
                    },
                    {
                        "title": _("Groups"),
                        "icon": "group",
                        "link": reverse_lazy("admin:auth_group_changelist"),
                    },
                ],
            },
        ],
    },
}
