'use server';

/**
 * @fileOverview AI flow to suggest a starting price for a service request.
 *
 * - suggestStartingPrice - A function that suggests a starting price for a service request.
 * - SuggestStartingPriceInput - The input type for the suggestStartingPrice function.
 * - SuggestStartingPriceOutput - The return type for the suggestStartingPrice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestStartingPriceInputSchema = z.object({
  serviceType: z.string().describe('Type of service requested (e.g., отогрев, доставка топлива, техпомощь, эвакуатор).'),
  distance: z.number().describe('Distance to the user in kilometers.'),
  timeOfDay: z.string().describe('Time of day the service is requested (e.g., morning, afternoon, evening, night).'),
  urgency: z.string().describe('How urgent is the service request (e.g., low, medium, high).'),
});
export type SuggestStartingPriceInput = z.infer<typeof SuggestStartingPriceInputSchema>;

const SuggestStartingPriceOutputSchema = z.object({
  suggestedPrice: z.number().describe('The suggested starting price for the service request in rubles.'),
  reasoning: z.string().describe('The reasoning behind the suggested price.'),
});
export type SuggestStartingPriceOutput = z.infer<typeof SuggestStartingPriceOutputSchema>;

export async function suggestStartingPrice(input: SuggestStartingPriceInput): Promise<SuggestStartingPriceOutput> {
  return suggestStartingPriceFlow(input);
}

const suggestStartingPricePrompt = ai.definePrompt({
  name: 'suggestStartingPricePrompt',
  input: {schema: SuggestStartingPriceInputSchema},
  output: {schema: SuggestStartingPriceOutputSchema},
  prompt: `You are an AI assistant specialized in suggesting starting prices for roadside assistance services in Yakutsk, Russia. Consider the following factors to provide a fair and reasonable price in rubles, along with a brief explanation:

Service Type: {{{serviceType}}}
Distance to User: {{{distance}}} km
Time of Day: {{{timeOfDay}}}
Urgency: {{{urgency}}}

Provide the suggested price and the reasoning behind it. Be realistic about the conditions in Yakutsk. Consider the average prices for similar services.
`,
});

const suggestStartingPriceFlow = ai.defineFlow(
  {
    name: 'suggestStartingPriceFlow',
    inputSchema: SuggestStartingPriceInputSchema,
    outputSchema: SuggestStartingPriceOutputSchema,
  },
  async input => {
    const {output} = await suggestStartingPricePrompt(input);
    return output!;
  }
);
