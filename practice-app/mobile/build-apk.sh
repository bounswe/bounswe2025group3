#!/bin/bash

# ==============================================================================
# Android APK Builder Script
# ==============================================================================
# This script automates the Docker-based APK build process.
#
# Usage:
#   ./build-apk.sh                           # Use default (emulator)
#   ./build-apk.sh 192.168.1.100             # Use custom IP
#   ./build-apk.sh 192.168.1.100 3000        # Use custom IP and port
# ==============================================================================

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_IP=${1:-10.0.2.2}
BACKEND_PORT=${2:-8000}
IMAGE_NAME="mobile-app-builder"
CONTAINER_NAME="mobile-build-$(date +%s)"
APK_OUTPUT="app-release.apk"

# ==============================================================================
# FUNCTIONS
# ==============================================================================

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

cleanup() {
    if [ "$1" = "error" ]; then
        print_error "Build failed! Check the logs above for details."
        print_info "Cleaning up container: $CONTAINER_NAME"
        docker rm -f $CONTAINER_NAME 2>/dev/null || true
    fi
}

trap 'cleanup error' ERR

# ==============================================================================
# MAIN SCRIPT
# ==============================================================================

print_header "Android APK Builder"
echo ""
print_info "Backend IP:   $BACKEND_IP"
print_info "Backend Port: $BACKEND_PORT"
print_info "Image:        $IMAGE_NAME"
print_info "Container:    $CONTAINER_NAME"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Detect architecture
ARCH=$(uname -m)
print_info "Detected architecture: $ARCH"

if [ "$ARCH" = "arm64" ]; then
    print_warning "Running on Apple Silicon - build uses x86_64 emulation via Rosetta 2"
    print_warning "First build: 30-45 min, subsequent builds: 10-20 min (layer caching)"
fi

# Step 1: Build Docker image
print_header "Step 1/4: Building Docker Image"
print_info "This may take 10-15 minutes on first run..."
echo ""

docker build \
    --build-arg BACKEND_IP=$BACKEND_IP \
    --build-arg BACKEND_PORT=$BACKEND_PORT \
    -t $IMAGE_NAME \
    .

print_info "Docker image built successfully!"
echo ""

# Step 2: Run container and build APK
print_header "Step 2/4: Building APK"
print_info "This will take 10-30 minutes depending on your system..."
print_warning "If you see timeout errors, you may need to increase Docker's memory allocation"
print_info "Go to Docker Desktop → Settings → Resources → Memory (recommend 8GB+)"
echo ""

# Run with increased memory limits
docker run \
    --name $CONTAINER_NAME \
    --memory=8g \
    --memory-swap=12g \
    $IMAGE_NAME

print_info "APK build completed successfully!"
echo ""

# Step 3: Extract APK
print_header "Step 3/4: Extracting APK"
echo ""

# Remove old APK if it exists
if [ -f "$APK_OUTPUT" ]; then
    print_warning "Removing old $APK_OUTPUT"
    rm -f $APK_OUTPUT
fi

docker cp $CONTAINER_NAME:/app/android/app/build/outputs/apk/release/app-release.apk $APK_OUTPUT

if [ -f "$APK_OUTPUT" ]; then
    APK_SIZE=$(du -h $APK_OUTPUT | cut -f1)
    print_info "APK extracted successfully!"
    print_info "File: $APK_OUTPUT"
    print_info "Size: $APK_SIZE"
else
    print_error "Failed to extract APK!"
    exit 1
fi
echo ""

# Step 4: Cleanup
print_header "Step 4/4: Cleanup"
print_info "Removing build container..."
docker rm $CONTAINER_NAME > /dev/null

print_info "Cleanup complete!"
echo ""

# Final summary
print_header "Build Summary"
echo ""
print_info "✓ APK built successfully: $APK_OUTPUT"
print_info "✓ Backend configured: http://$BACKEND_IP:$BACKEND_PORT"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "  1. Install on Android Emulator: Drag & drop $APK_OUTPUT to emulator"
echo "  2. Install on Physical Device: adb install $APK_OUTPUT"
echo "  3. Make sure your backend is running on http://$BACKEND_IP:$BACKEND_PORT"
echo ""
print_header "Build Complete!"
