from __future__ import annotations

import json
from datetime import datetime

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.dateparse import parse_datetime
from rest_framework.generics import ListAPIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PixelEvent
from .serializers import IngestRequestSerializer, PixelEventSerializer


class HealthView(APIView):
    def get(self, request: Request) -> Response:
        return Response({"ok": True})


class PixelEventListView(ListAPIView):
    serializer_class = PixelEventSerializer

    def get_queryset(self):
        qs = PixelEvent.objects.all()

        client_id = self.request.query_params.get("client_id")
        if client_id:
            qs = qs.filter(client_id=client_id)

        session_id = self.request.query_params.get("session_id")
        if session_id:
            qs = qs.filter(session_id=session_id)

        event_type = self.request.query_params.get("event_type")
        if event_type:
            qs = qs.filter(event_type=event_type)

        ts_from = self.request.query_params.get("ts_from")
        if ts_from:
            dt = parse_datetime(ts_from)
            if isinstance(dt, datetime):
                qs = qs.filter(ts__gte=dt)

        ts_to = self.request.query_params.get("ts_to")
        if ts_to:
            dt = parse_datetime(ts_to)
            if isinstance(dt, datetime):
                qs = qs.filter(ts__lte=dt)

        return qs


@csrf_exempt
async def ingest(request):
    """Принимает события, отправленные пикселем.

    Намеренно неполно: это основная задача интервью по бэкенду.
    Кандидат должен:
    - валидировать запрос через IngestRequestSerializer
    - сопоставить payload с моделью(ями) PixelEvent
    - вернуть {accepted, rejected, errors}
    """

    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed"}, status=405)

    try:
        body = request.body.decode("utf-8") if request.body else "{}"
        data = json.loads(body)
    except Exception:
        return JsonResponse({"detail": "Invalid JSON"}, status=400)

    serializer = IngestRequestSerializer(data=data)
    if not serializer.is_valid():
        return JsonResponse(serializer.errors, status=400)

    # TODO (interview): реализовать запись в БД.
    return JsonResponse(
        {
            "detail": "Not implemented. Please implement ingestion as part of the interview task.",
            "accepted": 0,
            "rejected": 0,
            "errors": [],
        },
        status=501,
    )
