'use server';
/**
 * @fileOverview An AI flow to diagnose car problems.
 *
 * - diagnoseProblem - A function that handles the car problem diagnosis.
 * - DiagnoseProblemInputSchema - The input type for the diagnoseProblem function.
 * - DiagnoseProblemOutputSchema - The return type for the diagnoseProblem function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const serviceTypeValues = [
  'отогрев',
  'доставка топлива',
  'техпомощь',
  'эвакуатор',
] as const;

export const DiagnoseProblemInputSchema = z.object({
  description: z.string().describe('A description of the car problem.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo of the problem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DiagnoseProblemInput = z.infer<typeof DiagnoseProblemInputSchema>;

export const DiagnoseProblemOutputSchema = z.object({
  diagnosis: z
    .string()
    .describe(
      'A brief, one or two-sentence diagnosis of the likely car problem based on the description and photo. Write in Russian.'
    ),
  suggestedService: z
    .enum(serviceTypeValues)
    .describe(
      'The most appropriate service type value to address the diagnosed problem.'
    ),
});
export type DiagnoseProblemOutput = z.infer<typeof DiagnoseProblemOutputSchema>;

const diagnoseProblemPrompt = ai.definePrompt({
  name: 'diagnoseProblemPrompt',
  input: { schema: DiagnoseProblemInputSchema },
  output: { schema: DiagnoseProblemOutputSchema },
  config: {
    model: 'googleai/gemini-2.5-flash',
  },
  prompt: `You are an expert car mechanic in Yakutia, Russia. Your task is to diagnose a car problem based on a user's description and an optional photo. Provide a short, one or two-sentence diagnosis in Russian and suggest the most appropriate service type *value* from the following list of values: ${serviceTypeValues.join(
    ', '
  )}.

The user is likely in a cold environment, so consider problems related to cold weather.

Use the following information:
Description: {{{description}}}
{{#if photoDataUri}}
Photo: {{media url=photoDataUri}}
{{/if}}
`,
});

const diagnoseProblemFlow = ai.defineFlow(
  {
    name: 'diagnoseProblemFlow',
    inputSchema: DiagnoseProblemInputSchema,
    outputSchema: DiagnoseProblemOutputSchema,
  },
  async (input) => {
    const { output } = await diagnoseProblemPrompt(input);
    return output!;
  }
);

export async function diagnoseProblem(
  input: DiagnoseProblemInput
): Promise<DiagnoseProblemOutput> {
  return diagnoseProblemFlow(input);
}
