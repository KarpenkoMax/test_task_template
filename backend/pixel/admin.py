from django.contrib import admin

from .models import PixelEvent


@admin.register(PixelEvent)
class PixelEventAdmin(admin.ModelAdmin):
    list_display = ("id", "event_type", "client_id", "session_id", "ts", "url")
    list_filter = ("event_type",)
    search_fields = ("client_id", "session_id", "url")
    ordering = ("-ts", "-id")
