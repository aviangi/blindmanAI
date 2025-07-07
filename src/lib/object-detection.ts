export type DetectedObject = {
  id: string;
  label: string;
  confidence: number;
  box: [number, number, number, number]; // [x, y, width, height] as fractions of video dimensions
};

const MOCK_OBJECTS = [
  "laptop",
  "water bottle",
  "keyboard",
  "mouse",
  "monitor",
  "person",
  "cup",
  "phone",
  "book",
  "chair",
  "desk",
];

// This function simulates an API call to an object detection service.
export const detectObjects = async (): Promise<DetectedObject[]> => {
  // In a real app, you would capture a frame and send it to a backend service.
  // For this mock, we'll just return some random data.
  return new Promise((resolve) => {
    setTimeout(() => {
      const numObjects = Math.floor(Math.random() * 4) + 1; // 1 to 4 objects
      const detected: DetectedObject[] = [];
      const usedLabels = new Set<string>();

      for (let i = 0; i < numObjects; i++) {
        let label = MOCK_OBJECTS[Math.floor(Math.random() * MOCK_OBJECTS.length)];
        while (usedLabels.has(label)) {
          label = MOCK_OBJECTS[Math.floor(Math.random() * MOCK_OBJECTS.length)];
        }
        usedLabels.add(label);

        const width = Math.random() * 0.2 + 0.15; // 15% to 35% width
        const height = Math.random() * 0.3 + 0.2; // 20% to 50% height
        const x = Math.random() * (1 - width);
        const y = Math.random() * (1 - height);

        detected.push({
          id: `${label}-${i}`,
          label: label,
          confidence: Math.random() * 0.3 + 0.7, // 70% to 100%
          box: [x, y, width, height],
        });
      }
      resolve(detected);
    }, 250); // Simulate network latency
  });
};
