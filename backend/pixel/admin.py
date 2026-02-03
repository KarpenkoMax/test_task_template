from django.contrib import admin

from .models import PixelEvent


@admin.register(PixelEvent)
class PixelEventAdmin(admin.ModelAdmin):
    list_display = ("id", "client_id", "session_id", "event_type", "ts", "url")
    list_filter = ("event_type", "client_id")
    search_fields = ("client_id", "session_id", "url")

# Register your models here.
