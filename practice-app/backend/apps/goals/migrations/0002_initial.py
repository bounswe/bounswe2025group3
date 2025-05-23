# Generated by Django 4.2.20 on 2025-05-14 18:27

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('waste', '0001_initial'),
        ('goals', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='goaltemplate',
            name='category',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='goal_templates', to='waste.subcategory'),
        ),
        migrations.AddField(
            model_name='goal',
            name='category',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='waste.subcategory'),
        ),
        migrations.AddField(
            model_name='goal',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
