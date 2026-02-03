from __future__ import annotations

from typing import Any, Dict

from rest_framework import serializers

from .models import PixelEvent


class PixelEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = PixelEvent
        fields = [
            "id",
            "client_id",
            "session_id",
            "event_type",
            "ts",
            "url",
            "meta",
            "user_agent",
            "ip",
            "created_at",
        ]


class IncomingEventSerializer(serializers.Serializer):
    event_type = serializers.CharField(max_length=32)
    ts = serializers.DateTimeField()
    url = serializers.CharField()
    meta = serializers.DictField(child=serializers.JSONField(), required=False)


class IngestRequestSerializer(serializers.Serializer):

    client_id = serializers.CharField(max_length=64)
    session_id = serializers.CharField(max_length=64)
    event = IncomingEventSerializer(required=False)
    events = IncomingEventSerializer(many=True, required=False)

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        has_single = "event" in attrs
        has_batch = "events" in attrs
        if has_single == has_batch:
            raise serializers.ValidationError("Provide exactly one of: 'event' or 'events'.")
        return attrs
