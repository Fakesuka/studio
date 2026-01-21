'use server';

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize the AI instance for use across the server-side of the app.
export const ai = genkit({
  plugins: [googleAI()],
});
