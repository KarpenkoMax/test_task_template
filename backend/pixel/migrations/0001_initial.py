# Сгенерировано для задания на интервью.

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="PixelEvent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("client_id", models.CharField(db_index=True, max_length=64)),
                ("session_id", models.CharField(db_index=True, max_length=64)),
                ("event_type", models.CharField(db_index=True, max_length=32)),
                ("ts", models.DateTimeField(db_index=True)),
                ("url", models.TextField()),
                ("meta", models.JSONField(blank=True, default=dict)),
                ("user_agent", models.TextField(blank=True, default="")),
                ("ip", models.GenericIPAddressField(blank=True, null=True)),
            ],
            options={
                "ordering": ["-ts", "-id"],
            },
        ),
        migrations.AddIndex(
            model_name="pixelevent",
            index=models.Index(fields=["client_id", "ts"], name="pixel_pixe_client__14f4bb_idx"),
        ),
        migrations.AddIndex(
            model_name="pixelevent",
            index=models.Index(fields=["session_id", "ts"], name="pixel_pixe_session_5fcaa2_idx"),
        ),
        migrations.AddIndex(
            model_name="pixelevent",
            index=models.Index(fields=["event_type", "ts"], name="pixel_pixe_event_ty_4ea16e_idx"),
        ),
    ]
