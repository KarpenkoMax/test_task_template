"""
ASGI‑конфигурация проекта pixel_backend.

Она экспортирует вызываемый ASGI‑объект как переменную уровня модуля ``application``.

Подробнее об этом файле см.:
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pixel_backend.settings')

application = get_asgi_application()
