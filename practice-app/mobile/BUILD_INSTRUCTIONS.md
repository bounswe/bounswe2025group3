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
3.  Update the `API_BASE_URL` in `.env` if necessary.
    -   **Emulator:** Use `http://10.0.2.2:8000`
    -   **Physical Device:** Use your computer's local IP address (e.g., `http://192.168.1.x:8000`).

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

-   **Emulator:** Drag and drop the APK file onto the emulator window.
-   **Physical Device:** Transfer the file to your phone and install it, or use `adb install app-release.apk`.

## Troubleshooting

-   **Build Failures:** If the build fails, check the logs output by the `docker run` command. Common issues include network timeouts during SDK download or Gradle sync errors.
-   **Permissions:** Ensure the `.env` file exists and is readable.
