# Generated migration for changing profile_picture ImageField to profile_picture_url URLField

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customuser',
            name='profile_picture',
        ),
        migrations.AddField(
            model_name='customuser',
            name='profile_picture_url',
            field=models.URLField(blank=True, max_length=500, null=True, verbose_name='profile picture'),
        ),
    ]

