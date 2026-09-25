import { env } from '@/lib/env';
import { AIError } from '../errors/ai-error';
import type { AIProvider, AIRequest, AIResult, TokenUsage } from '../types/provider';

interface GeminiCandidate {
  content?: {
    parts?: Array<{
      text?: string;
    }>;
  };
  finishReason?: string;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

export const DEFAULT_GEMINI_FALLBACK_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
];

export class GeminiProvider implements AIProvider {
  readonly name = 'gemini';
  private readonly apiKey: string;
  private readonly defaultModel: string;
  private readonly fallbackModels: string[];

  constructor(options?: {
    apiKey?: string;
    defaultModel?: string;
    fallbackModels?: string[];
  }) {
    this.apiKey = options?.apiKey !== undefined ? options.apiKey : (env.GEMINI_API_KEY || '');
    this.defaultModel = options?.defaultModel || env.GEMINI_MODEL || 'gemini-3.8-flash';
    this.fallbackModels =
      options?.fallbackModels ||
      (env.GEMINI_FALLBACK_MODELS
        ? env.GEMINI_FALLBACK_MODELS.split(',').map((m) => m.trim()).filter(Boolean)
        : DEFAULT_GEMINI_FALLBACK_MODELS);
  }

  async generateStructuredOutput<T>(request: AIRequest<T>): Promise<AIResult<T>> {
    if (!this.apiKey) {
      throw AIError.auth('GEMINI_API_KEY tidak dikonfigurasi pada server.');
    }

    const primaryModel = request.model || this.defaultModel;
    const timeoutMs = request.timeoutMs ?? 15000;

    // Order of models to try: primary model first, followed by fallbacks without duplicates
    const candidateModels = Array.from(
      new Set([primaryModel, ...this.fallbackModels]),
    );

    let lastError: unknown;

    for (let i = 0; i < candidateModels.length; i++) {
      const currentModel = candidateModels[i];

      try {
        // Execute with max 1 transient retry on the current model
        return await this.executeWithRetry(async () => {
          return this.sendRequest(request, currentModel, timeoutMs);
        });
      } catch (err: unknown) {
        lastError = err;

        // If error is authentication or safety, fail immediately (model fallback will not help)
        if (
          err instanceof AIError &&
          (err.code === 'AUTHENTICATION_ERROR' || err.code === 'SAFETY_VIOLATION')
        ) {
          throw err;
        }

        const isEligibleForFallback =
          err instanceof AIError &&
          (err.code === 'RATE_LIMIT' ||
            err.statusCode === 429 ||
            err.statusCode === 404 ||
            err.statusCode >= 500 ||
            err.message.toLowerCase().includes('not found') ||
            err.message.toLowerCase().includes('high demand') ||
            err.message.toLowerCase().includes('spikes in demand') ||
            err.message.toLowerCase().includes('overloaded') ||
            err.message.toLowerCase().includes('unavailable') ||
            err.message.toLowerCase().includes('lonjakan'));

        const hasNextModel = i < candidateModels.length - 1;

        if (isEligibleForFallback && hasNextModel) {
          const nextModel = candidateModels[i + 1];
          console.warn(
            `[GeminiProvider] Model "${currentModel}" mengalami kendala (${
              err instanceof Error ? err.message : 'error'
            }). Otomatis beralih ke model berikutnya: "${nextModel}"...`,
          );
          continue;
        }

        // Re-throw if not eligible for fallback or no more models available
        throw err;
      }
    }

    throw (
      lastError ||
      AIError.provider(
        `Layanan asisten AI sedang mengalami lonjakan beban sementara. Silakan coba kembali dalam beberapa saat.`,
        503,
      )
    );
  }

  private async sendRequest<T>(
    request: AIRequest<T>,
    model: string,
    timeoutMs: number,
  ): Promise<AIResult<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

    const body: Record<string, unknown> = {
      contents: [
        {
          role: 'user',
          parts: [{ text: request.prompt }],
        },
      ],
      generationConfig: {
        temperature: request.temperature ?? 0.2,
        maxOutputTokens: request.maxTokens ?? 2048,
        responseMimeType: 'application/json',
      },
    };

    if (request.systemPrompt) {
      body.systemInstruction = {
        parts: [{ text: request.systemPrompt }],
      };
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw AIError.timeout(timeoutMs);
      }
      throw AIError.provider(
        err instanceof Error ? err.message : 'Koneksi ke layanan AI gagal',
        503,
        err,
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const parsedError = JSON.parse(errorText) as GeminiResponse;
        if (parsedError.error?.message) {
          errorMessage = parsedError.error.message;
        }
      } catch {
        // use fallback error message
      }

      if (response.status === 401 || response.status === 403) {
        throw AIError.auth(`Otentikasi layanan AI gagal: ${errorMessage}`);
      }
      if (response.status === 429) {
        throw AIError.rateLimit(
          `Batas kuota layanan AI terlampaui: ${errorMessage}`,
        );
      }
      if (
        response.status === 404 ||
        (response.status === 400 && errorMessage.toLowerCase().includes('not found'))
      ) {
        throw AIError.provider(
          `Model ${model} tidak ditemukan atau tidak tersedia: ${errorMessage}`,
          404,
        );
      }
      if (response.status === 400 && errorMessage.toLowerCase().includes('safety')) {
        throw AIError.safety(`Konten diblokir oleh filter keamanan: ${errorMessage}`);
      }
      if (
        response.status === 503 ||
        response.status === 502 ||
        response.status === 504 ||
        errorMessage.toLowerCase().includes('high demand') ||
        errorMessage.toLowerCase().includes('spikes in demand') ||
        errorMessage.toLowerCase().includes('overloaded')
      ) {
        throw AIError.provider(
          `Layanan asisten AI sedang mengalami lonjakan permintaan tinggi: ${errorMessage}`,
          503,
        );
      }

      throw AIError.provider(errorMessage, response.status);
    }

    const data = (await response.json()) as GeminiResponse;

    // Check candidate and safety finish reason
    const candidate = data.candidates?.[0];
    if (!candidate) {
      throw AIError.invalidOutput('Tidak ada respons yang dihasilkan oleh asisten AI.');
    }

    if (candidate.finishReason === 'SAFETY') {
      throw AIError.safety('Output ditolak oleh kebijakan keamanan konten asisten AI.');
    }

    const rawText = candidate.content?.parts?.[0]?.text || '';
    if (!rawText.trim()) {
      throw AIError.invalidOutput('Respons kosong diterima dari asisten AI.');
    }

    // Extract and validate JSON
    const parsedData = this.parseAndValidate(rawText, request.schema);

    const usage: TokenUsage = {
      promptTokens: data.usageMetadata?.promptTokenCount,
      completionTokens: data.usageMetadata?.candidatesTokenCount,
      totalTokens: data.usageMetadata?.totalTokenCount,
    };

    return {
      data: parsedData,
      rawText,
      usage,
      model,
      provider: this.name,
    };
  }

  private parseAndValidate<T>(rawText: string, schema: AIRequest<T>['schema']): T {
    let cleanJson = rawText.trim();

    // Strip markdown code fences if present
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (parseErr) {
      throw AIError.invalidOutput(
        `Gagal mem-parsing format JSON: ${parseErr instanceof Error ? parseErr.message : 'Syntax error'}`,
        { rawText },
      );
    }

    const validation = schema.safeParse(parsed);
    if (!validation.success) {
      throw AIError.invalidOutput(
        validation.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', '),
        validation.error.format(),
      );
    }

    return validation.data;
  }

  private async executeWithRetry<T>(
    fn: () => Promise<T>,
  ): Promise<T> {
    try {
      return await fn();
    } catch (err: unknown) {
      if (err instanceof AIError && err.isRetryable) {
        // Wait 500ms before single transient retry
        await new Promise((resolve) => setTimeout(resolve, 500));
        return await fn();
      }
      throw err;
    }
  }
}
