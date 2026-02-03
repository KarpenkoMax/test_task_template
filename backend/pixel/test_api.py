import pytest
from django.utils import timezone

from pixel.models import PixelEvent


@pytest.mark.django_db
def test_health(client):
    resp = client.get("/api/health/")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


@pytest.mark.django_db
def test_events_list(client):
    PixelEvent.objects.create(
        client_id="c_1",
        session_id="s_1",
        event_type="page_view",
        ts=timezone.now(),
        url="https://example.com/",
        meta={"x": 1},
        user_agent="pytest",
        ip="127.0.0.1",
    )
    resp = client.get("/api/events/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1
    assert len(data["results"]) >= 1
