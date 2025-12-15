# Mobile Application Build Instructions

## Overview
This document provides comprehensive instructions for building the EcoChallenge mobile application for both development and production environments.

## Prerequisites
- **Docker** (20.10 or later)
- **Docker Compose** (optional, for full stack setup)
- **Node.js** 18+ and npm (for development mode)
- **Expo Go** app on your mobile device (for development testing)

---

## Table of Contents
1. [Production Build (APK via Docker)](#production-build-apk-via-docker)
2. [Development Build (Expo Go)](#development-build-expo-go)
3. [Network Configuration](#network-configuration)
4. [Extracting the APK](#extracting-the-apk)
5. [Troubleshooting](#troubleshooting)

---

## Production Build (APK via Docker)

### Building for Live Backend (Production)

```bash
# Navigate to mobile directory
cd practice-app/mobile

# Build Docker image with live backend URL
docker build \
  --build-arg BACKEND_URL=https://ecochallenge-backend.onrender.com \
  -t mobile-app-builder \
  .

# Run the build (this will take 20-30 minutes)
docker run --name mobile-build mobile-app-builder

# Extract the APK
docker cp mobile-build:/app/android/app/build/outputs/apk/release/app-release.apk ./app-release.apk

# Cleanup (optional)
docker rm mobile-build
```

### Building for Local Backend (Development)

```bash
# Find your local machine's IP address
# Mac/Linux:
ifconfig | grep "inet " | grep -v 127.0.0.1
# Windows:
ipconfig

# Build Docker image with your local IP
docker build \
  --build-arg BACKEND_URL=http://YOUR_LOCAL_IP:8000 \
  -t mobile-app-builder-local \
  .

# Run the build
docker run --name mobile-build-local mobile-app-builder-local

# Extract the APK
docker cp mobile-build-local:/app/android/app/build/outputs/apk/release/app-release.apk ./app-release-local.apk
```

---

## Development Build (Expo Go)

For faster development iterations, use Expo Go:

### 1. Install Dependencies
```bash
cd practice-app/mobile
npm install
```

### 2. Configure Backend URL
Edit `constants/api.ts` and set the appropriate backend URL:

```typescript
// For Live Backend:
export const API_BASE_URL = 'https://ecochallenge-backend.onrender.com';

// For Local Backend (from your computer's IP):
export const API_BASE_URL = 'http://192.168.1.65:8000';

// For Android Emulator (special IP to reach host):
export const API_BASE_URL = 'http://10.0.2.2:8000';
```

### 3. Start Expo
```bash
npx expo start
```

### 4. Run on Device
- Install **Expo Go** from Google Play Store or Apple App Store
- Scan the QR code displayed in your terminal
- The app will load on your device

---

## Network Configuration

### Understanding Network Connectivity

The mobile app needs to connect to the backend API. The configuration varies based on your environment:

#### 1. Android Emulator
- **Problem**: The emulator sees `localhost` as its own internal network
- **Solution**: Use the special IP address `10.0.2.2` to reach your host machine
- **Backend URL**: `http://10.0.2.2:8000`

#### 2. Physical Device (Same WiFi)
- **Problem**: Your device can't access `localhost` on your computer
- **Solution**: Use your computer's local IP address
- **Find IP**:
  - Mac/Linux: `ifconfig | grep "inet " | grep -v 127.0.0.1`
  - Windows: `ipconfig` (look for IPv4 Address)
- **Backend URL**: `http://YOUR_LOCAL_IP:8000` (e.g., `http://192.168.1.65:8000`)

#### 3. iOS Simulator
- **Problem**: None - it can access localhost directly
- **Backend URL**: `http://localhost:8000`

#### 4. Production (Live Backend)
- **Problem**: None - public HTTPS URL
- **Backend URL**: `https://ecochallenge-backend.onrender.com`

### Configuration Methods

#### Method 1: Docker Build Argument (Recommended for APK)
```bash
docker build --build-arg BACKEND_URL=YOUR_BACKEND_URL -t mobile-app-builder .
```

#### Method 2: Direct Code Edit (For Development)
Edit `practice-app/mobile/constants/api.ts`:
```typescript
export const API_BASE_URL = 'YOUR_BACKEND_URL';
```

#### Method 3: Environment Variable (Alternative)
Create `.env` file (see `.env.example`):
```
API_BASE_URL=YOUR_BACKEND_URL
```

---

## Extracting the APK

After a successful Docker build, extract the APK file:

```bash
# Check if build completed successfully
docker logs mobile-build | grep "BUILD SUCCESS"

# Extract APK
docker cp mobile-build:/app/android/app/build/outputs/apk/release/app-release.apk ./app-release.apk

# Verify file size (should be 40-80 MB)
ls -lh app-release.apk

# Install on device via ADB
adb install app-release.apk

# Or transfer to device and install manually
```

---

## Troubleshooting

### Build Fails with CMake Error
**Problem**: Native module compilation fails in Docker on Apple Silicon

**Solution**: The Dockerfile has been updated to disable New Architecture and Hermes:
```dockerfile
ENV ORG_GRADLE_PROJECT_newArchEnabled=false
ENV ORG_GRADLE_PROJECT_hermesEnabled=false
```

If you still encounter issues, try:
1. Increase Docker memory allocation (8GB+ recommended)
2. Close other applications to free up resources
3. Use `docker system prune` to clean up Docker cache

### App Can't Connect to Backend
**Problem**: Network connection errors

**Solutions**:
1. **Android Emulator**: Use `http://10.0.2.2:8000` instead of `localhost`
2. **Physical Device**: Ensure device and computer are on same WiFi network
3. **Firewall**: Check if firewall is blocking connections on port 8000
4. **Backend Status**: Verify backend is running:
   - Local: `curl http://localhost:8000/api/v1/waste/categories/`
   - Live: Visit https://ecochallenge.onrender.com in browser

### Docker Build Runs Out of Memory
**Problem**: "Killed" or "Out of memory" errors

**Solutions**:
1. Increase Docker Desktop memory limit:
   - Docker Desktop → Settings → Resources → Memory → 8GB+
2. Close unnecessary applications
3. Build with fewer workers: `--max-workers=1` (already default in Dockerfile)

### Expo Go Shows Metro Bundler Error
**Problem**: Can't connect to Metro bundler

**Solutions**:
1. Check that `npx expo start` is running
2. Ensure device and computer are on same WiFi
3. Try running with tunnel: `npx expo start --tunnel`
4. Clear Metro cache: `npx expo start --clear`

---

## Build Performance

- **First Build**: 30-45 minutes (downloads dependencies, Android SDK components)
- **Subsequent Builds**: 15-20 minutes (uses Docker layer caching)
- **Development Mode (Expo Go)**: < 1 minute startup time

---

## Release Checklist

Before creating a GitHub release with the APK:

- [ ] Build successful with no errors
- [ ] APK file size is reasonable (40-80 MB)
- [ ] APK installs on physical device
- [ ] App connects to backend successfully
- [ ] Test login/registration flow
- [ ] Test at least one core feature (e.g., waste logging)
- [ ] Backend URL is set to production: `https://ecochallenge-backend.onrender.com`
- [ ] `.env.example` file is up to date
- [ ] This `BUILD_INSTRUCTIONS.md` is included
- [ ] Tag release as `customer-milestone-3-mobile`

---

## Additional Resources

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Documentation**: https://reactnative.dev/
- **Docker Documentation**: https://docs.docker.com/
- **Android Debug Bridge (ADB)**: https://developer.android.com/tools/adb

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Docker logs: `docker logs mobile-build`
3. Check Metro bundler output in terminal
4. Verify backend is accessible from your network

---

**Last Updated**: December 2025  
**Version**: 1.0  
**For**: Customer Milestone 3 Submission
