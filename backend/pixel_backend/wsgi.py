"""
WSGI‑конфигурация проекта pixel_backend.

Она экспортирует вызываемый WSGI‑объект как переменную уровня модуля ``application``.

Подробнее об этом файле см.:
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pixel_backend.settings')

application = get_wsgi_application()
