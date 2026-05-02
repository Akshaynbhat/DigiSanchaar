'use server';

/**
 * @fileOverview Generates a safety score for a trip based on itinerary and location data.
 *
 * - generateTripSafetyScore - A function that generates the safety score.
 * - GenerateTripSafetyScoreInput - The input type for the generateTripSafetyScore function.
 * - GenerateTripSafetyScoreOutput - The return type for the generateTripSafetyScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getPopularPlaces } from '../tools/get-popular-places';

const GenerateTripSafetyScoreInputSchema = z.object({
  itinerary: z
    .string()
    .describe('A detailed itinerary of the trip, including locations, dates, and times.'),
  locationData: z
    .string()
    .describe(
      'Historical location data for the areas in the itinerary, including crime rates, safety reports, and other relevant information.'
    ),
});
export type GenerateTripSafetyScoreInput = z.infer<
  typeof GenerateTripSafetyScoreInputSchema
>;

const LocationSchema = z.object({
  name: z.string().describe('The name of the location.'),
  lat: z.number().describe('The latitude of the location.'),
  lng: z.number().describe('The longitude of the location.'),
});

const GenerateTripSafetyScoreOutputSchema = z.object({
  safetyScore: z
    .number()
    .describe(
      'A numerical safety score for the trip, ranging from 0 (very unsafe) to 100 (very safe).'
    ),
  riskAssessment: z
    .string()
    .describe(
      'A detailed risk assessment of the trip, including potential hazards and safety recommendations.'
    ),
  locations: z.array(LocationSchema).describe('An array of locations extracted from the itinerary with their geocoordinates.')
});
export type GenerateTripSafetyScoreOutput = z.infer<
  typeof GenerateTripSafetyScoreOutputSchema
>;

export async function generateTripSafetyScore(
  input: GenerateTripSafetyScoreInput
): Promise<GenerateTripSafetyScoreOutput> {
  return generateTripSafetyScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTripSafetyScorePrompt',
  input: {schema: GenerateTripSafetyScoreInputSchema},
  output: {schema: GenerateTripSafetyScoreOutputSchema},
  tools: [getPopularPlaces],
  prompt: `You are an AI safety assistant that analyzes trip itineraries and location data to generate a safety score and risk assessment. You also extract key locations and their geocoordinates from the itinerary.

  Analyze the following itinerary and location data to determine a safety score between 0 and 100, and provide a detailed risk assessment.
  Extract the primary locations mentioned in the itinerary and provide their latitude and longitude.

  Itinerary: {{{itinerary}}}
  Location Data: {{{locationData}}}

  Consider factors such as crime rates, safety reports, and potential hazards.
  Provide a detailed risk assessment of the trip, including potential hazards and safety recommendations.
  The safety score should be a number between 0 and 100.
  The risk assessment should be a string describing the risks and recommendations.
  The locations should be an array of objects, each with a name, lat, and lng.
  
  If you cannot determine a value for a field, return a sensible default (e.g., 0 for score, empty string for assessment, empty array for locations). Your response MUST be a valid JSON object matching the required schema.
`,
});

const generateTripSafetyScoreFlow = ai.defineFlow(
  {
    name: 'generateTripSafetyScoreFlow',
    inputSchema: GenerateTripSafetyScoreInputSchema,
    outputSchema: GenerateTripSafetyScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model failed to return a valid safety score analysis.");
    }
    return output;
  }
);
