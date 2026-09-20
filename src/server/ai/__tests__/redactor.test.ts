import { describe, it, expect } from 'vitest';
import {
  hasSensitiveData,
  redactText,
  redactObject,
} from '../safety/redactor';

describe('Redaction Engine', () => {
  it('detects and redacts Google API keys', () => {
    const text = 'Kunci saya adalah AIzaSyD1234567890abcdef1234567890abcde';
    const detection = hasSensitiveData(text);
    expect(detection.detected).toBe(true);
    expect(detection.matchedTypes).toContain('Google API Key');

    const result = redactText(text);
    expect(result.redactedText).toContain('[REDACTED_API_KEY]');
    expect(result.redactedText).not.toContain('AIzaSyD');
  });

  it('detects and redacts OpenAI API keys', () => {
    const text = 'API key: sk-proj-1234567890abcdef1234567890abcdef123456';
    const detection = hasSensitiveData(text);
    expect(detection.detected).toBe(true);

    const result = redactText(text);
    expect(result.redactedText).toContain('[REDACTED_API_KEY]');
  });

  it('detects and redacts GitHub personal access tokens', () => {
    const text = 'Token: ghp_1234567890abcdefghijklmnopqrstuvwxyz123456';
    const result = redactText(text);
    expect(result.redactedText).toContain('[REDACTED_TOKEN]');
  });

  it('detects and redacts Bearer tokens', () => {
    const text = 'Header: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abcdef12345';
    const result = redactText(text);
    expect(result.redactedText).toContain('Bearer [REDACTED_TOKEN]');
    expect(result.redactedText).not.toContain('eyJhbGci');
  });

  it('detects and redacts database connection strings', () => {
    const text = 'Hubungkan ke postgres://postgres:password123@localhost:5432/maganghub';
    const detection = hasSensitiveData(text);
    expect(detection.detected).toBe(true);
    expect(detection.matchedTypes).toContain('Connection String');

    const result = redactText(text);
    expect(result.redactedText).toContain('[REDACTED_CONNECTION_STRING]');
    expect(result.redactedText).not.toContain('password123');
  });

  it('detects and redacts RSA private keys', () => {
    const text = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA0Y81...
-----END RSA PRIVATE KEY-----`;
    const result = redactText(text);
    expect(result.redactedText).toBe('[REDACTED_PRIVATE_KEY]');
  });

  it('detects and redacts email addresses and phone numbers', () => {
    const text = 'Hubungi rakha@tigaserangkai.co.id atau 081234567890 jika ada kendala.';
    const result = redactText(text);
    expect(result.redactedText).toContain('[REDACTED_EMAIL]');
    expect(result.redactedText).toContain('[REDACTED_PHONE]');
    expect(result.redactedText).not.toContain('rakha@tigaserangkai.co.id');
    expect(result.redactedText).not.toContain('081234567890');
  });

  it('does not falsely redact regular technical notes', () => {
    const text = 'Hari ini saya mengerjakan integrasi Supabase Auth dan merapikan komponen tombol.';
    const detection = hasSensitiveData(text);
    expect(detection.detected).toBe(false);

    const result = redactText(text);
    expect(result.redactedText).toBe(text);
    expect(result.redactedCount).toBe(0);
  });

  it('recursively redacts nested objects and arrays', () => {
    const payload = {
      title: 'Tugas Presensi',
      notes: 'Gunakan email admin@example.com untuk test',
      subtasks: [
        { desc: 'Token: ghp_1234567890abcdefghijklmnopqrstuvwxyz123456' },
      ],
      config: {
        db: 'postgres://user:pass@localhost:5432/db',
      },
    };

    const redacted = redactObject(payload);
    expect(redacted.notes).toContain('[REDACTED_EMAIL]');
    expect(redacted.subtasks[0].desc).toContain('[REDACTED_TOKEN]');
    expect(redacted.config.db).toContain('[REDACTED_CONNECTION_STRING]');
  });
});
