'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const popularPlaces: Record<string, string[]> = {
  delhi: ['India Gate', 'Qutub Minar', 'Humayun\'s Tomb', 'Red Fort', 'Lotus Temple'],
  mumbai: ['Gateway of India', 'Marine Drive', 'Elephanta Caves', 'Chhatrapati Shivaji Terminus'],
  goa: ['Baga Beach', 'Calangute Beach', 'Fort Aguada', 'Dudhsagar Falls'],
  jaipur: ['Hawa Mahal', 'Amber Palace', 'City Palace', 'Jantar Mantar'],
  bangalore: ['Lalbagh Botanical Garden', 'Bangalore Palace', 'Cubbon Park', 'ISKCON Temple Bangalore', 'Vidhana Soudha'],
};

export const getPopularPlaces = ai.defineTool(
  {
    name: 'getPopularPlaces',
    description: 'Returns a list of popular tourist places for a given city.',
    inputSchema: z.object({
      city: z.string().describe('The city for which to get popular places.'),
    }),
    outputSchema: z.array(z.string()),
  },
  async (input) => {
    console.log(`Getting popular places for ${input.city}`);
    // In a real app, this could call a Google Maps API or a database.
    return popularPlaces[input.city.toLowerCase()] || [];
  }
);
