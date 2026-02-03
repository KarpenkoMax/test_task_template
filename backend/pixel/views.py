from __future__ import annotations

from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PixelEvent
from .serializers import IngestRequestSerializer, PixelEventSerializer


class HealthView(APIView):
    authentication_classes: list = []
    permission_classes: list = []

    def get(self, request):
        return Response({"status": "ok", "time": timezone.now().isoformat()})


class EventsListView(APIView):
    """List events with very simple filters.

    This endpoint is intentionally small; it exists so the React UI can show
    captured events during the interview.
    """

    authentication_classes: list = []
    permission_classes: list = []

    def get(self, request):
        qs = PixelEvent.objects.all().order_by("-ts")

        client_id = request.query_params.get("client_id")
        session_id = request.query_params.get("session_id")
        event_type = request.query_params.get("event_type")
        ts_from = request.query_params.get("ts_from")
        ts_to = request.query_params.get("ts_to")

        if client_id:
            qs = qs.filter(client_id=client_id)
        if session_id:
            qs = qs.filter(session_id=session_id)
        if event_type:
            qs = qs.filter(event_type=event_type)
        if ts_from:
            qs = qs.filter(ts__gte=ts_from)
        if ts_to:
            qs = qs.filter(ts__lte=ts_to)

        # Minimal pagination: ?page=1&per_page=20
        page = int(request.query_params.get("page", "1"))
        per_page = int(request.query_params.get("per_page", "20"))
        per_page = max(1, min(per_page, 100))
        offset = (page - 1) * per_page

        total = qs.count()
        items = qs[offset : offset + per_page]
        data = PixelEventSerializer(items, many=True).data
        return Response({"total": total, "page": page, "per_page": per_page, "results": data})


class IngestView(APIView):
    """
    Ingest events from the browser pixel.
    Creates PixelEvent objects
    """

    authentication_classes: list = []
    permission_classes: list = []

    def post(self, request):
        serializer = IngestRequestSerializer(data=request.data)
        
        return Response({"detail": "Not implemented (interview task)."}, status=501)
