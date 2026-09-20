'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  loginWithPasswordSchema,
  loginWithOtpSchema,
  signUpSchema,
  type LoginWithPasswordInput,
  type LoginWithOtpInput,
  type SignUpInput,
} from '../schemas/login-schema';

export type AuthActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function signInWithPassword(
  input: LoginWithPasswordInput,
): Promise<AuthActionResult> {
  const parsed = loginWithPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Input tidak valid',
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      if (error.message === 'Invalid login credentials') {
        return { success: false, error: 'Email atau kata sandi salah.' };
      }
      if (error.message.toLowerCase().includes('email not confirmed')) {
        return {
          success: false,
          error: 'Email belum dikonfirmasi. Silakan cek kotak masuk atau folder spam email kamu.',
        };
      }
      return { success: false, error: error.message };
    }
  } catch (err: unknown) {
    console.error('Error in signInWithPassword:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Terjadi kesalahan pada server autentikasi.',
    };
  }

  redirect('/dashboard');
}

export async function signInWithOtp(
  input: LoginWithOtpInput,
): Promise<AuthActionResult> {
  const parsed = loginWithOtpSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Input tidak valid',
    };
  }

  try {
    const supabase = await createClient();
    const headerList = await import('next/headers').then((m) => m.headers());
    const host = headerList.get('x-forwarded-host') || headerList.get('host');
    const proto = headerList.get('x-forwarded-proto') || 'https';
    const appUrl = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: {
        emailRedirectTo: `${appUrl}/callback`,
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes('rate limit')) {
        return {
          success: false,
          error: 'Terlalu banyak permintaan magic link. Silakan tunggu beberapa menit.',
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Tautan login telah dikirim ke email kamu.',
    };
  } catch (err: unknown) {
    console.error('Error in signInWithOtp:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Terjadi kesalahan pada server autentikasi.',
    };
  }
}

export async function resetPasswordForEmail(
  email: string,
): Promise<AuthActionResult> {
  const parsed = loginWithOtpSchema.safeParse({ email });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Email tidak valid',
    };
  }

  try {
    const supabase = await createClient();
    const headerList = await import('next/headers').then((m) => m.headers());
    const host = headerList.get('x-forwarded-host') || headerList.get('host');
    const proto = headerList.get('x-forwarded-proto') || 'https';
    const appUrl = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${appUrl}/callback?next=/settings`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: 'Tautan pemulihan kata sandi telah dikirim ke email kamu.',
    };
  } catch (err: unknown) {
    console.error('Error in resetPasswordForEmail:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Terjadi kesalahan pada server autentikasi.',
    };
  }
}

export async function signUpWithPassword(
  input: SignUpInput,
): Promise<AuthActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Input tidak valid',
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: parsed.data.fullName,
        },
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes('user already registered')) {
        return {
          success: false,
          error: 'Email ini sudah terdaftar. Silakan langsung masuk dengan kata sandi.',
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Pendaftaran berhasil. Silakan cek email untuk verifikasi atau langsung login.',
    };
  } catch (err: unknown) {
    console.error('Error in signUpWithPassword:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Terjadi kesalahan pada server autentikasi.',
    };
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
