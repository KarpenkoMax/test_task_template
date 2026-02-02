from django.db import models


class PixelEvent(models.Model):
    """A single event sent by the website pixel."""

    created_at = models.DateTimeField(auto_now_add=True)

    client_id = models.CharField(max_length=64, db_index=True)
    session_id = models.CharField(max_length=64, db_index=True)

    event_type = models.CharField(max_length=32, db_index=True)
    ts = models.DateTimeField(db_index=True)
    url = models.TextField()
    meta = models.JSONField(default=dict, blank=True)

    user_agent = models.TextField(blank=True, default="")
    ip = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ["-ts", "-id"]
        indexes = [
            models.Index(fields=["client_id", "ts"]),
            models.Index(fields=["session_id", "ts"]),
            models.Index(fields=["event_type", "ts"]),
        ]

    def __str__(self) -> str:
        return f"{self.client_id}:{self.session_id} {self.event_type} {self.ts.isoformat()}"
