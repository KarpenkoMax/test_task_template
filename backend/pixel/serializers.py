from __future__ import annotations

from rest_framework import serializers

from .models import PixelEvent


class PixelEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = PixelEvent
        fields = [
            "id",
            "created_at",
            "client_id",
            "session_id",
            "event_type",
            "ts",
            "url",
            "meta",
            "user_agent",
            "ip",
        ]


class IngestEventSerializer(serializers.Serializer):
    """Single event payload.

    NOTE: This serializer is intentionally minimal for the interview task.
    The candidate may extend it as needed.
    """

    event_type = serializers.CharField(max_length=32)
    ts = serializers.DateTimeField()
    url = serializers.CharField()
    meta = serializers.DictField(required=False)


class IngestRequestSerializer(serializers.Serializer):
    """Accepts either a single `event` or a list of `events`.

    Exactly one of `event` and `events` must be provided.
    """

    client_id = serializers.CharField(max_length=64)
    session_id = serializers.CharField(max_length=64)

    event = IngestEventSerializer(required=False)
    events = IngestEventSerializer(many=True, required=False)

    def validate(self, attrs):
        has_event = "event" in attrs
        has_events = "events" in attrs
        if has_event == has_events:
            raise serializers.ValidationError(
                "Provide exactly one of: event or events"
            )
        return attrs
