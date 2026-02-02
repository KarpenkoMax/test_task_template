from __future__ import annotations

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from pixel.models import PixelEvent


class TestEventsList(TestCase):
    def setUp(self):
        self.client = APIClient()
        PixelEvent.objects.create(
            client_id="c_1",
            session_id="s_1",
            event_type="page_view",
            ts=timezone.now(),
            url="https://example.com",
            meta={"a": 1},
            user_agent="pytest",
        )

    def test_list_events(self):
        res = self.client.get("/api/events/")
        self.assertEqual(res.status_code, 200)
        payload = res.json()
        self.assertIn("results", payload)
        self.assertGreaterEqual(len(payload["results"]), 1)


class TestIngestTodo(TestCase):
    """Эти тесты должны падать, пока не реализована задача интервью."""

    def setUp(self):
        self.client = APIClient()

    def test_ingest_single_event(self):
        res = self.client.post(
            "/api/ingest/",
            data={
                "client_id": "c_10",
                "session_id": "s_10",
                "event": {
                    "event_type": "click",
                    "ts": "2026-02-02T10:00:00Z",
                    "url": "https://example.com/pricing",
                    "meta": {"x": 1},
                },
            },
            format="json",
        )

        # Ожидаемое поведение финальной реализации:
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json().get("accepted"), 1)
        self.assertEqual(PixelEvent.objects.count(), 1)
