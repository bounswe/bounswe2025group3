from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email field must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', self.model.Role.ADMIN)
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', _('Admin')
        MODERATOR = 'MODERATOR', _('Moderator')
        USER = 'USER', _('User')


    username = models.CharField(
        _('username'),
        max_length=150,
        unique=True,  # Username must be unique
        help_text=_('Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.'),
        validators=[AbstractUser.username_validator],
        error_messages={
            'unique': _("A user with that username already exists."),
        },
    )

    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(_('role'), max_length=50, choices=Role.choices, default=Role.USER)

    # Profile fields
    bio = models.TextField(_('bio'), blank=True, null=True)
    profile_picture = models.ImageField(_('profile picture'), upload_to='profiles/', blank=True, null=True)
    city = models.CharField(_('city'), max_length=100, blank=True, null=True)
    country = models.CharField(_('country'), max_length=100, blank=True, null=True)

    # Settings & Stats
    notifications_enabled = models.BooleanField(_('notifications enabled'), default=True)
    total_score = models.IntegerField(default=0)
    is_anonymous = models.BooleanField(default=False)

    # Use email as the unique identifier for authentication
    USERNAME_FIELD = 'email'
    # Username is required, but first_name and last_name are not
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email