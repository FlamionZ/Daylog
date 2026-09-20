'use client';

import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Upload,
  Link2,
  Calendar,
  Loader2,
  FileCheck,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  documentSchema,
  documentCategories,
  type DocumentInput,
} from '../schemas/document-schema';
import { createDocument } from '../actions/document-actions';
import { createClient } from '@/lib/supabase/browser';
import { todayInJakarta } from '@/lib/date';

interface DocumentUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const categoryLabels: Record<string, string> = {
  administration: 'Administrasi (Surat Pengantar, Form)',
  report: 'Laporan Magang',
  certificate: 'Sertifikat / Piagam',
  work_sample: 'Hasil Karya / Work Sample',
  other: 'Dokumen Lainnya',
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function DocumentUploadModal({
  open,
  onOpenChange,
  onSuccess,
}: DocumentUploadModalProps) {
  const [isPending, startTransition] = React.useTransition();
  const [uploadMode, setUploadMode] = React.useState<'file' | 'url'>('file');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState<string | null>(null);

  const form = useForm<DocumentInput>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      category: 'administration',
      name: '',
      description: '',
      documentDate: todayInJakarta(),
      storagePath: '',
      externalUrl: '',
      mimeType: '',
      sizeBytes: undefined,
    },
  });

  const categoryValue = useWatch({ control: form.control, name: 'category' });

  const resetModal = React.useCallback(() => {
    form.reset({
      category: 'administration',
      name: '',
      description: '',
      documentDate: todayInJakarta(),
      storagePath: '',
      externalUrl: '',
      mimeType: '',
      sizeBytes: undefined,
    });
    setSelectedFile(null);
    setUploadProgress(null);
    setUploadMode('file');
  }, [form]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetModal();
    }
    onOpenChange(isOpen);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Ukuran berkas melebihi batas maksimum 10MB.');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    if (!form.getValues('name')) {
      // Set default name without extension
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      form.setValue('name', cleanName);
    }
    form.setValue('mimeType', file.type || 'application/octet-stream');
    form.setValue('sizeBytes', file.size);
    form.setValue('externalUrl', '');
  };

  const handleSubmit = (data: DocumentInput) => {
    startTransition(async () => {
      try {
        let finalStoragePath = data.storagePath;

        // If file mode, upload to Supabase Storage first
        if (uploadMode === 'file' && selectedFile) {
          setUploadProgress('Mengunggah berkas ke penyimpanan cloud...');
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            toast.error('Kamu harus masuk terlebih dahulu.');
            return;
          }

          const uniquePath = `${user.id}/${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(uniquePath, selectedFile, {
              cacheControl: '3600',
              upsert: false,
              contentType: selectedFile.type,
            });

          if (uploadError) {
            console.error('Storage upload error:', uploadError);
            toast.error(`Gagal mengunggah berkas: ${uploadError.message}`);
            setUploadProgress(null);
            return;
          }

          finalStoragePath = uniquePath;
        }

        setUploadProgress('Menyimpan informasi dokumen...');
        const result = await createDocument({
          ...data,
          storagePath: uploadMode === 'file' ? finalStoragePath : undefined,
          externalUrl: uploadMode === 'url' ? data.externalUrl : undefined,
        });

        if (result.success) {
          toast.success(result.message);
          resetModal();
          onOpenChange(false);
          onSuccess?.();
        } else {
          toast.error(result.error || 'Gagal menyimpan dokumen');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
        toast.error(msg);
      } finally {
        setUploadProgress(null);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Dokumen Magang</DialogTitle>
          <DialogDescription>
            Simpan berkas administrasi, sertifikat, atau hasil karya magang kamu.
          </DialogDescription>
        </DialogHeader>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 border-b border-[hsl(var(--border))] pb-3">
          <button
            type="button"
            onClick={() => {
              setUploadMode('file');
              form.setValue('externalUrl', '');
            }}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-colors ${
              uploadMode === 'file'
                ? 'bg-[hsl(var(--primary))] text-white'
                : 'bg-[hsl(var(--surface))] text-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))]'
            }`}
          >
            <Upload className="size-3.5" />
            Unggah Berkas Fisik
          </button>

          <button
            type="button"
            onClick={() => {
              setUploadMode('url');
              form.setValue('storagePath', '');
              setSelectedFile(null);
            }}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-colors ${
              uploadMode === 'url'
                ? 'bg-[hsl(var(--primary))] text-white'
                : 'bg-[hsl(var(--surface))] text-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))]'
            }`}
          >
            <Link2 className="size-3.5" />
            Tautan Cloud / Drive
          </button>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-1">
          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="doc-category">Kategori Dokumen</Label>
            <Select
              value={categoryValue}
              onValueChange={(v) => form.setValue('category', v as DocumentInput['category'])}
              disabled={isPending}
            >
              <SelectTrigger id="doc-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {documentCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {categoryLabels[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="doc-name">Nama Dokumen</Label>
            <Input
              id="doc-name"
              placeholder="Contoh: Surat Pengantar Magang Kampus"
              disabled={isPending}
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-[hsl(var(--destructive))]">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* File Input (if file mode) */}
          {uploadMode === 'file' && (
            <div className="space-y-1.5">
              <Label htmlFor="doc-file">Pilih Berkas (Maks. 10MB)</Label>
              <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 text-center">
                <input
                  id="doc-file"
                  type="file"
                  onChange={handleFileChange}
                  disabled={isPending}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
                />
                <label
                  htmlFor="doc-file"
                  className="flex flex-col items-center justify-center cursor-pointer gap-2"
                >
                  {selectedFile ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-[hsl(var(--primary))]">
                      <FileCheck className="size-5" />
                      <span>{selectedFile.name}</span>
                      <span className="text-[hsl(var(--muted))]">
                        ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className="size-6 text-[hsl(var(--muted))]" />
                      <span className="text-xs font-medium text-[hsl(var(--foreground))]">
                        Klik untuk memilih berkas dari perangkat
                      </span>
                      <span className="text-[10px] text-[hsl(var(--muted))]">
                        Format: PDF, Word, Excel, Gambar, atau ZIP
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* URL Input (if url mode) */}
          {uploadMode === 'url' && (
            <div className="space-y-1.5">
              <Label htmlFor="doc-url">Tautan Eksternal (URL)</Label>
              <Input
                id="doc-url"
                placeholder="https://drive.google.com/... atau https://figma.com/..."
                disabled={isPending}
                {...form.register('externalUrl')}
              />
              {form.formState.errors.externalUrl && (
                <p className="text-xs text-[hsl(var(--destructive))]">
                  {form.formState.errors.externalUrl.message}
                </p>
              )}
            </div>
          )}

          {/* Document Date */}
          <div className="space-y-1.5">
            <Label htmlFor="doc-date">Tanggal Dokumen (Opsional)</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 size-4 text-[hsl(var(--muted))]" />
              <Input
                id="doc-date"
                type="date"
                className="pl-9"
                disabled={isPending}
                {...form.register('documentDate')}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="doc-desc">Deskripsi / Catatan Tambahan (Opsional)</Label>
            <Textarea
              id="doc-desc"
              placeholder="Catatan mengenai isi atau tujuan dokumen ini..."
              rows={2}
              disabled={isPending}
              {...form.register('description')}
            />
          </div>

          {uploadProgress && (
            <div className="flex items-center gap-2 text-xs text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] p-2.5 rounded-lg">
              <Loader2 className="size-3.5 animate-spin" />
              <span>{uploadProgress}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending || (uploadMode === 'file' && !selectedFile)}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Dokumen'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
