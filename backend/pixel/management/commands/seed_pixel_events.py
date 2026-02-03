from __future__ import annotations

import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from pixel.models import PixelEvent


class Command(BaseCommand):
    help = "Seed a few pixel events so the UI isn't empty on first run."

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=25)

    def handle(self, *args, **options):
        count = int(options["count"])
        if PixelEvent.objects.exists():
            self.stdout.write(self.style.NOTICE("PixelEvent table is not empty; skipping seed."))
            return

        base_url = "https://example.com"
        event_types = ["page_view", "click", "form_submit"]
        now = timezone.now()
        rows = []
        for i in range(count):
            ts = now - timedelta(seconds=10 * (count - i))
            rows.append(
                PixelEvent(
                    client_id="c_demo",
                    session_id=f"s_{random.randint(1000, 9999)}",
                    event_type=random.choice(event_types),
                    ts=ts,
                    url=f"{base_url}/page/{random.randint(1, 5)}",
                    meta={"seed": True, "n": i},
                    user_agent="seed",
                    ip="127.0.0.1",
                )
            )
        PixelEvent.objects.bulk_create(rows)
        self.stdout.write(self.style.SUCCESS(f"Seeded {len(rows)} pixel events."))
