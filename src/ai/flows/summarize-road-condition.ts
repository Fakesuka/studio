'use server';
/**
 * @fileOverview Summarizes road conditions from an image for drivers in Yakutia.
 *
 * - summarizeRoadCondition - A function that summarizes road conditions from an image.
 * - SummarizeRoadConditionInput - The input type for the summarizeRoadCondition function.
 * - SummarizeRoadConditionOutput - The return type for the summarizeRoadCondition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeRoadConditionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the road conditions, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SummarizeRoadConditionInput = z.infer<typeof SummarizeRoadConditionInputSchema>;

const SummarizeRoadConditionOutputSchema = z.object({
  summary: z.string().describe('A summary of the road conditions.'),
});
export type SummarizeRoadConditionOutput = z.infer<typeof SummarizeRoadConditionOutputSchema>;

export async function summarizeRoadCondition(input: SummarizeRoadConditionInput): Promise<SummarizeRoadConditionOutput> {
  return summarizeRoadConditionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeRoadConditionPrompt',
  input: {schema: SummarizeRoadConditionInputSchema},
  output: {schema: SummarizeRoadConditionOutputSchema},
  prompt: `You are an AI assistant helping drivers in Yakutia understand road conditions.

  Given the following image of the road, summarize the road conditions for other drivers. Be concise and informative.

  Road Photo: {{media url=photoDataUri}}`,
});

const summarizeRoadConditionFlow = ai.defineFlow(
  {
    name: 'summarizeRoadConditionFlow',
    inputSchema: SummarizeRoadConditionInputSchema,
    outputSchema: SummarizeRoadConditionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
