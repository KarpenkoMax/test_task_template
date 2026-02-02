from __future__ import annotations

import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from pixel.models import PixelEvent


class Command(BaseCommand):
    help = "Seed the database with a few PixelEvent rows for local dev/demo."

    def handle(self, *args, **options):
        if PixelEvent.objects.exists():
            self.stdout.write(self.style.NOTICE("PixelEvent table is not empty - skipping seed."))
            return

        now = timezone.now()
        event_types = ["page_view", "click", "form_submit"]
        urls = [
            "https://example.com/",
            "https://example.com/pricing",
            "https://example.com/contact",
            "https://example.com/blog/post-1",
        ]

        rows = []
        for i in range(25):
            rows.append(
                PixelEvent(
                    client_id=f"c_{random.randint(100, 999)}",
                    session_id=f"s_{random.randint(1000, 9999)}",
                    event_type=random.choice(event_types),
                    ts=now - timedelta(seconds=random.randint(0, 3600)),
                    url=random.choice(urls),
                    meta={"seed": True, "i": i},
                    user_agent="seed-agent",
                    ip=None,
                )
            )

        PixelEvent.objects.bulk_create(rows)
        self.stdout.write(self.style.SUCCESS(f"Seeded {len(rows)} PixelEvent rows."))
