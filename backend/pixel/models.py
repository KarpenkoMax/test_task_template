from django.db import models


class PixelEvent(models.Model):
    """A single event captured by the website pixel.

    This model is intentionally small and pragmatic for an interview task.
    """

    client_id = models.CharField(max_length=64, db_index=True)
    session_id = models.CharField(max_length=64, db_index=True)
    event_type = models.CharField(max_length=32, db_index=True)
    ts = models.DateTimeField(db_index=True)
    url = models.TextField()
    meta = models.JSONField(null=True, blank=True)

    user_agent = models.TextField(blank=True, default="")
    ip = models.CharField(max_length=64, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["-ts"], name="px_ts_desc"),
            models.Index(fields=["client_id", "session_id"], name="px_client_session"),
        ]

    def __str__(self) -> str:
        return f"{self.client_id}:{self.session_id} {self.event_type} @ {self.ts.isoformat()}"
