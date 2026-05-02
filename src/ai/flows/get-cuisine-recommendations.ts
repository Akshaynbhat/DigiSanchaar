
'use server';
/**
 * @fileOverview Recommends famous local dishes for a given city and places to try them.
 *
 * - getCuisineRecommendations - A function that provides food recommendations.
 * - GetCuisineRecommendationsInput - The input type for the function.
 * - GetCuisineRecommendationsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetCuisineRecommendationsInputSchema = z.object({
  city: z.string().describe('The name of the city to get food recommendations for.'),
});
export type GetCuisineRecommendationsInput = z.infer<
  typeof GetCuisineRecommendationsInputSchema
>;

const DishSchema = z.object({
    name: z.string().describe('The name of the dish.'),
    description: z.string().describe('A short, enticing one-sentence description of the dish.'),
    famousPlaces: z.array(z.string()).describe('A list of 2-3 famous (but simulated) restaurants or areas known for this dish.'),
});

const GetCuisineRecommendationsOutputSchema = z.object({
  dishes: z.array(DishSchema).describe('A list of 3 to 5 recommended dishes.')
});
export type GetCuisineRecommendationsOutput = z.infer<
  typeof GetCuisineRecommendationsOutputSchema
>;

export async function getCuisineRecommendations(
  input: GetCuisineRecommendationsInput
): Promise<GetCuisineRecommendationsOutput> {
  return getCuisineRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getCuisineRecommendationsPrompt',
  input: {schema: GetCuisineRecommendationsInputSchema},
  output: {schema: GetCuisineRecommendationsOutputSchema},
  prompt: `You are an expert food critic specializing in Indian cuisine. For the city of {{{city}}}, recommend 3-5 must-try local dishes.

  For each dish, provide:
  - The name of the dish.
  - A short, single-sentence description that is appealing to a tourist.
  - A list of 2 or 3 famous (but can be simulated/representative) restaurant names or areas where one can find an excellent version of this dish.

  Your response MUST be a valid JSON object matching the required schema.
  `,
});

const getCuisineRecommendationsFlow = ai.defineFlow(
  {
    name: 'getCuisineRecommendationsFlow',
    inputSchema: GetCuisineRecommendationsInputSchema,
    outputSchema: GetCuisineRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model failed to return valid cuisine recommendations.");
    }
    return output;
  }
);
