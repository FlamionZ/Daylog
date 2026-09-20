export interface RedactionResult {
  redactedText: string;
  redactedCount: number;
  matchedTypes: string[];
}

export interface SensitiveDetectionResult {
  detected: boolean;
  matchedTypes: string[];
}

interface SensitivePattern {
  name: string;
  regex: RegExp;
  replacement: string;
}

const SENSITIVE_PATTERNS: SensitivePattern[] = [
  // Private Keys (RSA, EC, OpenSSH)
  {
    name: 'Private Key',
    regex: /-----BEGIN (?:[A-Z ]+)?PRIVATE KEY-----[\s\S]*?-----END (?:[A-Z ]+)?PRIVATE KEY-----/g,
    replacement: '[REDACTED_PRIVATE_KEY]',
  },
  // Database Connection Strings
  {
    name: 'Connection String',
    regex: /(?:postgres|postgresql|mysql|mongodb(?:\+srv)?|redis|sqlite):\/\/[^\s"'<>]+/gi,
    replacement: '[REDACTED_CONNECTION_STRING]',
  },
  // Google API Keys
  {
    name: 'Google API Key',
    regex: /AIza[0-9A-Za-z_-]{30,45}/g,
    replacement: '[REDACTED_API_KEY]',
  },
  // OpenAI API Keys
  {
    name: 'OpenAI API Key',
    regex: /sk-(?:proj-)?[a-zA-Z0-9_-]{32,}/g,
    replacement: '[REDACTED_API_KEY]',
  },
  // GitHub Tokens
  {
    name: 'GitHub Token',
    regex: /gh[pousr]_[A-Za-z0-9_]{36,}/g,
    replacement: '[REDACTED_TOKEN]',
  },
  // AWS Access Key ID
  {
    name: 'AWS Access Key',
    regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g,
    replacement: '[REDACTED_AWS_KEY]',
  },
  // Bearer Tokens
  {
    name: 'Bearer Token',
    regex: /(?:Bearer|bearer)\s+[a-zA-Z0-9_\-\.]{20,}/g,
    replacement: 'Bearer [REDACTED_TOKEN]',
  },
  // JWT Tokens (Header.Payload.Signature)
  {
    name: 'JWT Token',
    regex: /eyJ[A-Za-z0-9-_]{10,}\.eyJ[A-Za-z0-9-_]{10,}\.[A-Za-z0-9-_.+/=]{10,}/g,
    replacement: '[REDACTED_JWT_TOKEN]',
  },
  // Password / Secret in Key-Value format (e.g. password = "xyz", secret: 'abc')
  {
    name: 'Password/Secret',
    regex: /(?:password|passwd|pwd|client_secret|api_secret)\s*[:=]\s*['"]?[^\s"',;]{4,}['"]?/gi,
    replacement: '[REDACTED_SECRET]',
  },
  // Email Addresses
  {
    name: 'Email Address',
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: '[REDACTED_EMAIL]',
  },
  // Indonesian Phone Numbers (+628..., 628..., 08...)
  {
    name: 'Phone Number',
    regex: /(?:\+62|62|0)8[1-9][0-9]{7,10}\b/g,
    replacement: '[REDACTED_PHONE]',
  },
];

/**
 * Checks if the given text contains any sensitive patterns.
 */
export function hasSensitiveData(text: string): SensitiveDetectionResult {
  if (!text || typeof text !== 'string') {
    return { detected: false, matchedTypes: [] };
  }

  const matchedTypes: string[] = [];

  for (const pattern of SENSITIVE_PATTERNS) {
    // Reset lastIndex for stateful global regexes
    pattern.regex.lastIndex = 0;
    if (pattern.regex.test(text)) {
      matchedTypes.push(pattern.name);
    }
  }

  return {
    detected: matchedTypes.length > 0,
    matchedTypes,
  };
}

/**
 * Scans text and replaces all recognized sensitive patterns with redaction tokens.
 */
export function redactText(text: string): RedactionResult {
  if (!text || typeof text !== 'string') {
    return { redactedText: text || '', redactedCount: 0, matchedTypes: [] };
  }

  let redactedText = text;
  let redactedCount = 0;
  const matchedTypes: Set<string> = new Set();

  for (const pattern of SENSITIVE_PATTERNS) {
    pattern.regex.lastIndex = 0;
    const matches = redactedText.match(pattern.regex);
    if (matches && matches.length > 0) {
      redactedCount += matches.length;
      matchedTypes.add(pattern.name);
      redactedText = redactedText.replace(pattern.regex, pattern.replacement);
    }
  }

  return {
    redactedText,
    redactedCount,
    matchedTypes: Array.from(matchedTypes),
  };
}

/**
 * Recursively redacts all string values in an object or array.
 */
export function redactObject<T>(value: T): T {
  if (typeof value === 'string') {
    return redactText(value).redactedText as unknown as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactObject(item)) as unknown as T;
  }

  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = redactObject(val);
    }
    return result as T;
  }

  return value;
}
