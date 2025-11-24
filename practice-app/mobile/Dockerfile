FROM --platform=linux/amd64 ubuntu:22.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install necessary dependencies
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    wget \
    unzip \
    git \
    curl \
    gnupg \
    libtinfo5 \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest

# Set up Android SDK environment variables
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools

# Download and install Android SDK Command Line Tools
RUN mkdir -p ${ANDROID_HOME}/cmdline-tools \
    && wget -q https://dl.google.com/android/repository/commandlinetools-linux-10406996_latest.zip -O /tmp/cmdline-tools.zip \
    && unzip -q /tmp/cmdline-tools.zip -d ${ANDROID_HOME}/cmdline-tools \
    && mv ${ANDROID_HOME}/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest \
    && rm /tmp/cmdline-tools.zip

# Accept Android SDK licenses
RUN yes | sdkmanager --licenses

# Install Android SDK Platform and Build Tools
# Adjust versions as needed based on your project's requirements (check android/build.gradle after prebuild if unsure, but these are standard)
RUN sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# Set working directory
WORKDIR /app

# Increase Node.js memory for the bundler
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Configure Gradle memory globally
RUN mkdir -p /root/.gradle && \
    echo "org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=512m" > /root/.gradle/gradle.properties && \
    echo "org.gradle.daemon=false" >> /root/.gradle/gradle.properties

# Copy package.json and package-lock.json first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port (optional, for Metro bundler if running in dev mode)
EXPOSE 8081

# Define the build command as the default entrypoint
# This will:
# 1. Run expo prebuild to generate native android code
# 2. Go to android directory
# 3. Build the APK
CMD ["/bin/bash", "-c", "npx expo prebuild --platform android && cd android && ./gradlew assembleRelease && echo 'Build Complete! APK is located at /app/android/app/build/outputs/apk/release/app-release.apk'"]
