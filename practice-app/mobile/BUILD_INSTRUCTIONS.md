# Mobile App Build Instructions

This guide explains how to build the Android APK for the mobile application using Docker. This ensures a consistent build environment without needing to install Android Studio or the Android SDK on your host machine.

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed and running.

## Configuration

1.  Navigate to the `practice-app/mobile` directory.
2.  Create a `.env` file based on `.env.example`:
    ```bash
    cp .env.example .env
    ```
3.  **Configure API URL (Crucial Step):**
    The `API_BASE_URL` you set here will be **baked into the APK**. The app will try to connect to this URL when installed on your phone/emulator.
    *   **If testing on Android Emulator:** Use `http://10.0.2.2:8000`. This is a special alias that points to your computer's localhost.
    *   **If testing on a Physical Device:** You MUST use your computer's local network IP address (e.g., `http://192.168.1.35:8000`).
        *   *To find your IP:* Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) and look for `en0` or `wlan0`.
    *   **Do NOT use `localhost` or `127.0.0.1`**, as that refers to the phone itself, not your computer.

## Building the Docker Image

Build the Docker image. This step will install all dependencies (Android SDK, Node.js, etc.) and may take some time (10-15 minutes depending on internet speed).

```bash
docker build -t mobile-app-builder .
```

## Building the APK

Once the image is built, run a container to generate the APK. The APK will be built inside the container.

```bash
# Run the container and build the APK
docker run --name mobile-build-container mobile-app-builder
```

## Extracting the APK

After the build completes successfully, copy the generated APK from the container to your host machine.

```bash
# Copy the APK to your current directory
docker cp mobile-build-container:/app/android/app/build/outputs/apk/release/app-release.apk .

# (Optional) Remove the container
docker rm mobile-build-container
```

## Installing the APK

You can now install the `app-release.apk` on your Android device or emulator.

### Using Android Studio Emulator
Yes! You can use the emulator from Android Studio to run the APK you built with Docker.
1.  Open Android Studio and start your emulator (Virtual Device).
2.  Simply **drag and drop** the `app-release.apk` file from your file explorer onto the emulator window.
3.  The app will install and appear in the app drawer.

### Using Physical Device
-   Transfer the file to your phone and install it.
-   Or use `adb install app-release.apk` if you have platform-tools installed.

## Troubleshooting

-   **Docker Daemon Error:** If you see "Cannot connect to the Docker daemon", make sure **Docker Desktop** is running on your computer.
-   **Build Failures:** If the build fails, check the logs output by the `docker run` command. Common issues include network timeouts during SDK download or Gradle sync errors.
-   **Permissions:** Ensure the `.env` file exists and is readable.
