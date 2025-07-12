//DescribeScene story
'use server';
/**
 * @fileOverview Generates a natural language description of the scene in front of the camera.
 *
 * - generateSceneDescription - A function that handles the scene description generation process.
 * - GenerateSceneDescriptionInput - The input type for the generateSceneDescription function.
 * - GenerateSceneDescriptionOutput - The return type for the generateSceneDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSceneDescriptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the scene, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateSceneDescriptionInput = z.infer<typeof GenerateSceneDescriptionInputSchema>;

const GenerateSceneDescriptionOutputSchema = z.object({
  sceneDescription: z.string().describe('A natural language description of the scene.'),
});
export type GenerateSceneDescriptionOutput = z.infer<typeof GenerateSceneDescriptionOutputSchema>;

export async function generateSceneDescription(input: GenerateSceneDescriptionInput): Promise<GenerateSceneDescriptionOutput> {
  return generateSceneDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSceneDescriptionPrompt',
  input: {schema: GenerateSceneDescriptionInputSchema},
  output: {schema: GenerateSceneDescriptionOutputSchema},
  prompt: `You are an AI assistant that helps visually impaired users understand their surroundings. Analyze the image provided and generate a short, precise description of the scene.

Your main goal is to provide an accurate estimation of the distance of objects from the camera. Use visual cues like the relative size of known objects (e.g., a person, a car, a water bottle) and perspective to make your judgment. For example, an object that appears smaller is likely further away.

The description should contain only important details. Focus on the main subjects, their immediate context, and their estimated distance (e.g., "A person is standing about 5 feet away"). Be as accurate as possible with the distance.

Photo: {{media url=photoDataUri}}
  `,
});

const generateSceneDescriptionFlow = ai.defineFlow(
  {
    name: 'generateSceneDescriptionFlow',
    inputSchema: GenerateSceneDescriptionInputSchema,
    outputSchema: GenerateSceneDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
