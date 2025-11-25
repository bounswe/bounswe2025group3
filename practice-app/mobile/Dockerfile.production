# ==============================================================================
# Android APK Builder for React Native/Expo
# ==============================================================================
# This Dockerfile builds Android APKs without requiring local Android SDK installation.
# Uses x86_64 platform to ensure Android SDK compatibility across all host architectures.
#
# Build Arguments:
#   BACKEND_IP   - IP address of your backend server (default: 10.0.2.2)
#   BACKEND_PORT - Port of your backend server (default: 8000)
#
# Usage:
#   docker build --build-arg BACKEND_IP=192.168.1.100 -t mobile-app-builder .
#   docker run --name mobile-build mobile-app-builder
#   docker cp mobile-build:/app/android/app/build/outputs/apk/release/app-release.apk .
#
# Note: On Apple Silicon Macs, the build runs via Rosetta 2 emulation.
#       First build may take 30-45 minutes; subsequent builds are faster.
# ==============================================================================

# Force x86_64 architecture for Android SDK compatibility
# Android SDK command-line tools are only available for x86_64 Linux
FROM --platform=linux/amd64 ubuntu:22.04

# Build arguments for backend configuration
ARG BACKEND_IP=10.0.2.2
ARG BACKEND_PORT=8000

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# ==============================================================================
# SYSTEM DEPENDENCIES
# ==============================================================================
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    wget \
    unzip \
    git \
    curl \
    gnupg \
    libtinfo5 \
    && rm -rf /var/lib/apt/lists/*

# ==============================================================================
# NODE.JS INSTALLATION
# ==============================================================================
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest

# Verify Node.js installation
RUN node --version && npm --version

# ==============================================================================
# ANDROID SDK SETUP
# ==============================================================================
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/build-tools/35.0.0

# Download and install Android SDK Command Line Tools
RUN mkdir -p ${ANDROID_HOME}/cmdline-tools \
    && wget -q https://dl.google.com/android/repository/commandlinetools-linux-10406996_latest.zip -O /tmp/cmdline-tools.zip \
    && unzip -q /tmp/cmdline-tools.zip -d ${ANDROID_HOME}/cmdline-tools \
    && mv ${ANDROID_HOME}/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest \
    && rm /tmp/cmdline-tools.zip

# Accept Android SDK licenses
RUN yes | sdkmanager --licenses || true

# Install Android SDK components
# Include CMake and NDK for building native code (react-native modules)
RUN sdkmanager \
    "platform-tools" \
    "platforms;android-35" \
    "build-tools;35.0.0" \
    "cmdline-tools;latest" \
    "cmake;3.22.1" \
    "ndk;27.1.12297006"

# ==============================================================================
# MEMORY OPTIMIZATION FOR CROSS-ARCHITECTURE BUILD
# ==============================================================================
# Note: When building on Apple Silicon via Rosetta 2 emulation, memory usage is higher.
# These settings are conservative to ensure successful builds under emulation.

# Increase Node.js heap size for Metro bundler
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Configure Gradle for memory-constrained environments
RUN mkdir -p /root/.gradle && \
    { \
        echo "# Memory settings - conservative for emulation"; \
        echo "org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError"; \
        echo ""; \
        echo "# Disable parallel to reduce memory pressure"; \
        echo "org.gradle.daemon=false"; \
        echo "org.gradle.parallel=false"; \
        echo "org.gradle.configureondemand=true"; \
        echo "org.gradle.caching=true"; \
        echo ""; \
        echo "# Android-specific settings"; \
        echo "android.useAndroidX=true"; \
        echo "android.enableJetifier=true"; \
    } > /root/.gradle/gradle.properties

# ==============================================================================
# APPLICATION SETUP
# ==============================================================================
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install npm dependencies with increased timeout
RUN npm install --legacy-peer-deps --maxsockets=1 || npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# ==============================================================================
# CONFIGURE API BASE URL
# ==============================================================================
# Dynamically inject the backend URL into the constants file
RUN echo "Configuring API_BASE_URL to http://${BACKEND_IP}:${BACKEND_PORT}" && \
    sed -i "s|export const API_BASE_URL = .*|export const API_BASE_URL = 'http://${BACKEND_IP}:${BACKEND_PORT}';|g" constants/api.ts && \
    echo "API configuration complete. Verifying:" && \
    grep "API_BASE_URL" constants/api.ts

# ==============================================================================
# BUILD APK
# ==============================================================================
# Build for arm64-v8a only to reduce memory usage (most common architecture)
# This significantly reduces build time and memory requirements
ENV REACT_NATIVE_ARCHITECTURES=arm64-v8a

# Set the default command to build the APK
CMD ["/bin/bash", "-c", "\
    set -e && \
    echo '========================================' && \
    echo 'Starting Android APK build process...' && \
    echo '========================================' && \
    echo 'Step 1/3: Running Expo prebuild...' && \
    npx expo prebuild --platform android --clean && \
    echo '' && \
    echo 'Step 2/3: Building release APK (arm64-v8a only)...' && \
    cd android && \
    chmod +x ./gradlew && \
    ./gradlew assembleRelease --no-daemon --max-workers=1 -PreactNativeArchitectures=arm64-v8a && \
    echo '' && \
    echo '========================================' && \
    echo 'Build Complete!' && \
    echo '========================================' && \
    echo 'APK Location: /app/android/app/build/outputs/apk/release/app-release.apk' && \
    echo 'To extract: docker cp <container-name>:/app/android/app/build/outputs/apk/release/app-release.apk .' && \
    echo '========================================' \
"]

# Expose Metro bundler port (optional, for development)
EXPOSE 8081
