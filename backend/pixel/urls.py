from __future__ import annotations

from django.urls import path

from . import views


urlpatterns = [
    path("health/", views.HealthView.as_view(), name="health"),
    path("events/", views.PixelEventListView.as_view(), name="events"),
    path("ingest/", views.ingest, name="ingest"),
]
