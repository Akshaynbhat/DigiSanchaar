'use server';
/**
 * @fileOverview Fetches weather information for a given city.
 *
 * - getWeatherInfo - A function that provides weather data for a city.
 * - GetWeatherInfoInput - The input type for the function.
 * - GetWeatherInfoOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GetWeatherInfoInputSchema = z.object({
  city: z.string().describe('The name of the city to get weather for.'),
});
export type GetWeatherInfoInput = z.infer<typeof GetWeatherInfoInputSchema>;

const GetWeatherInfoOutputSchema = z.object({
  temperature: z.number().nullable().describe('The current temperature in Celsius.'),
  description: z.string().nullable().describe('A short description of the weather (e.g., "clear sky").'),
  icon: z.string().nullable().describe('A URL for the weather icon.'),
  error: z.string().nullable().describe('An error message if fetching failed.'),
});
export type GetWeatherInfoOutput = z.infer<typeof GetWeatherInfoOutputSchema>;


export const getWeatherInfo = ai.defineFlow(
  {
    name: 'getWeatherInfo',
    inputSchema: GetWeatherInfoInputSchema,
    outputSchema: GetWeatherInfoOutputSchema,
  },
  async ({ city }) => {
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey || apiKey === 'YOUR_WEATHER_API_KEY' || apiKey === "AIzaSyD6hmR5DeEypYo19eq80PuZRHg2q3CwNqM") {
      console.error("Weather API key is not configured.");
      return {
        temperature: null,
        description: 'Weather service not configured.',
        icon: null,
        error: 'The weather service is not configured by the administrator.',
      };
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch weather data');
      }

      const data = await response.json();

      return {
        temperature: data.main.temp,
        description: data.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        error: null,
      };
    } catch (error: any) {
      console.error(`Failed to fetch weather for ${city}:`, error);
      return {
        temperature: null,
        description: null,
        icon: null,
        error: `Could not retrieve weather data: ${error.message}`,
      };
    }
  }
);
