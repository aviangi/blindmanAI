# **App Name**: SightSpeak

## Core Features:

- Live Camera Object Detection: Launches the back camera in full-screen live preview mode, displaying object names and confidence scores, and distance estimates.
- Scene Description with TTS: Uses GPT-4 Vision, analyzing camera frames to generate natural language summaries of the scene and converting descriptions to speech.
- Pause/Resume/Snapshot Controls: Floating UI buttons for pausing, resuming, taking snapshots and scene descriptions of paused frame.
- AI assistance with Scene Description: Uses a tool that provides assistance with reasoning about image details that should be included in the Scene Description
- Responsive & Accessible UI: Adaptive layout for different screen sizes, portrait and landscape orientations, and adherence to accessibility standards.
- Performance optimization: Asynchronous calls to minimize performance impact.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to convey reliability and focus, aligning with the app's assistive nature.
- Background color: Light gray (#F0F2F5), a neutral backdrop ensuring that on-screen elements and text are easily discernible.
- Accent color: Bright yellow (#FFEB3B), employed judiciously to highlight interactive components such as the 'Describe Scene' button.
- Body and headline font: 'PT Sans', a versatile, neutral sans-serif appropriate for text of any length.
- Clear, minimalist icons to represent actions like pause, resume, and snapshot.
- Floating, semi-transparent buttons overlaying the camera feed for minimal obstruction.
- Simple loading animations (e.g., a spinner) while processing scene descriptions or awaiting TTS output.