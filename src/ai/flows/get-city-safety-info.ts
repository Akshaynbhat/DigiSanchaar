'use server';
/**
 * @fileOverview Generates a safety score and news summary for a given city.
 *
 * - getCitySafetyInfo - A function that provides a safety analysis for a city.
 * - GetCitySafetyInfoInput - The input type for the getCitySafetyInfo function.
 * - GetCitySafetyInfoOutput - The return type for the getCitySafetyInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetCitySafetyInfoInputSchema = z.object({
  city: z.string().describe('The name of the city to analyze.'),
});
export type GetCitySafetyInfoInput = z.infer<
  typeof GetCitySafetyInfoInputSchema
>;

const GetCitySafetyInfoOutputSchema = z.object({
  safetyScore: z
    .number()
    .describe(
      'A numerical safety score for the city, from 0 (very unsafe) to 100 (very safe), based on recent news and general safety data.'
    ),
  summary: z
    .string()
    .describe(
      'A concise summary of recent news and safety-related information for the city. Mention any specific alerts, common scams, or areas to be cautious of. The summary should be about 3-4 sentences long.'
    ),
  newsHeadlines: z.array(z.string()).describe('A list of 3-5 simulated recent news headlines related to safety and tourism in the city.')
});
export type GetCitySafetyInfoOutput = z.infer<
  typeof GetCitySafetyInfoOutputSchema
>;

export async function getCitySafetyInfo(
  input: GetCitySafetyInfoInput
): Promise<GetCitySafetyInfoOutput> {
  return getCitySafetyInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getCitySafetyInfoPrompt',
  input: {schema: GetCitySafetyInfoInputSchema},
  output: {schema: GetCitySafetyInfoOutputSchema},
  prompt: `You are a travel safety analyst AI. Your task is to provide a safety overview for a given city based on simulated recent events and general knowledge.

  For the city of {{{city}}}, provide a safety score from 0-100, a short summary of the current safety situation, and a few recent, relevant (but simulated) news headlines.

  - The safety score should reflect general safety for tourists.
  - The summary should be objective and informative, mentioning any recent issues or common problems tourists might face.
  - The headlines should sound like real news headlines and be relevant to a tourist's safety concerns.

  Your response MUST be a valid JSON object matching the required schema.
  `,
});

const getCitySafetyInfoFlow = ai.defineFlow(
  {
    name: 'getCitySafetyInfoFlow',
    inputSchema: GetCitySafetyInfoInputSchema,
    outputSchema: GetCitySafetyInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model failed to return a valid city safety analysis.");
    }
    return output;
  }
);
