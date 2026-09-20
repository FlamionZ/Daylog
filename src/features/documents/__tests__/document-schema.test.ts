import { describe, it, expect } from 'vitest';
import { documentSchema } from '../schemas/document-schema';

describe('Document Schema', () => {
  it('validates a document with cloud storage path', () => {
    const result = documentSchema.safeParse({
      category: 'report',
      name: 'Laporan Magang Bulan ke-1.pdf',
      description: 'Laporan magang bulanan yang telah ditandatangani',
      documentDate: '2026-09-20',
      storagePath: 'user-id/123_laporan.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1048576,
    });
    expect(result.success).toBe(true);
  });

  it('validates a document with external URL', () => {
    const result = documentSchema.safeParse({
      category: 'work_sample',
      name: 'Repositori Proyek Magang',
      description: 'Source code di GitHub',
      documentDate: '2026-09-20',
      externalUrl: 'https://github.com/my-org/project',
    });
    expect(result.success).toBe(true);
  });

  it('rejects document when both storagePath and externalUrl are missing', () => {
    const result = documentSchema.safeParse({
      category: 'certificate',
      name: 'Sertifikat Magang',
      documentDate: '2026-09-20',
    });
    expect(result.success).toBe(false);
  });

  it('rejects document when both storagePath and externalUrl are provided simultaneously', () => {
    const result = documentSchema.safeParse({
      category: 'certificate',
      name: 'Sertifikat Magang',
      documentDate: '2026-09-20',
      storagePath: 'user-id/cert.pdf',
      externalUrl: 'https://example.com/cert.pdf',
    });
    expect(result.success).toBe(false);
  });

  it('rejects document with invalid external URL format', () => {
    const result = documentSchema.safeParse({
      category: 'other',
      name: 'Tautan Rusak',
      documentDate: '2026-09-20',
      externalUrl: 'not-a-valid-url',
    });
    expect(result.success).toBe(false);
  });
});
