from django.urls import path

from .views import EventsListView, HealthView, IngestView


urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("events/", EventsListView.as_view(), name="events_list"),
    path("ingest/", IngestView.as_view(), name="ingest"),
]
