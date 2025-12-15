## Supabase Backend Integration (API Key–Based)

This document explains how the backend connects to Supabase using API keys, how secrets are managed, and how to run the integration in development and production.

---

### Overview

- **Goal**: Securely integrate the backend with Supabase using API keys.
- **Tech**: Supabase Storage / client SDK, Django backend (Python).
- **Security**: All keys loaded from environment variables, never hard‑coded, with Row Level Security (RLS) enforced on Supabase.

---

### Supabase Keys & When They Are Used

Supabase provides multiple keys; this project uses them as follows:

- **`SUPABASE_URL`**  
  - **What**: Base URL of your Supabase project (e.g. `https://xyzcompany.supabase.co`).
  - **Used by**: Backend and any authorized client that talks to Supabase.

- **Anon (public) key**  
  - **What**: Public anon key used for client‑side (unprivileged) operations with RLS.  
  - **Backend usage**:  
    - Optional: can be used for actions that should be limited to the same constraints as the frontend.  
  - **Environment variable (recommended)**: `SUPABASE_ANON_KEY` (not currently required by the existing code, but reserved for future use).

- **`SUPABASE_SERVICE_KEY` (service role key)**  
  - **What**: Highly privileged key that bypasses RLS and can perform admin‑level operations.
  - **Used by**: **Backend only**, for operations that must not be possible from the frontend (e.g. image uploads, cron jobs, maintenance tasks, server‑side data migrations).
  - **Never expose** to frontend or client apps (web/mobile).

> **Rule of thumb**:  
> - Use **RLS + anon key** wherever possible.  
> - Use **service role key** only when absolutely required, and always on the backend.

---

### Environment Variables

All Supabase credentials are loaded from environment variables via Django settings. Do **not** commit any actual keys to the repository.

Add the following variables to your backend `.env` (or equivalent secrets store):

```bash
# Supabase core config
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key

# Optional public anon key for future DB access
SUPABASE_ANON_KEY=your_anon_public_key

# Storage configuration
SUPABASE_STORAGE_BUCKET=images
```

#### Local `.env` Setup

1. Copy the sample environment file:

```bash
cd practice-app/backend
cp .env.sample .env
```

2. Open `.env` and fill in the Supabase values:

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
SUPABASE_ANON_KEY=...
SUPABASE_STORAGE_BUCKET=images
```

3. Ensure `.env` is **ignored** by git (check `.gitignore`).

#### Production Environment Setup

- **Docker / Render / Cloud provider**:  
  - Set the same variables (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_STORAGE_BUCKET`) in your hosting provider’s **environment variables / secrets** panel.
  - Do **not** create a `.env` file with real keys in the repository.
- **Rotation**:  
  - If any key is accidentally exposed, **rotate** it in the Supabase dashboard and update the hosting environment vars.

---

### Backend Supabase Modules

Supabase connection logic is centralized so the rest of the codebase does not deal directly with raw API keys.

- **Storage client**: `common.supabase_storage`
  - Uses `settings.SUPABASE_URL`, `settings.SUPABASE_SERVICE_KEY`, and `settings.SUPABASE_STORAGE_BUCKET`.
  - Provides helpers to upload and delete images in Supabase Storage.

#### Existing Storage Integration (Python)

The core client creation lives in `common/supabase_storage.py`:

```python
from django.conf import settings
from supabase import create_client, Client
from supabase.lib.client_options import ClientOptions

def get_supabase_client() -> Client:
    supabase_url = getattr(settings, "SUPABASE_URL", None)
    supabase_key = getattr(settings, "SUPABASE_SERVICE_KEY", None)

    if not supabase_url or not supabase_key:
        raise ValueError(
            "Supabase credentials not configured. "
            "Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in settings."
        )

    options = ClientOptions(
        auto_refresh_token=False,
        persist_session=False,
    )

    return create_client(supabase_url, supabase_key, options=options)
```

This client is then used for storage operations such as image uploads and deletions.

#### Example: Uploading an Image

```python
from common.supabase_storage import upload_image

def handle_uploaded_file(django_file):
    public_url = upload_image(
        file_content=django_file,
        folder_path="profiles",
        filename=None,  # auto-generate
        content_type=django_file.content_type,
        upsert=False,
    )
    return public_url
```

---

### Sample Integration Query (Validation)

Use the following pattern to validate that the backend–Supabase connection works end‑to‑end with the existing storage module.

#### Example: Minimal Storage Health Check

You can create a small Django management command or view that:

1. Generates a small in‑memory file.
2. Calls `upload_image` to save it under a test path.
3. Calls `delete_image` to remove it.

```python
from io import BytesIO
from django.core.management.base import BaseCommand
from common.supabase_storage import upload_image, delete_image

class Command(BaseCommand):
    help = "Test Supabase Storage integration"

    def handle(self, *args, **options):
        # 1. Create a tiny fake image payload
        fake_image = BytesIO(b"fake-image-bytes")

        # 2. Upload
        public_url = upload_image(
            file_content=fake_image,
            folder_path="test",
            filename="integration_test.jpg",
            content_type="image/jpeg",
            upsert=True,
        )
        self.stdout.write(self.style.SUCCESS(f"Uploaded to: {public_url}"))

        # 3. Delete
        deleted = delete_image("test/integration_test.jpg")
        self.stdout.write(
            self.style.SUCCESS("Deleted successfully")
            if deleted
            else self.style.ERROR("Delete failed")
        )
```

Running this command verifies that:

- The Supabase client can be created using the configured environment variables.
- The backend can read/write/delete content in Supabase Storage using the service role key.

---

### Row Level Security (RLS)

RLS ensures that clients (including the backend when using an anon key) can only access rows they are authorized to see.

#### Core Principles

- RLS is **enabled per table** in the Supabase dashboard.
- Policies are written in SQL and evaluated for each row.
- When using the **anon key**, all queries must pass RLS checks.
- When using the **service role key**, RLS is **bypassed** (full access) – this is why it must stay backend‑only.

#### Example Policy: User‑Owned Records

For a table `profiles` with a column `user_id`, you might create an RLS policy like:

```sql
-- Allow users to read their own profile
create policy "Allow read own profile"
on public.profiles
for select
using (auth.uid() = user_id);

-- Allow users to update their own profile
create policy "Allow update own profile"
on public.profiles
for update
using (auth.uid() = user_id);
```

- **Frontend / anon key**:  
  - A user authenticated via Supabase auth can only read/update their own row where `user_id = auth.uid()`.
- **Backend / service key**:  
  - Can read/update all profiles (for admin tools, reports, etc.). Use carefully.

---

### Running the Backend Locally

1. **Install dependencies** (if not already):

```bash
cd practice-app/backend

python -m venv venv
source venv/Scripts/activate  # Windows (Git Bash)
# or: source venv/bin/activate # macOS/Linux

pip install -r requirements.txt
```

2. **Configure `.env`** with Supabase vars as described above.

3. **Run migrations and start server**:

```bash
python manage.py migrate
python manage.py runserver
```

4. **Test Supabase integration**:
   - Run the test management command or hit a dedicated endpoint that uses the storage helpers.
   - Confirm data is written to and removed from Supabase Storage without errors.

---

### Running in Production

- **Docker**:
  - Ensure your `Dockerfile` and `docker-compose.yml` (if used) pass the Supabase environment variables through to the container.
  - Example `docker-compose.yml` snippet:

```yaml
services:
  backend:
    env_file:
      - ./backend/.env   # or set env vars directly in your deployment system
    # ...
```

- **Cloud Deployment (Render / Railway / etc.)**:
  - Configure `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_ANON_KEY`, and `SUPABASE_STORAGE_BUCKET` in the provider’s environment settings.
  - Redeploy after any key rotation.

---

### Security Best Practices

- **Never commit secrets**: `.env` should never contain real keys in version control.
- **Backend‑only service key**: Only the backend reads `SUPABASE_SERVICE_KEY`.  
  - Do not log it.  
  - Do not send it in any HTTP response.  
  - Do not embed it in frontend code or mobile apps.
- **Use RLS aggressively**: Prefer using the anon key + robust RLS policies for most operations.
- **Key rotation**:
  - If a key is ever exposed (logs, screenshots, commits, etc.), rotate it immediately in Supabase and update all environments.
- **Least privilege**:
  - When possible, design policies so that business logic is enforced via RLS and minimal necessary privileges, rather than always falling back to service role behavior.

---

### Checklist

- **[ ]** Supabase URL and keys defined in `.env` / environment variables.  
- **[ ]** Existing storage client (`common.supabase_storage`) configured and working.  
- **[ ]** Sample storage operation (upload/delete) works locally against Supabase Storage.  
- **[ ]** RLS enabled on relevant tables with at least one policy aligned with our use case.  
- **[ ]** Service role key is only used on the backend and never exposed to clients.


