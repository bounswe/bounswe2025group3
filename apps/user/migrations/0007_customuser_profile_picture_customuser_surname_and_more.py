from django.db import migrations, models
import uuid

def set_default_username(apps, schema_editor):
    CustomUser = apps.get_model('user', 'CustomUser')
    for user in CustomUser.objects.all():
        if not user.username:  # Only update users without a username
            base_username = user.email.split('@')[0]
            user.username = f"{base_username}_{str(uuid.uuid4())[:8]}"
            user.save()

class Migration(migrations.Migration):

    dependencies = [
        ('user', '0006_customuser_bio_customuser_city_customuser_country'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='profile_picture',
            field=models.ImageField(blank=True, null=True, upload_to='profile_pics/'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='surname',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='customuser',
            name='username',
            field=models.CharField(max_length=150, unique=True, default='temp_user'),
            preserve_default=False,
        ),
        migrations.RunPython(set_default_username, reverse_code=migrations.RunPython.noop),
    ]