# Mobile App Build Instructions

This guide covers **both development and production builds** for the mobile application using Docker. This ensures consistent, system-agnostic build environments without requiring local Android SDK installation.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Build](#development-build)
- [Production Build](#production-build)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **[Docker Desktop](https://www.docker.com/get-started)** installed and running
- **Recommended**: Allocate at least 8GB RAM to Docker for production builds
  - Docker Desktop → Settings → Resources → Memory → 8GB or more
- **For development**: Android Studio with emulator OR physical Android device

---

## Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
cd practice-app/mobile

# Development mode (Metro bundler with hot reload)
docker-compose up dev

# Production build (APK generation)
docker-compose up production-build
```

### Option 2: Using Build Scripts

```bash
cd practice-app/mobile

# Production APK (automated)
./build-apk.sh              # For emulator
./build-apk.sh 192.168.1.100  # For physical device

# Development (local - no Docker needed)
npm install
npm start
```

---

## Development Build

Development builds run the **Metro bundler** for rapid development with hot reloading. This is the standard way to develop React Native apps.

### Method 1: Local Development (Recommended)

**No Docker required** - This is the fastest and most common approach:

```bash
# 1. Install dependencies
npm install

# 2. Start Metro bundler
npm start

# 3. Run on device/emulator
# - Press 'a' for Android
# - Press 'i' for iOS (Mac only)
# - Scan QR code with Expo Go app (physical device)
```

**Features:**
- ✅ Hot reloading - See changes instantly
- ✅ Fast refresh - Preserve component state
- ✅ DevTools - Inspect elements, debug network
- ✅ Works on host machine without Docker overhead

### Method 2: Docker Development Environment

Use this if you want a consistent development environment across team members:

```bash
# Build development image
docker build -f Dockerfile.development -t mobile-app-dev .

# Run Metro bundler in Docker
docker run -p 8081:8081 -v $(pwd):/app mobile-app-dev

# Or using docker-compose
docker-compose up dev
```

**Access the app:**
- Open Expo Go app on your phone
- Scan the QR code from terminal
- Or run on emulator connected to your host machine

**Features:**
- ✅ Consistent Node.js version across team
- ✅ Isolated dependencies
- ✅ Source code mounted as volume (hot reload still works)

### Development Environment Variables

Create `.env` file from template:

```bash
cp .env.example .env
```

Edit `.env` for development:

```bash
# For Android Emulator
API_BASE_URL=http://10.0.2.2:8000

# For iOS Simulator
API_BASE_URL=http://localhost:8000

# For Physical Device (find your IP with ipconfig/ifconfig)
API_BASE_URL=http://192.168.1.100:8000

NODE_ENV=development
DEBUG=true
```

---

## Production Build

Production builds generate a **release APK** that can be installed on Android devices. The APK is fully optimized and the backend URL is baked in at build time.

### Quick Build (Automated Script)

**For Android Emulator:**
```bash
./build-apk.sh
```

**For Physical Device:**
```bash
# 1. Find your local IP
ifconfig en0 | grep "inet " | awk '{print $2}'  # Mac/Linux
ipconfig                                         # Windows

# 2. Build with your IP
./build-apk.sh 192.168.1.100
```

**With Custom Port:**
```bash
./build-apk.sh 192.168.1.100 3000
```

The script will:
1. Build Docker image (~10-15 min first time)
2. Compile APK (~10-30 min)
3. Extract `app-release.apk` to current directory
4. Clean up containers automatically

### Manual Production Build

If you prefer manual control:

#### Step 1: Build Docker Image

```bash
# For emulator (default: 10.0.2.2:8000)
docker build -t mobile-app-builder .

# For physical device
docker build \
  --build-arg BACKEND_IP=192.168.1.100 \
  --build-arg BACKEND_PORT=8000 \
  -t mobile-app-builder .
```

**Build time:** Intel: 10-15 min (first), 5-10 min (subsequent). Apple Silicon: 20-30 min (first), 10-15 min (subsequent)

#### Step 2: Run Build Container

```bash
docker run \
  --name mobile-build \
  --memory=8g \
  --memory-swap=12g \
  mobile-app-builder
```

**Build time:** 10-30 minutes depending on system

**Note:** The `--memory` flags prevent out-of-memory errors during JavaScript bundling.

#### Step 3: Extract APK

```bash
docker cp mobile-build:/app/android/app/build/outputs/apk/release/app-release.apk .
```

#### Step 4: Cleanup

```bash
docker rm mobile-build
```

### Using Docker Compose for Production

```bash
# Set environment variables
export BACKEND_IP=192.168.1.100
export BACKEND_PORT=8000

# Build
docker-compose up production-build

# Extract APK
docker cp mobile-app-production-build:/app/android/app/build/outputs/apk/release/app-release.apk .

# Cleanup
docker-compose down
```

---

## Environment Configuration

### .env File Structure

The `.env.example` file contains all available configuration options:

```bash
# Backend
API_BASE_URL=http://10.0.2.2:8000
BACKEND_PORT=8000

# Build
NODE_ENV=development
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000

# Development
METRO_PORT=8081
DEBUG=true

# Optional: Third-party services
# GOOGLE_CLIENT_ID=your-id
# ANALYTICS_API_KEY=your-key
```

### Backend URL Guidelines

| Scenario | URL to Use | Example |
|----------|-----------|---------|
| **Android Emulator** | `http://10.0.2.2:PORT` | `http://10.0.2.2:8000` |
| **iOS Simulator** | `http://localhost:PORT` | `http://localhost:8000` |
| **Physical Device (same network)** | `http://YOUR_LOCAL_IP:PORT` | `http://192.168.1.100:8000` |
| **Production Server** | Your production URL | `https://api.yourdomain.com` |

**Important:**
- ❌ Never use `localhost` or `127.0.0.1` for physical devices (refers to the device itself)
- ✅ For production builds, the URL is **baked into the APK** - rebuild if it changes

### Finding Your Local IP

**Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# Or specifically:
ipconfig getifaddr en0
```

**Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

---

## Installing the APK

### Option 1: Android Studio Emulator
1. Start your emulator in Android Studio
2. Drag and drop `app-release.apk` onto the emulator window
3. App installs automatically

### Option 2: Physical Device (ADB)
```bash
adb install app-release.apk
```

### Option 3: Physical Device (Manual)
1. Transfer `app-release.apk` to your phone
2. Open the file and tap "Install"
3. May need to enable "Install from Unknown Sources" in Settings

---

## Troubleshooting

### Docker Issues

**"Cannot connect to the Docker daemon"**
```bash
# Solution: Start Docker Desktop
docker info  # Verify Docker is running
```

**"docker: command not found"**
```bash
# Solution: Install Docker Desktop from docker.com
```

**"Out of Memory" or build hangs at JavaScript bundling**
```bash
# Solution 1: Increase Docker memory
# Docker Desktop → Settings → Resources → Memory → 8GB+

# Solution 2: Close other applications to free RAM

# Solution 3: Verify memory allocation
docker info | grep Memory
```

### Build Issues

**Build fails with "CMake not found"**
```bash
# This should be fixed in the Dockerfile, but if you see this:
# Ensure Dockerfile includes:
# RUN sdkmanager "cmake;3.22.1" "ndk;27.1.12297006"
```

**"Permission denied" when running build-apk.sh**
```bash
chmod +x build-apk.sh
./build-apk.sh
```

**Build takes extremely long (>1 hour) on Apple Silicon**
```bash
# Expected behavior: Android SDK requires x86_64, so Docker uses Rosetta 2 emulation
# First build: 30-45 minutes (downloading + compiling via emulation)
# Subsequent builds: 10-20 minutes (layer caching helps significantly)
# Solution: This is normal - the Dockerfile uses --platform=linux/amd64 for compatibility
# Alternative: Use Expo EAS Build (cloud-based) for faster builds
```

### Runtime Issues

**App crashes on startup with network error**
```bash
# Check 1: Verify backend is running
curl http://YOUR_IP:8000/api/

# Check 2: Verify APK was built with correct IP
# You may need to rebuild with updated BACKEND_IP

# Check 3: Check firewall
# Ensure firewall allows connections on port 8000
```

**"Unable to connect to Metro bundler" (Development)**
```bash
# Solution 1: Ensure Metro is running (npm start)
# Solution 2: Check port 8081 is not in use
lsof -i :8081

# Solution 3: Clear Metro cache
npm start -- --clear
```

**Expo Go app can't connect to dev server**
```bash
# Solution 1: Ensure phone and computer are on same WiFi
# Solution 2: Check firewall isn't blocking port 8081
# Solution 3: Use tunnel mode
npm start -- --tunnel
```

### Device-Specific Issues

**Android Emulator can't reach backend at 10.0.2.2**
```bash
# Verify backend is running on host
curl http://localhost:8000/api/

# Try alternative:
adb reverse tcp:8000 tcp:8000
# Then use http://localhost:8000 in app
```

**Physical device can't reach backend**
```bash
# Check 1: Verify both on same network
# Check 2: Verify IP is correct
ping YOUR_LOCAL_IP

# Check 3: Test backend access from device browser
# Open http://YOUR_LOCAL_IP:8000/api/ in mobile browser
```

---

## File Structure

```
mobile/
├── Dockerfile                  # Production build (APK generation)
├── Dockerfile.development      # Development (Metro bundler)
├── Dockerfile.production       # Same as Dockerfile (backup)
├── docker-compose.yml          # Multi-environment orchestration
├── build-apk.sh               # Automated production build script
├── .env.example               # Environment variable template
├── .env                       # Your local config (git-ignored)
├── BUILD_INSTRUCTIONS.md      # This file
├── QUICK_REFERENCE.md         # Common commands cheatsheet
├── status_report.md           # Project status documentation
├── app.json                   # Expo configuration
├── package.json               # Dependencies
└── constants/
    └── api.ts                 # API_BASE_URL (modified during builds)
```

---

## Build Comparison

| Feature | Development | Production |
|---------|-------------|-----------|
| **Method** | npm start | Docker build |
| **Output** | Metro bundler | APK file |
| **Hot Reload** | ✅ Yes | ❌ No |
| **Build Time** | ~30 seconds | ~20-30 minutes |
| **Size** | N/A | ~50-100MB APK |
| **Backend URL** | From .env (changeable) | Baked in (rebuild required) |
| **Use Case** | Active development | Testing on devices, distribution |
| **Docker Required** | ❌ Optional | ✅ Yes (or local Android SDK) |

---

## Advanced Usage

### Cleaning Up Docker Resources

```bash
# Remove all build artifacts
docker rm $(docker ps -a -q --filter ancestor=mobile-app-builder)
docker rmi mobile-app-builder
docker system prune -a
```

### Debugging Inside Container

```bash
# Start container with shell
docker run -it --entrypoint /bin/bash mobile-app-builder

# Manually run build commands
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

### Inspecting Build Logs

```bash
# If build fails, check logs
docker logs mobile-build

# Or with docker-compose
docker-compose logs production-build
```

### Building for Different Environments

```bash
# Staging environment
docker build \
  --build-arg BACKEND_IP=staging.yourdomain.com \
  --build-arg BACKEND_PORT=443 \
  -t mobile-app-staging .

# Production environment
docker build \
  --build-arg BACKEND_IP=api.yourdomain.com \
  --build-arg BACKEND_PORT=443 \
  -t mobile-app-production .
```

---

## Next Steps

After successfully building:

1. **Development**: Start coding! Changes hot-reload automatically
2. **Production**:
   - Start your backend server
   - Install APK on device
   - Test connectivity and features
   - Check backend logs for incoming requests

---

## Need Help?

- **Project README**: `../../README.md`
- **Backend Setup**: `../backend/README.md`
- **Quick Reference**: `QUICK_REFERENCE.md`
- **Status Report**: `status_report.md`
- **Issues**: Open a GitHub issue in the repository

---

## Summary Commands

```bash
# Development (local)
npm install && npm start

# Development (Docker)
docker-compose up dev

# Production (automated)
./build-apk.sh [IP] [PORT]

# Production (Docker Compose)
docker-compose up production-build

# Production (manual)
docker build --build-arg BACKEND_IP=X.X.X.X -t mobile-app-builder .
docker run --name build --memory=8g mobile-app-builder
docker cp build:/app/android/app/build/outputs/apk/release/app-release.apk .
```
