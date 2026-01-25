'use server';

import { z } from 'zod';
import { serviceTypesList } from '@/lib/types';

// Input/Output schemas
const DiagnoseProblemInputSchema = z.object({
  description: z.string().describe("Описание проблемы с автомобилем"),
});
export type DiagnoseProblemInput = z.infer<typeof DiagnoseProblemInputSchema>;

const DiagnoseProblemOutputSchema = z.object({
  diagnosis: z.string().describe("Краткая диагностика проблемы"),
  suggestedService: z
    .enum(['Отогрев авто', 'Доставка топлива', 'Техпомощь', 'Эвакуатор'] as const)
    .nullable()
    .describe('Рекомендуемая услуга'),
});
export type DiagnoseProblemOutput = z.infer<typeof DiagnoseProblemOutputSchema>;

const systemPrompt = `Ты эксперт-автомеханик в Якутске, Россия. Ты помогаешь пользователю диагностировать проблему с автомобилем на основе описания. В Якутске очень холодно, поэтому многие проблемы связаны с погодой.

Проанализируй описание проблемы и дай краткую, полезную диагностику на русском языке. Затем предложи наиболее подходящую услугу из списка доступных сервисов.

Доступные услуги:
- "Отогрев авто": Услуга по прогреву автомобиля. Выбирай для проблем, связанных с холодом, замерзанием, двигатель не заводится зимой.
- "Доставка топлива": Доставка топлива. Выбирай для проблем с нехваткой бензина/топлива.
- "Техпомощь": Техническая помощь на дороге. Выбирай для спущенного колеса, разряженного аккумулятора, мелких поломок.
- "Эвакуатор": Услуга эвакуатора. Выбирай для серьезных аварий, поломок, когда машину нельзя починить на месте.

Если не можешь уверенно определить конкретную услугу, можешь вернуть null.

ВАЖНО: Отвечай ТОЛЬКО в формате JSON:
{
  "diagnosis": "твоя диагностика на русском",
  "suggestedService": "одна из услуг выше или null"
}`;

/**
 * Qwen AI diagnosis via Ollama (Local, Free)
 * Requires Ollama running locally with Qwen model
 */
export async function diagnoseProblemWithOllama(
  input: DiagnoseProblemInput
): Promise<DiagnoseProblemOutput> {
  const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
  const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b';

  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: `${systemPrompt}\n\nОписание проблемы: ${input.description}\n\nОтвет в формате JSON:`,
        stream: false,
        format: 'json',
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.response);

    return DiagnoseProblemOutputSchema.parse(result);
  } catch (error) {
    console.error('Ollama diagnosis error:', error);
    // Fallback to simple logic
    return fallbackDiagnosis(input.description);
  }
}

/**
 * Qwen AI diagnosis via Alibaba Cloud DashScope API
 * Requires DASHSCOPE_API_KEY environment variable
 */
export async function diagnoseProblemWithDashScope(
  input: DiagnoseProblemInput
): Promise<DiagnoseProblemOutput> {
  const API_KEY = process.env.DASHSCOPE_API_KEY;

  if (!API_KEY) {
    console.warn('DASHSCOPE_API_KEY not set, using fallback');
    return fallbackDiagnosis(input.description);
  }

  try {
    const response = await fetch(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'qwen-turbo',
          input: {
            messages: [
              {
                role: 'system',
                content: systemPrompt,
              },
              {
                role: 'user',
                content: `Описание проблемы: ${input.description}`,
              },
            ],
          },
          parameters: {
            result_format: 'message',
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`DashScope API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.output.choices[0].message.content;
    const result = JSON.parse(content);

    return DiagnoseProblemOutputSchema.parse(result);
  } catch (error) {
    console.error('DashScope diagnosis error:', error);
    return fallbackDiagnosis(input.description);
  }
}

/**
 * OpenAI-compatible API (can work with various providers)
 * Set OPENAI_API_KEY and OPENAI_BASE_URL for custom endpoints
 */
export async function diagnoseProblemWithOpenAI(
  input: DiagnoseProblemInput
): Promise<DiagnoseProblemOutput> {
  const API_KEY = process.env.OPENAI_API_KEY;
  const BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

  if (!API_KEY) {
    console.warn('OPENAI_API_KEY not set, using fallback');
    return fallbackDiagnosis(input.description);
  }

  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `Описание проблемы: ${input.description}`,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const result = JSON.parse(content);

    return DiagnoseProblemOutputSchema.parse(result);
  } catch (error) {
    console.error('OpenAI diagnosis error:', error);
    return fallbackDiagnosis(input.description);
  }
}

/**
 * Fallback diagnosis using simple keyword matching
 */
function fallbackDiagnosis(description: string): DiagnoseProblemOutput {
  const lowerDesc = description.toLowerCase();

  // Keyword matching
  if (
    lowerDesc.includes('не заводится') ||
    lowerDesc.includes('замерз') ||
    lowerDesc.includes('холод') ||
    lowerDesc.includes('мороз') ||
    lowerDesc.includes('прогре')
  ) {
    return {
      diagnosis: 'Похоже, проблема связана с холодом. Автомобилю нужен прогрев.',
      suggestedService: 'Отогрев авто',
    };
  }

  if (
    lowerDesc.includes('бензин') ||
    lowerDesc.includes('топлив') ||
    lowerDesc.includes('заправ') ||
    lowerDesc.includes('кончился')
  ) {
    return {
      diagnosis: 'Нехватка топлива. Требуется доставка бензина.',
      suggestedService: 'Доставка топлива',
    };
  }

  if (
    lowerDesc.includes('колесо') ||
    lowerDesc.includes('шина') ||
    lowerDesc.includes('аккумулятор') ||
    lowerDesc.includes('батарея') ||
    lowerDesc.includes('спустило')
  ) {
    return {
      diagnosis: 'Техническая проблема, требуется помощь на месте.',
      suggestedService: 'Техпомощь',
    };
  }

  if (
    lowerDesc.includes('авария') ||
    lowerDesc.includes('сломал') ||
    lowerDesc.includes('поломка') ||
    lowerDesc.includes('эвакуа')
  ) {
    return {
      diagnosis: 'Серьезная поломка, требуется эвакуация.',
      suggestedService: 'Эвакуатор',
    };
  }

  return {
    diagnosis: 'Требуется диагностика. Рекомендую вызвать техпомощь.',
    suggestedService: 'Техпомощь',
  };
}

/**
 * Main diagnosis function - automatically selects best available AI
 */
export async function diagnoseProblem(
  input: DiagnoseProblemInput
): Promise<DiagnoseProblemOutput> {
  // Priority: DashScope > Ollama > OpenAI > Fallback
  if (process.env.DASHSCOPE_API_KEY) {
    return diagnoseProblemWithDashScope(input);
  }

  if (process.env.OLLAMA_URL || process.env.OLLAMA_ENABLED === 'true') {
    return diagnoseProblemWithOllama(input);
  }

  if (process.env.OPENAI_API_KEY) {
    return diagnoseProblemWithOpenAI(input);
  }

  // Fallback to simple keyword matching
  return fallbackDiagnosis(input.description);
}
