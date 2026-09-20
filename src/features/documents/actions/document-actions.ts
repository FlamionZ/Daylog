'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  documentSchema,
  type DocumentInput,
} from '../schemas/document-schema';

export interface DocumentRecord {
  id: string;
  user_id: string;
  internship_id: string;
  category: 'administration' | 'report' | 'certificate' | 'work_sample' | 'other';
  name: string;
  description: string | null;
  storage_path: string | null;
  external_url: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  document_date: string | null;
  created_at: string;
  updated_at: string;
}

export type DocumentActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
};

async function getActiveInternshipId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from('internships')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  return data?.id || null;
}

export async function getDocuments(filter?: {
  category?: string;
  search?: string;
}): Promise<DocumentRecord[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const internshipId = await getActiveInternshipId(supabase, user.id);
  if (!internshipId) return [];

  let query = supabase
    .from('documents')
    .select('*')
    .eq('internship_id', internshipId)
    .order('created_at', { ascending: false });

  if (filter?.category && filter.category !== 'all') {
    query = query.eq('category', filter.category);
  }

  if (filter?.search) {
    query = query.or(`name.ilike.%${filter.search}%,description.ilike.%${filter.search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching documents:', error);
    return [];
  }

  return (data as unknown as DocumentRecord[]) || [];
}

export async function createDocument(input: DocumentInput): Promise<DocumentActionResult> {
  const parsed = documentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Data dokumen tidak valid',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Kamu belum masuk.' };

  const internshipId = await getActiveInternshipId(supabase, user.id);
  if (!internshipId) return { success: false, error: 'Belum ada program magang aktif.' };

  const { data, error } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      internship_id: internshipId,
      category: parsed.data.category,
      name: parsed.data.name,
      description: parsed.data.description || null,
      storage_path: parsed.data.storagePath || null,
      external_url: parsed.data.externalUrl || null,
      mime_type: parsed.data.mimeType || null,
      size_bytes: parsed.data.sizeBytes || null,
      document_date: parsed.data.documentDate || null,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/documents');

  return {
    success: true,
    message: 'Dokumen berhasil ditambahkan.',
    data,
  };
}

export async function deleteDocument(id: string): Promise<DocumentActionResult> {
  const supabase = await createClient();

  // 1. Fetch document to check if it has a storage path
  const { data: doc } = await supabase
    .from('documents')
    .select('storage_path')
    .eq('id', id)
    .maybeSingle();

  // 2. Delete file from storage if present
  if (doc?.storage_path) {
    try {
      await supabase.storage.from('documents').remove([doc.storage_path]);
    } catch (e) {
      console.warn('Could not remove file from storage:', e);
    }
  }

  // 3. Delete database record
  const { error } = await supabase.from('documents').delete().eq('id', id);
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/documents');

  return {
    success: true,
    message: 'Dokumen berhasil dihapus.',
  };
}

export async function getSignedDownloadUrl(storagePath: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(storagePath, 60 * 15); // 15 minutes validity

  if (error) {
    console.error('Error creating signed download URL:', error);
    return null;
  }

  return data?.signedUrl || null;
}
