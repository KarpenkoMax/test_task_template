"""
Конфигурация URL для проекта pixel_backend.

Список `urlpatterns` маршрутизирует URL во views. Подробнее см.:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Примеры:
Function views
    1. Добавьте импорт:  from my_app import views
    2. Добавьте URL в urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Добавьте импорт:  from other_app.views import Home
    2. Добавьте URL в urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Импортируйте include(): from django.urls import include, path
    2. Добавьте URL в urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('pixel.urls')),
]
