export type AIErrorCode =
  | 'TIMEOUT'
  | 'RATE_LIMIT'
  | 'INVALID_OUTPUT'
  | 'PROVIDER_ERROR'
  | 'DISABLED'
  | 'SAFETY_VIOLATION'
  | 'AUTHENTICATION_ERROR'
  | 'INPUT_TOO_LARGE';

export class AIError extends Error {
  readonly code: AIErrorCode;
  readonly isRetryable: boolean;
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(
    code: AIErrorCode,
    message: string,
    options?: {
      cause?: unknown;
      details?: unknown;
      statusCode?: number;
      isRetryable?: boolean;
    },
  ) {
    super(message);
    this.name = 'AIError';
    this.code = code;
    this.details = options?.details;
    this.statusCode = options?.statusCode ?? 500;

    // Retryable only for transient network/server failures
    if (options?.isRetryable !== undefined) {
      this.isRetryable = options.isRetryable;
    } else {
      this.isRetryable = code === 'TIMEOUT' || (code === 'PROVIDER_ERROR' && this.statusCode >= 500);
    }

    if (options?.cause) {
      this.cause = options.cause;
    }
  }

  static timeout(timeoutMs: number): AIError {
    return new AIError(
      'TIMEOUT',
      `Permintaan AI melebihi batas waktu ${timeoutMs / 1000} detik. Silakan coba lagi.`,
      { statusCode: 504, isRetryable: true },
    );
  }

  static rateLimit(message = 'Batas kuota harian permintaan AI telah tercapai.'): AIError {
    return new AIError('RATE_LIMIT', message, {
      statusCode: 429,
      isRetryable: false,
    });
  }

  static invalidOutput(message: string, details?: unknown): AIError {
    return new AIError(
      'INVALID_OUTPUT',
      `Format hasil AI tidak valid: ${message}`,
      { statusCode: 422, isRetryable: false, details },
    );
  }

  static disabled(message = 'Fitur AI sedang dinonaktifkan.'): AIError {
    return new AIError('DISABLED', message, {
      statusCode: 403,
      isRetryable: false,
    });
  }

  static auth(message = 'Kunci API provider AI tidak valid atau belum dikonfigurasi.'): AIError {
    return new AIError('AUTHENTICATION_ERROR', message, {
      statusCode: 401,
      isRetryable: false,
    });
  }

  static safety(message = 'Permintaan ditolak oleh filter keamanan konten AI.'): AIError {
    return new AIError('SAFETY_VIOLATION', message, {
      statusCode: 400,
      isRetryable: false,
    });
  }

  static provider(message: string, statusCode = 502, cause?: unknown): AIError {
    return new AIError(
      'PROVIDER_ERROR',
      `Terjadi kesalahan pada layanan AI: ${message}`,
      { statusCode, cause, isRetryable: statusCode >= 500 },
    );
  }

  static inputTooLarge(message = 'Input teks terlalu panjang untuk diproses.'): AIError {
    return new AIError('INPUT_TOO_LARGE', message, {
      statusCode: 413,
      isRetryable: false,
    });
  }
}
