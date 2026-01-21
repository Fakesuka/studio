'use server';
/**
 * @fileOverview An AI flow for diagnosing car problems.
 *
 * - diagnoseProblem - A function that handles the car problem diagnosis.
 * - DiagnoseProblemInput - The input type for the diagnoseProblem function.
 * - DiagnoseProblemOutput - The return type for the diagnoseProblem function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { serviceTypesList } from '@/lib/types';

const DiagnoseProblemInputSchema = z.object({
  description: z
    .string()
    .describe("The user's description of the car problem."),
});
export type DiagnoseProblemInput = z.infer<typeof DiagnoseProblemInputSchema>;

const DiagnoseProblemOutputSchema = z.object({
  diagnosis: z
    .string()
    .describe("A brief diagnosis of the car's problem in Russian."),
  suggestedService: z
    .enum(serviceTypesList)
    .nullable()
    .describe(
      'The most relevant service type for the problem from the provided list.'
    ),
});
export type DiagnoseProblemOutput = z.infer<typeof DiagnoseProblemOutputSchema>;

export async function diagnoseProblem(
  input: DiagnoseProblemInput
): Promise<DiagnoseProblemOutput> {
  return diagnoseProblemFlow(input);
}

const systemPrompt = `You are an expert car mechanic in Yakutsk, Russia. You are helping a user diagnose a car problem based on their description. It is very cold there, so many problems are related to the weather.

Analyze the problem description and provide a brief, helpful diagnosis in Russian. Then, suggest the most appropriate service from the list of available services.

Available services are:
- "Отогрев авто": Car heating/warming service. Choose for problems related to cold, freezing, engine not starting in winter.
- "Доставка топлива": Fuel delivery. Choose for problems related to running out of gas/fuel.
- "Техпомощь": Roadside assistance. Choose for issues like a flat tire, a dead battery that needs a jump start, etc.
- "Эвакуатор": Tow truck service. Choose for serious accidents, breakdowns where the car cannot be fixed on the spot, or when the problem is severe.

If you cannot confidently determine a specific service, you can suggest null.`;

const diagnoseProblemPrompt = ai.definePrompt({
  name: 'diagnoseProblemPrompt',
  input: { schema: DiagnoseProblemInputSchema },
  output: { schema: DiagnoseProblemOutputSchema },
  system: systemPrompt,
  prompt: `Problem Description: {{{description}}}`,
});

const diagnoseProblemFlow = ai.defineFlow(
  {
    name: 'diagnoseProblemFlow',
    inputSchema: DiagnoseProblemInputSchema,
    outputSchema: DiagnoseProblemOutputSchema,
  },
  async input => {
    const llmResponse = await diagnoseProblemPrompt(input);
    return llmResponse.output!;
  }
);
