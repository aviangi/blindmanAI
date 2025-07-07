# SightSpeak - AI-Powered Visual Assistant

SightSpeak is a web application designed to assist visually impaired users by providing real-time descriptions of their surroundings. Using the device's camera, it leverages advanced AI to detect objects, describe scenes, and convert those descriptions into audible speech.

This project is built with Next.js, TypeScript, and Tailwind CSS, and utilizes Google's Gemini AI through Firebase Genkit for its scene description capabilities.

## Core Features

-   **Live Camera Feed**: Uses the device's webcam to provide a real-time view of the environment.
-   **Real-Time Object Detection**: Simulates the detection of objects in the camera's view, displaying their names and positions.
-   **AI Scene Description**: With a single click, the app captures the current scene, analyzes it using a GenAI flow, and generates a coherent, natural-language description.
-   **Text-to-Speech (TTS)**: Automatically reads the generated scene description aloud using the browser's native speech synthesis capabilities.
-   **Interactive Controls**: Simple, accessible controls to pause/resume the camera feed, generate descriptions, enhance them, and save a snapshot of the current view.

## Getting Started

Follow these instructions to get a local copy up and running for development and testing.

### Prerequisites

-   [Node.js](https://nodejs.org/) (version 20 or later)
-   [npm](https://www.npmjs.com/) (usually comes with Node.js)
-   A Google AI API Key. You can obtain one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env` in the root of your project and add your Google AI API key:
    ```
    GOOGLE_API_KEY=your_google_api_key_here
    ```
    This key is necessary for the scene description features to work.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This command starts the Next.js application, which will be accessible at [http://localhost:9002](http://localhost:9002).

## Usage

1.  **Grant Camera Permission**: When you first open the application, your browser will prompt you for camera access. Please allow it to enable the live video feed.

2.  **Explore**: The camera will start, and you'll see simulated object detection boxes appearing on the screen.

3.  **Controls**:
    -   **Describe Scene** (`Sparkles` icon): Click this to generate and hear a description of the current scene. A loading spinner will indicate that the AI is processing.
    -   **Enhance Description** (`Wand2` icon): After a description is generated, this button appears. Click it to get a more detailed version of the initial description.
    -   **Pause/Resume** (`Pause`/`Play` icons): Freeze or unfreeze the camera feed. You can still generate descriptions from a paused frame.
    -   **Snapshot** (`Camera` icon): Save the current frame (with object overlays) as a PNG image to your device.

## Platform Permissions

As a web application, SightSpeak requires the following browser permissions:

-   **Camera**: Essential for the live video feed. The user will be prompted to grant access on the first visit.
-   **Internet**: Required to communicate with the Google AI backend for scene description.

No special microphone or storage permissions are needed for the core functionality, as TTS is handled by the browser and snapshots are downloaded directly.
