# Quick Reference: Android APK Build

## TL;DR - Build Commands

### For Android Emulator (Default)
```bash
cd practice-app/mobile
./build-apk.sh
```

### For Physical Device
```bash
# 1. Find your local IP
ifconfig en0 | grep "inet " | awk '{print $2}'

# 2. Build with your IP
./build-apk.sh 192.168.1.100
```

---

## Common Workflows

### First Time Setup
```bash
# 1. Ensure Docker Desktop is running
# 2. Allocate 8GB+ memory: Docker Desktop → Settings → Resources

# 3. Navigate to mobile directory
cd practice-app/mobile

# 4. Build (takes 15-30 min first time)
./build-apk.sh

# Output: app-release.apk
```

### Install APK on Emulator
```bash
# Start emulator in Android Studio
# Then drag and drop app-release.apk onto emulator window
```

### Install APK on Physical Device
```bash
adb install app-release.apk
```

---

## Manual Build (Advanced)

### Build Docker Image
```bash
# Default (emulator)
docker build -t mobile-app-builder .

# Custom IP
docker build --build-arg BACKEND_IP=192.168.1.100 -t mobile-app-builder .

# Custom IP and Port
docker build \
  --build-arg BACKEND_IP=192.168.1.100 \
  --build-arg BACKEND_PORT=3000 \
  -t mobile-app-builder .
```

### Run Build
```bash
docker run --name mobile-build --memory=8g --memory-swap=12g mobile-app-builder
```

### Extract APK
```bash
docker cp mobile-build:/app/android/app/build/outputs/apk/release/app-release.apk .
```

### Cleanup
```bash
docker rm mobile-build
```

---

## Troubleshooting One-Liners

### Docker not running?
```bash
# Mac: Open Docker Desktop from Applications
# Verify: docker info
```

### Permission denied on build-apk.sh?
```bash
chmod +x build-apk.sh
```

### Build failed with OOM?
```bash
# Increase Docker memory:
# Docker Desktop → Settings → Resources → Memory → 8GB+
```

### Check Docker memory allocation
```bash
docker info | grep Memory
```

### View build logs
```bash
docker logs mobile-build
```

### Clean up old builds
```bash
docker system prune -a
docker rmi mobile-app-builder
```

### Rebuild with new backend IP
```bash
./build-apk.sh NEW_IP_ADDRESS
```

### Debug inside container
```bash
docker run -it --entrypoint /bin/bash mobile-app-builder
```

---

## Quick Checks

### Is Docker running?
```bash
docker info > /dev/null 2>&1 && echo "✓ Docker is running" || echo "✗ Docker is not running"
```

### Find my local IP
```bash
# Mac/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}'

# Or just for primary interface (Mac)
ipconfig getifaddr en0
```

### Check if backend is running
```bash
curl http://localhost:8000/api/
# Or with custom IP:
curl http://192.168.1.100:8000/api/
```

### Verify APK exists
```bash
ls -lh app-release.apk
```

---

## Important Notes

### Backend URL
- ⚠️ Backend URL is **baked into APK** at build time
- 📱 Emulator: Use `10.0.2.2` (points to host's localhost)
- 📲 Physical device: Use your computer's local IP (e.g., `192.168.1.100`)
- ❌ Never use `localhost` or `127.0.0.1` (refers to device, not your computer)

### Memory Requirements
- Minimum: 6GB RAM available
- Recommended: 8GB+ allocated to Docker
- Heavy load during: `createBundleReleaseJsAndAssets` phase

### Build Times
- **Intel Mac**: First build 15-25 min, subsequent 5-15 min
- **Apple Silicon**: First build 30-45 min, subsequent 10-20 min (x86_64 emulation via Rosetta 2)

---

## File Locations

```
mobile/
├── Dockerfile              → Build recipe
├── build-apk.sh           → Automated script
├── app-release.apk        → Output (after build)
├── BUILD_INSTRUCTIONS.md  → Full documentation
├── QUICK_REFERENCE.md     → This file
└── constants/api.ts       → API URL (modified during build)
```

---

## Support

- **Full Documentation**: See `BUILD_INSTRUCTIONS.md`
- **Status Report**: See `status_report.md`
- **Issues**: Check GitHub repository
