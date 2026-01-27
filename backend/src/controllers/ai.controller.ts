import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b';
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;

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
 * Fallback diagnosis using keyword matching
 */
function fallbackDiagnosis(description: string): { diagnosis: string; suggestedService: string | null } {
  const lowerDesc = description.toLowerCase();

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
 * Diagnose problem using Ollama (local LLM)
 */
async function diagnosWithOllama(description: string): Promise<{ diagnosis: string; suggestedService: string | null }> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: `${systemPrompt}\n\nОписание проблемы: ${description}\n\nОтвет в формате JSON:`,
        stream: false,
        format: 'json',
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json() as { response: string };
    const result = JSON.parse(data.response);

    return {
      diagnosis: result.diagnosis || 'Не удалось определить проблему',
      suggestedService: result.suggestedService || null,
    };
  } catch (error) {
    console.error('Ollama diagnosis error:', error);
    throw error;
  }
}

/**
 * Diagnose problem using DashScope (Alibaba Qwen API)
 */
async function diagnosWithDashScope(description: string): Promise<{ diagnosis: string; suggestedService: string | null }> {
  if (!DASHSCOPE_API_KEY) {
    throw new Error('DASHSCOPE_API_KEY not configured');
  }

  try {
    const response = await fetch(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'qwen-turbo',
          input: {
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Описание проблемы: ${description}` },
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

    const data = await response.json() as { output: { choices: { message: { content: string } }[] } };
    const content = data.output.choices[0].message.content;
    const result = JSON.parse(content);

    return {
      diagnosis: result.diagnosis || 'Не удалось определить проблему',
      suggestedService: result.suggestedService || null,
    };
  } catch (error) {
    console.error('DashScope diagnosis error:', error);
    throw error;
  }
}

/**
 * AI Diagnosis endpoint
 * POST /api/ai/diagnose
 */
export async function diagnoseProblem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { description } = req.body;

    if (!description || description.length < 5) {
      res.status(400).json({ error: 'Описание проблемы слишком короткое' });
      return;
    }

    let result: { diagnosis: string; suggestedService: string | null };

    // Try AI providers in order of preference
    try {
      if (DASHSCOPE_API_KEY) {
        console.log('[AI] Using DashScope API');
        result = await diagnosWithDashScope(description);
      } else if (process.env.OLLAMA_ENABLED === 'true' || process.env.OLLAMA_URL) {
        console.log('[AI] Using Ollama (local)');
        result = await diagnosWithOllama(description);
      } else {
        console.log('[AI] Using fallback keyword matching');
        result = fallbackDiagnosis(description);
      }
    } catch (aiError) {
      console.error('[AI] AI provider failed, using fallback:', aiError);
      result = fallbackDiagnosis(description);
    }

    res.json(result);
  } catch (error: any) {
    console.error('Diagnose problem error:', error);
    res.status(500).json({ error: 'Ошибка диагностики' });
  }
}

/**
 * Check AI status
 * GET /api/ai/status
 */
export async function getAIStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const status: any = {
      dashscope: !!DASHSCOPE_API_KEY,
      ollama: false,
      ollamaUrl: OLLAMA_URL,
      ollamaModel: OLLAMA_MODEL,
    };

    // Check if Ollama is available
    if (process.env.OLLAMA_ENABLED === 'true' || process.env.OLLAMA_URL) {
      try {
        const response = await fetch(`${OLLAMA_URL}/api/tags`, { method: 'GET' });
        if (response.ok) {
          const data = await response.json() as { models?: { name: string }[] };
          status.ollama = true;
          status.ollamaModels = data.models?.map((m) => m.name) || [];
        }
      } catch (e) {
        status.ollama = false;
        status.ollamaError = 'Connection failed';
      }
    }

    res.json(status);
  } catch (error: any) {
    console.error('AI status error:', error);
    res.status(500).json({ error: 'Failed to get AI status' });
  }
}
