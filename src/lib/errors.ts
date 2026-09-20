/**
 * Application error taxonomy based on Architecture.md §13.
 * Each error type maps to a specific HTTP status code and user-facing message pattern.
 */

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    options?: { cause?: unknown; isOperational?: boolean },
  ) {
    super(message, { cause: options?.cause });
    this.code = code;
    this.statusCode = STATUS_MAP[code];
    this.isOperational = options?.isOperational ?? true;
    this.name = 'AppError';
  }
}

const STATUS_MAP: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

/**
 * User-facing error messages in Indonesian.
 * Do not expose internal details in production.
 */
const USER_MESSAGES: Record<ErrorCode, string> = {
  VALIDATION_ERROR: 'Data yang dikirim tidak valid. Periksa kembali input Anda.',
  UNAUTHENTICATED: 'Sesi Anda telah berakhir. Silakan login kembali.',
  FORBIDDEN: 'Anda tidak memiliki akses ke data ini.',
  NOT_FOUND: 'Data yang dicari tidak ditemukan.',
  CONFLICT: 'Data sudah ada atau terjadi konflik. Coba lagi.',
  RATE_LIMITED: 'Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.',
  INTERNAL_ERROR: 'Terjadi kesalahan. Silakan coba lagi nanti.',
};

export function getUserMessage(code: ErrorCode): string {
  return USER_MESSAGES[code];
}

/**
 * Type guard for AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Wrap unknown errors into AppError for consistent handling.
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) return error;

  const message =
    error instanceof Error ? error.message : 'An unexpected error occurred';

  return new AppError('INTERNAL_ERROR', message, {
    cause: error,
    isOperational: false,
  });
}
