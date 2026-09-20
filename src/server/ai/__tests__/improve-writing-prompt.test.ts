import { describe, it, expect } from 'vitest';
import {
  improveWritingSchema,
  buildImproveWritingPrompt,
  IMPROVE_WRITING_SYSTEM_PROMPT,
  type ImproveWritingMode,
} from '../prompts/improve-writing';

describe('Improve Writing Prompt & Schema', () => {
  it('should validate an improved text response', () => {
    const sample = {
      improvedText: 'Teks yang telah disempurnakan dengan gaya profesional.',
    };

    const parsed = improveWritingSchema.safeParse(sample);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.improvedText).toBe(sample.improvedText);
    }
  });

  it('should reject non-string improvedText', () => {
    const sample = {
      improvedText: 42,
    };

    const parsed = improveWritingSchema.safeParse(sample);
    expect(parsed.success).toBe(false);
  });

  it('should build prompt for all 5 modes', () => {
    const modes: ImproveWritingMode[] = [
      'polish',
      'professional',
      'summarize',
      'clarify',
      'grammar',
    ];

    for (const mode of modes) {
      const prompt = buildImproveWritingPrompt('saya ngerjain modul auth kemarin', mode);
      expect(prompt).toContain('Instruksi Khusus:');
      expect(prompt).toContain('saya ngerjain modul auth kemarin');
      expect(prompt).toContain('format JSON');
    }
  });

  it('should enforce anti-hallucination and technical retention in system prompt', () => {
    expect(IMPROVE_WRITING_SYSTEM_PROMPT).toContain('Pertahankan seluruh fakta asli');
    expect(IMPROVE_WRITING_SYSTEM_PROMPT).toContain('DILARANG KERAS menambahkan hasil');
    expect(IMPROVE_WRITING_SYSTEM_PROMPT).toContain('Pertahankan istilah teknis');
  });
});
