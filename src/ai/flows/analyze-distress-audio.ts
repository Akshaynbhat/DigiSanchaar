'use server';
/**
 * @fileOverview Analyzes an audio clip for signs of distress.
 *
 * - analyzeDistressAudio - A function that takes audio data and returns an analysis.
 * - AnalyzeDistressAudioInput - The input type for the function.
 * - AnalyzeDistressAudioOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDistressAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A recording of the user's surroundings, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:audio/webm;base64,<encoded_data>'."
    ),
});
export type AnalyzeDistressAudioInput = z.infer<
  typeof AnalyzeDistressAudioInputSchema
>;

const AnalyzeDistressAudioOutputSchema = z.object({
  isDistress: z
    .boolean()
    .describe('Whether the audio contains clear signs of distress, such as shouting, screaming, or urgent pleas for help.'),
  summary: z
    .string()
    .describe('A brief, one-sentence summary of the sounds heard in the audio.'),
  keywords: z
    .array(z.string())
    .describe('A list of keywords or phrases detected in the audio, such as "help", "stop", "police", or other urgent language.'),
});
export type AnalyzeDistressAudioOutput = z.infer<
  typeof AnalyzeDistressAudioOutputSchema
>;

export async function analyzeDistressAudio(
  input: AnalyzeDistressAudioInput
): Promise<AnalyzeDistressAudioOutput> {
  return analyzeDistressAudioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDistressAudioPrompt',
  input: {schema: AnalyzeDistressAudioInputSchema},
  output: {schema: AnalyzeDistressAudioOutputSchema},
  prompt: `You are an AI audio analyst for an emergency services app. Your task is to analyze an audio clip and determine if it contains signs of distress.

  Listen to the provided audio clip: {{media url=audioDataUri}}

  - Determine if there are clear signs of distress. This could include shouting, screaming, sounds of a struggle, or urgent phrases like "help me," "police," "stop," etc. Set 'isDistress' to true if such signs are present.
  - Provide a very brief, one-sentence summary of the sounds you hear.
  - Extract any relevant keywords or short phrases that indicate the context of the situation.

  Your response MUST be a valid JSON object matching the required schema.
  `,
});

const analyzeDistressAudioFlow = ai.defineFlow(
  {
    name: 'analyzeDistressAudioFlow',
    inputSchema: AnalyzeDistressAudioInputSchema,
    outputSchema: AnalyzeDistressAudioOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model failed to return a valid audio analysis.");
    }
    return output;
  }
);
